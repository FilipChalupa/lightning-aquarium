const $invoice = document.querySelector('.invoice')
const $invoiceQr = $invoice.querySelector('.invoice__qr')
const $invoiceRawValue = $invoice.querySelector('.invoice__rawValue')
const $invoiceCopy = $invoice.querySelector('.invoice__copy')
const $aquarium = document.querySelector('.aquarium')
const $fishes = document.querySelectorAll('.fish')
const fishes = Array.from($fishes).map(($fish) => ({
	// @TODO: initialize from api
	size: 0.8 * Math.random(),
	x: Math.random(),
	y: Math.random(),
	speed: 0.002 + Math.random() * 0.002,
	goingUp: Math.random() < 0.5,
	goingLeft: Math.random() < 0.5,
	color: Math.random(),
	$element: $fish,
}))
let isFeeding = false

fishes.forEach((fish) => {
	const slowDownRatio = 10
	fish.$element.addEventListener('mouseenter', () => {
		fish.speed /= slowDownRatio
	})
	fish.$element.addEventListener('mouseleave', () => {
		fish.speed *= slowDownRatio
	})
})

const qrcode = new QRCode($invoiceQr, {
	text: '',
	width: 250,
	height: 250,
	correctLevel: QRCode.CorrectLevel.M,
})

const updateInvoice = (request) => {
	qrcode.makeCode(request)
	$invoice.classList.remove('invoice--loading')
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
		$invoice.classList.remove('invoice--paid')
	} else if (command === 'fishFoodPaid') {
		$invoice.classList.add('invoice--paid')
		setTimeout(() => {
			ws.send('createFishFoodInvoice')
		}, 5000)
		feed()
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
	fish.$element.style.setProperty('--color', `${fish.color}`)
}

const feed = (() => {
	let timer
	return () => {
		clearTimeout(timer)
		isFeeding = true

		$aquarium.querySelectorAll('.food').forEach(($food) => $food.remove())
		const count = Math.floor(10 + Math.random() * 10)
		for (let i = 0; i < count; i++) {
			const $food = document.createElement('div')
			$food.classList.add('food')
			$food.style.setProperty('--x', Math.random())
			$food.style.setProperty('--size', Math.random())
			$aquarium.appendChild($food)
		}

		timer = setTimeout(() => {
			isFeeding = false
		}, 2000)
	}
})()

const loop = () => {
	fishes.forEach((fish) => {
		if (
			(fish.goingUp === true && fish.y === 0) ||
			(fish.goingUp === false && fish.y === 1) ||
			Math.random() < fish.speed * 3 ||
			(isFeeding && !fish.goingUp && fish.y > 0.2)
		) {
			fish.goingUp = !fish.goingUp
		}
		fish.y = Math.max(
			0,
			Math.min(
				1,
				fish.y +
					(fish.goingUp ? -1 : 1) * 0.7 * fish.speed * (isFeeding ? 2 : 1),
			),
		)
		if (
			(fish.goingLeft === true && fish.x === 0) ||
			(fish.goingLeft === false && fish.x === 1) ||
			Math.random() < fish.speed * 1.2 ||
			(isFeeding && fish.goingLeft && fish.x < 0.5)
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
