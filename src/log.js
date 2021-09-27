export const log = (message) => {
	const now = new Date()
	console.log(
		`[${now.toLocaleDateString()} ${now.toLocaleTimeString()}] ${message}`,
	)
}
