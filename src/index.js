import dotenv from 'dotenv'
import admin from 'firebase-admin'
import fs from 'fs'
import lnService from 'ln-service'
import path from 'path'
import { createInvoice } from './createInvoice.js'
import { log } from './log.js'

const serviceAccount = JSON.parse(
	fs.readFileSync(path.resolve('./firebase-adminsdk.json')),
)

dotenv.config()

const { CERT, INVOICE_MACAROON, SOCKET, NODE_ENV } = process.env
const isDevelopment = NODE_ENV === 'development'
const isProduction = !isDevelopment

const { lnd } = lnService.authenticatedLndGrpc({
	cert: CERT,
	macaroon: INVOICE_MACAROON,
	socket: SOCKET,
})

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})

const prefixCollectionName = (name) => `${isDevelopment ? 'dev-' : ''}${name}`

const db = admin.firestore()
db.collection(prefixCollectionName('invoiceRequests'))
	.limit(1)
	.onSnapshot((querySnapshot) => {
		querySnapshot.forEach(async (doc) => {
			const { type } = doc.data()
			const { id } = doc
			doc.ref.delete()
			if (type === 'fishFood') {
				log('Fish food invoice requested')
				const invoiceRef = db
					.collection(prefixCollectionName('invoices'))
					.doc(id)

				const request = await createInvoice(
					lnd,
					1000,
					isProduction ? 'Fish food' : 'Food fish test',
					15,
					() => {
						log('🐟🎉 Fish food invoice paid')
						invoiceRef.update({
							paidAt: admin.firestore.FieldValue.serverTimestamp(),
						})
					},
				)

				await invoiceRef.create({
					request,
					type,
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
				})
			} else {
				log(`Unknown invoice request type "${type}"`)
			}
		})
	})
