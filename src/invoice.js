import {
	createInvoice as createInvoiceLn,
	subscribeToInvoice,
} from 'ln-service'

export const createInvoice = async (
	lnd,
	tokens,
	description,
	expiresInMinutes,
) => {
	const invoiceExpiresAt = new Date()
	invoiceExpiresAt.setMinutes(invoiceExpiresAt.getMinutes() + expiresInMinutes)
	const invoice = await createInvoiceLn({
		lnd,
		description,
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
	return invoice.request
}
