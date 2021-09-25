import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import lnService from 'ln-service'
import { createWebSocketServer } from './createWebSocketServer.js'

dotenv.config()

const { CERT, INVOICE_MACAROON, SOCKET, PORT } = process.env

const { lnd } = lnService.authenticatedLndGrpc({
	cert: CERT,
	macaroon: INVOICE_MACAROON,
	socket: SOCKET,
})

const app = express()

const server = http.createServer(app)
createWebSocketServer(server, lnd)

app.use(express.static('public'))

server.listen(PORT, () => {
	console.log(`Server started on port ${server.address().port}`)
})
