const $invoice = document.querySelector('.invoice')
const $invoiceQr = $invoice.querySelector('.invoice__qr')
const $invoiceRawValue = $invoice.querySelector('.invoice__rawValue')
const $invoiceCopy = $invoice.querySelector('.invoice__copy')

const qrcode = new QRCode($invoiceQr, {
	text: '',
	width: 250,
	height: 250,
	correctLevel: QRCode.CorrectLevel.M,
})

const updateInvoice = (request) => {
	qrcode.makeCode(request)
	$invoiceRawValue.value = request
}

$invoiceCopy.addEventListener('click', () => {
	navigator.clipboard.writeText($invoiceRawValue.value)
})

const ws = new WebSocket('ws://localhost:8000/')
ws.onopen = () => {
	ws.send('createFishFoodInvoice')
}
ws.onmessage = (event) => {
	const [command, data] = event.data.toString().split(';')
	if (command === 'fishFoodInvoice') {
		updateInvoice(data)
	} else if (command === 'fishFoodPaid') {
		$invoice.classList.add('invoice--paid')
	} else {
		console.log('Unknown command')
	}
}
