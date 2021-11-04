export const log = (...messages) => {
	const now = new Date()
	console.log(
		`[${now.toLocaleDateString()} ${now.toLocaleTimeString()}] ${messages
			.map((message) => String(message))
			.join(' ')}`,
	)
}
