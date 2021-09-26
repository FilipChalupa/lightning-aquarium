import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import lnService from 'ln-service'
import ngrok from 'ngrok'
import { createWebSocketServer } from './createWebSocketServer.js'

dotenv.config()

const { CERT, INVOICE_MACAROON, SOCKET, PORT, NODE_ENV } = process.env
const isDevelopment = NODE_ENV === 'development'
const isProduction = !isDevelopment

const { lnd } = lnService.authenticatedLndGrpc({
	cert: CERT,
	macaroon: INVOICE_MACAROON,
	socket: SOCKET,
})

const app = express()

const server = http.createServer(app)
createWebSocketServer(server, lnd)

app.use(express.static('public'))

server.listen(PORT, async () => {
	const port = server.address().port
	console.log(`Server started on port ${port}`)

	if (isProduction) {
		const publicUrl = await ngrok.connect({ addr: port })
		console.log(`Server running public at ${publicUrl}`)
	}
})
