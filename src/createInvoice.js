import crypto from 'crypto'
import {
	createInvoice as createInvoiceLn,
	subscribeToInvoice,
} from 'ln-service'

export const createInvoice = async (
	lnd,
	tokens,
	expiresInMinutes,
	onPaid,
	description,
	hashDescription = false,
) => {
	const invoiceExpiresAt = new Date()
	invoiceExpiresAt.setMinutes(invoiceExpiresAt.getMinutes() + expiresInMinutes)
	const invoice = await createInvoiceLn({
		lnd,
		description: hashDescription ? undefined : description,
		expires_at: invoiceExpiresAt.toISOString(),
		tokens,
		description_hash: hashDescription
			? crypto.createHash('sha256').update(description).digest('hex')
			: undefined,
	})

	const subscription = subscribeToInvoice({ id: invoice.id, lnd })
	subscription.on('invoice_updated', async (invoice) => {
		if (invoice.confirmed_at) {
			onPaid()
		}
	})
	return invoice.request
}
