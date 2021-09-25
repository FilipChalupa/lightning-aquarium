const $invoice = document.querySelector('.invoice')
const $invoiceQr = $invoice.querySelector('.invoice__qr')
const $invoiceRawValue = $invoice.querySelector('.invoice__rawValue')
const $invoiceCopy = $invoice.querySelector('.invoice__copy')
const $fishes = document.querySelectorAll('.fish')
const fishes = Array.from($fishes).map(($fish) => ({
	// @TODO: initialize from api
	size: 0.2 * Math.random(),
	x: Math.random(),
	y: Math.random(),
	speed: 0.002 + Math.random() * 0.002,
	goingUp: Math.random() < 0.5,
	goingLeft: Math.random() < 0.5,
	$element: $fish,
}))

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

const renderFish = (fish) => {
	fish.$element.style.setProperty('--size', `${fish.size}`)
	fish.$element.style.setProperty('--x', `${fish.x}`)
	fish.$element.style.setProperty('--y', `${fish.y}`)
	fish.$element.style.setProperty(
		'--goingLeft',
		`${fish.goingLeft ? '1' : '0'}`,
	)
}

const loop = () => {
	fishes.forEach((fish) => {
		if (
			(fish.goingUp === true && fish.y === 0) ||
			(fish.goingUp === false && fish.y === 1) ||
			Math.random() < fish.speed * 3
		) {
			fish.goingUp = !fish.goingUp
		}
		fish.y = Math.max(
			0,
			Math.min(1, fish.y + (fish.goingUp ? -1 : 1) * 0.7 * fish.speed),
		)
		if (
			(fish.goingLeft === true && fish.x === 0) ||
			(fish.goingLeft === false && fish.x === 1) ||
			Math.random() < fish.speed * 1.2
		) {
			fish.goingLeft = !fish.goingLeft
		}
		fish.x = Math.max(
			0,
			Math.min(1, fish.x + (fish.goingLeft ? -1 : 1) * fish.speed),
		)
		renderFish(fish)
	})
	requestAnimationFrame(loop)
}
loop()
