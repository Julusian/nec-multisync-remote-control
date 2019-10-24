const { NecClient, NecEnums } = require('./dist')

const client = new NecClient({ debug: true })
client.connect('10.42.250.115', 'A')
client.on('connected', async () => {
  console.log('connected2')

  console.log('model')
  await client.sendGetCommand('MODEL')

  console.log('serial')
  await client.sendGetCommand('SERIAL')

  console.log('power')
  await client.sendGetCommand('POWER')

  await client.sendSetCommand('POWER', 1) // NecEnums.PowerModes.ON)

  // await client.sendGetCommand('POWER')
  // await client.sendGetCommand('POWER')
  // await client.sendGetCommand('POWER')

  console.log('\nbrightness')
  const brightness = await client.sendGetByKey('PICTURE.BRIGHTNESS')
  console.log('got brightness:', brightness)

  await client.sendSetByKey('PICTURE.BRIGHTNESS', brightness === 100 ? 50 : 100)

  console.log('done')
})
