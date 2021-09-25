import { WebSocketServer } from 'ws'
import { createInvoice } from './createInvoice.js'

export const createWebSocketServer = (server, lnd) => {
	const wss = new WebSocketServer({ server })

	wss.on('connection', (ws) => {
		ws.isAlive = true

		ws.on('pong', () => {
			ws.isAlive = true
		})

		const send = (message) => {
			ws.send(message)
		}

		ws.on('message', async (message) => {
			const [command] = message.toString().split(';')
			if (command === 'createFishFoodInvoice') {
				const invoiceRequest = await createInvoice(
					lnd,
					1000,
					'Fish food',
					15,
					() => {
						send('fishFoodPaid')
					},
				)
				send(`fishFoodInvoice;${invoiceRequest}`)
			} else {
				console.log('Unknown command')
			}
		})
	})

	const loop = () => {
		wss.clients.forEach((ws) => {
			if (!ws.isAlive) {
				return ws.terminate()
			}
			ws.isAlive = false
			ws.ping(null, false, true)
		})
		setTimeout(loop, 10000)
	}
	loop()
}
