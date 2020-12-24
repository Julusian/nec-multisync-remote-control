/* eslint-disable no-process-exit */
const { NecClient } = require('./dist')

const client = new NecClient({ debug: true })
client.on('log', (l) => console.log(`Conn: ${l}`))
client.connect('10.42.250.115', 'A')
client.on('connected', async () => {
	try {
		console.log('connected2')

		console.log('model')
		console.log(await client.sendGetStringCommand('MODEL'))

		console.log('serial')
		console.log(await client.sendGetStringCommand('SERIAL'))

		console.log('power')
		console.log(await client.sendGetCommand('POWER'))

		console.log(await client.sendSetCommand('POWER', 1)) // NecEnums.PowerModes.ON)

		console.log(await client.sendGetCommand('POWER'))
		console.log(await client.sendGetCommand('POWER'))
		console.log(await client.sendGetCommand('POWER'))

		console.log('\nbrightness')
		const brightness = await client.sendGetByKey('PICTURE.BRIGHTNESS')
		console.log('got brightness:', brightness)

		console.log(await client.sendSetByKey('PICTURE.BRIGHTNESS', brightness === 100 ? 50 : 100))

		console.log('done')
		await client.disconnect()
	} catch (e) {
		console.error(`err: ${e}`)
		process.exit(1)
	}
})
