import dotenv from 'dotenv'
import lnService, { createInvoice, subscribeToInvoice } from 'ln-service'

dotenv.config()

const { CERT, INVOICE_MACAROON, SOCKET } = process.env

const { lnd } = lnService.authenticatedLndGrpc({
	cert: CERT,
	macaroon: INVOICE_MACAROON,
	socket: SOCKET,
})

const invoiceExpiresAt = new Date()
invoiceExpiresAt.setMinutes(invoiceExpiresAt.getMinutes() + 15) // Add 15 minutes
const tokens = 1000 // sats
const invoice = await createInvoice({
	lnd,
	description: 'fish food',
	expires_at: invoiceExpiresAt.toISOString(),
	tokens,
})

const subscription = subscribeToInvoice({ id: invoice.id, lnd })
subscription.on('invoice_updated', async (invoice) => {
	if (invoice.confirmed_at) {
		console.log("It's paid")
	}
})
console.log(invoice)
