const { sdk } = require('@symblai/symbl-js');
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const uuid = require('uuid').v4;
const fs = require('fs')

app.use(express.static(path.resolve(__dirname, '..', '/build')))
require('dotenv').config();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
  } else {
    next()
  }
})

const appId = process.env.SYMBL_APP_ID;
const appSecret = process.env.SYMBL_APP_SECRET;
const sampleRateHertz = 16000
const config = {
  meetingTitle: 'My Test Meeting',
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
// sdk.init({
//   appId: appId,
//   appSecret: appSecret,
//   basePath: 'https://api.symbl.ai',
// }).then(async () => {
//   const connectionId = uuid()

//   // Start Real-time Request (Uses Real-time WebSocket API behind the scenes)
//   connection = await sdk.startRealtimeRequest({
//     id: connectionId,
//     insightTypes: insightTypes,
//     config: config,
//     handlers: {
//       /**
//        * This will return live speech-to-text transcription of the call.
//        * There are other handlers that can be seen in the full example.
//        */
//       onSpeechDetected: (data) => {
//         if (data) {
//           const {
//             punctuated
//           } = data
//           console.log('Live: ', punctuated && punctuated.transcript)
//         }
//       }
//     }
//   });
//   // Logs conversationId which is used to access the conversation afterwards
//   console.log('Successfully connected. Conversation ID2: ', connection.conversationId);
// }).catch(e => {
//   console.error('error = ', e.message);
// })


app.get('/speech', async (req, res) => {
  fs.readFile(path.resolve(__dirname, 'harvard.wav'), (err, blob) => {
    const buffer = blob;
    const size = buffer.toString().length
    for (let i = 0; i < buffer.toString().length; i += 8192) {
      setTimeout(() => {
        const subBuff = buffer.subarray(i, i + 8192 > size ? size : i + 8192)
        
        if (connection) {
          console.log('subBuff = ', subBuff.toString().length)
          connection.sendAudio(subBuff)
        }
      }, [100])
    }
    res.json({
      success: true
    })
  })
})

module.exports = app