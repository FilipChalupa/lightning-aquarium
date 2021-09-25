import dotenv from 'dotenv'
import express from 'express'
import lnService from 'ln-service'
import { createInvoice } from './createInvoice'

dotenv.config()

const { CERT, INVOICE_MACAROON, SOCKET, PORT } = process.env

const { lnd } = lnService.authenticatedLndGrpc({
	cert: CERT,
	macaroon: INVOICE_MACAROON,
	socket: SOCKET,
})

const app = express()

app.use(express.static('public'))

app.listen(PORT)

if (false) {
	createInvoice(lnd, 1000, 'Fish food', 15)
}
