const socketIo = require('socket.io')
require('dotenv').config();
const uuid = require('uuid').v4;
const sampleRateHertz = 16000
// START changing values here.

const config = {
  meetingTitle: 'My Test Meeting1',
  confidenceThreshold: 0.7,
  timezoneOffset: 480, // Offset in minutes from UTC
  languageCode: 'en-US',
  sampleRateHertz
}

// STOP changing values here.

const insightTypes = [
  'question',
  'action_item'
]

var connection = null;
module.exports = (server, sdk) => {
  const io = socketIo(server, {
    cors: {
      origin: '*',
    },
  })

  io.on('connection', async (socket) => {
    console.log('socket connected', socket.id)

    io.use(async (socket, next) => {
      console.log('io use')
      const connectionId = uuid()
      try {
        // Start Real-time Request (Uses Real-time WebSocket API behind the scenes)
        connection = await sdk.startRealtimeRequest({
          id: connectionId,
          insightTypes: insightTypes,
          config: config,
          noConnectionTimeout: 0,
          disconnectOnStopRequest: true,
          disconnectOnStopRequestTimeout: 0,
          handlers: {
            /**
             * This will return live speech-to-text transcription of the call.
             * There are other handlers that can be seen in the full example.
             */
            onSpeechDetected: (data) => {
              if (data) {
                const {
                  punctuated
                } = data
                console.log('Live: ', data)
                if (punctuated && punctuated.transcript) {
                  socket.emit('speech-detect', { data })
                }
              }
            }
          }
        });
        socket.connection = connection
        console.log('Successfully connected. Conversation ID - : ', socket.id, connection.conversationId);
        next()
      } catch (e) {
        console.log('error')
      }
    })


    socket.on('speech', ({ data }) => {
      if (socket.connection) {
        // console.log(connection)
        socket.connection.sendAudio(data)
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('disconnect reason = ', socket.id, reason)
      if (socket.connection) {
        socket.connection.stop();
        socket.connection = null
      }
    })
  })
}