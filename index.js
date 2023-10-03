const app = require('./app')
const { sdk } = require('@symblai/symbl-js');
const server = require('http').createServer(app)
const PORT = 3001
const socketIo = require('./socketIo')

const appId = process.env.SYMBL_APP_ID;
const appSecret = process.env.SYMBL_APP_SECRET;
sdk.init({
  appId: appId,
  appSecret: appSecret,
  basePath: 'https://api.symbl.ai',
}).then(() => {
  console.log('SDK initialized')
  socketIo(server, sdk)
}).catch(e => {
  console.error('error = ', e.message)
})

server.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}!`)
})
