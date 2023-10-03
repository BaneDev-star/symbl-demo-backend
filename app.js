const { sdk } = require('@symblai/symbl-js');
const uuid = require('uuid').v4;
require('dotenv').config();

const mic = require('mic')
const sampleRateHertz = 16000

// START changing values here.

const appId = process.env.SYMBL_APP_ID;
const appSecret = process.env.SYMBL_APP_SECRET;

const config = {
  meetingTitle: '<TITLE>',
  sampleRateHertz: sampleRateHertz
}

const speaker = {
  name: '<NAME>',
  userId: '<EMAIL>'
}

// STOP changing values here.

const insightTypes = [
  'question',
  'action_item',
  'follow_up',
  'topic'
]

const micInstance = mic({
  rate: sampleRateHertz,
  channels: '1',
  debug: false,
  exitOnSilence: 6,
});

// Need unique ID and best to use uuid in production
// const connectionId = uuid()
const connectionId = Buffer.from(appId).toString('base64'); // for testing

(async () => {
  try {
    // Initialize the SDK
    await sdk.init({
      appId: appId,
      appSecret: appSecret,
      basePath: 'https://api.symbl.ai',
    })

    // Start Real-time Request (Uses Real-time WebSocket API behind the scenes)
    const connection = await sdk.startRealtimeRequest({
      id: connectionId,
      speaker: speaker,
      insightTypes: insightTypes,
      config: config,
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
            console.log('Live: ', punctuated && punctuated.transcript)
          }
        }
      }
    });

    // Logs conversationId which is used to access the conversation afterwards
    console.log('Successfully connected. Conversation ID: ', connection.conversationId);

    const micInputStream = micInstance.getAudioStream()
    /** Raw audio stream */
    micInputStream.on('data', (data) => {
      // Push audio from Microphone to websocket connection
      connection.sendAudio(data)
    })

    micInputStream.on('error', function (err) {
      console.log('Error in Input Stream: ' + err)
    })

    micInputStream.on('startComplete', function () {
      console.log('Started listening to Microphone.')
    })

    micInputStream.on('silence', function () {
      console.log('Got SIGNAL silence')
    })

    micInstance.start()

    setTimeout(async () => {
      // Stop listening to microphone
      micInstance.stop()
      console.log('Stopped listening to Microphone.')
      try {
        // Stop connection
        await connection.stop()
        console.log('Connection Stopped.')
      } catch (e) {
        console.error('Error while stopping the connection.', e)
      }
    }, 120 * 1000) // Stop connection after 2 minute i.e. 120 secs
  } catch (err) {
    console.error('Error: ', err)
  }
})();