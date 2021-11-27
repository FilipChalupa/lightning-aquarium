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

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})

const prefixCollectionName = (name) => `${isDevelopment ? 'dev-' : ''}${name}`

const db = admin.firestore()
const invoiceRequestsCollection = db.collection(
	prefixCollectionName('invoiceRequests'),
)

log('Starting server')

// @TODO remove stale requests
invoiceRequestsCollection.limit(1).onSnapshot((querySnapshot) => {
	const { lnd } = lnService.authenticatedLndGrpc({
		cert: CERT,
		macaroon: INVOICE_MACAROON,
		socket: SOCKET,
	})
	querySnapshot.forEach(async (doc) => {
		const { type, ...data } = doc.data()
		const { id } = doc
		doc.ref.delete()
		let request = null
		const invoiceRef = db.collection(prefixCollectionName('invoices')).doc(id)
		if (type === 'fishFood') {
			log('Fish food invoice requested')
			request = await createInvoice(
				lnd,
				100,
				15,
				() => {
					log('🐟🎉 Fish food invoice paid')
					invoiceRef.update({
						paidAt: admin.firestore.FieldValue.serverTimestamp(),
					})
				},
				isProduction ? 'Fish food' : 'Fish food test',
			)
		} else if (type === 'lnurl') {
			log('LNURL invoice requested')
			request = await createInvoice(
				lnd,
				data.amount / 1000,
				15,
				() => {
					log('⚡🎉 LNURL invoice paid')
					invoiceRef.update({
						paidAt: admin.firestore.FieldValue.serverTimestamp(),
					})
				},
				'[["text/identifier","ln@filipchalupa.cz"],["text/plain","Pay to ln@filipchalupa.cz"]]',
				true,
			)
		} else {
			log(`Unknown invoice request type "${type}"`)
		}
		if (request) {
			await invoiceRef.create({
				request,
				type,
				createdAt: admin.firestore.FieldValue.serverTimestamp(),
			})
		}
	})
})
