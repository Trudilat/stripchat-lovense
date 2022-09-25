'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const axios = require('axios');
let lovenseIp;

const server = async () => {
  // Require everything needed for the API
  var express = require('express');
  var api = express();
  var bodyParser = require('body-parser');
  api.use(bodyParser.json());
  const port = 7345;
  var cors = require('cors')
  api.use(cors())

  let queue = [];
  let watchingStreamer = false;

  let usedIds = [];
  const loop2 = async (username) => {
    let lastTime = undefined;
    while (watchingStreamer) {
      await axios({
        method: 'get',
        url: 'https://stripchat.com/api/front/v2/models/username/' + username + '/chat',
      }).then(async (response) => {
        if (response.data.messages.length > 0) {
          if (lastTime === undefined) {
            lastTime = new Date(response.data.messages[response.data.messages.length - 1].createdAt);
          }
          const messages = response.data.messages;
          for (let i = 0; i < messages.length; i++) {
            if (new Date(messages[i].createdAt) > lastTime) {
              if (messages[i].type === 'lovense') {
                // console.log(messages[i].details.lovenseDetails.detail);
                if (!usedIds.includes(messages[i].id)) {
                  queue.push(messages[i].details.lovenseDetails.detail);
                  usedIds.push(messages[i].id);
                  // If there are over 200 ids in the array, remove the first one
                  if (usedIds.length > 200) {
                    usedIds.shift();
                  }
                }
              }
            }
          }
          lastTime = new Date(messages[messages.length - 1].createdAt);
          console.log('----------------------------------');
          console.log(queue);
        }
      }).catch((error) => {
        console.log("Something went wrong fetching the messages");
        lastTime = undefined;
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const loop = async (lovenseIp) => {
    while (watchingStreamer) {
      await new Promise(resolve => setTimeout(resolve, 250));
      if (queue.length > 0) {
        let object = queue[0];
        let mode = object.power;
        if (object.specialActualValue !== undefined) {
          mode = object.specialActualValue;
        }
        if (object.specialActualValue !== undefined) {
          await axios({
            method: 'post',
            url: 'http://' + lovenseIp + ':20010/command',
            data: {
              "command": "Preset",
              "name": object.specialActualValue, // pulse, wave, fireworks, earthquake
              "timeSec": object.time + 1,
              "apiVer": 1
            }
          })
        } else {
          await axios({
            method: 'post',
            url: 'http://' + lovenseIp + ':20010/command',
            data: {
              command: "Function",
              action: "Vibrate:" + powerTable[mode],
              timeSec: object.time + 1,
              apiVer: 1,
            }
          })
        }
        // Wait for the correct amount of time
        await new Promise(resolve => setTimeout(resolve, object.time * 1000));
        // Remove the first item from the queue
        queue.shift();
      }
    }
  }
  const powerTable = {
    "low": 5,
    "medium": 10,
    "high": 15,
    "ultraHigh": 20
  }

  api.post('/api/watchstreamer', async (req, res) => {
    if (!req.body.username || !req.body.lovenseIp) {
      res.status(400).send({
        error: 'Missing username or lovenseIp'
      })
      return;
    }
    if (!watchingStreamer) {
      console.log('Attempting connection to lovense using ip: ' + req.body.lovenseIp);
      lovenseIp = req.body.lovenseIp
      watchingStreamer = true
      loop(lovenseIp)
      loop2(req.body.username)
      res.status(200).send('Started watching streamer');
      while (watchingStreamer) {
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
      axios({
        method: 'post',
        url: 'http://' + lovenseIp + ':20010/command',
        data: {
          command: "Function",
          action: "Stop",
          timeSec: 1,
          apiVer: 1
        }
      }).catch(() => {
        console.log('Attempted to stop vibrator but it was already stopped');
      })
      watchingStreamer = false
      queue = [];
    } else {
      res.status(200).send('Already watching streamer');
    }
  })

  api.post('/api/stop', async (req, res) => {
    axios({
      method: 'post',
      url: 'http://' + lovenseIp + ':20010/command',
      data: {
        command: "Function",
        action: "Stop",
        timeSec: 1,
        apiVer: 1
      }
    }).catch(() => {
      console.log('Attempted to stop vibrator but it was already stopped');
    })
    watchingStreamer = false
    queue = [];
    res.status(200).send('Stopped watching streamer');
  })

  api.get('/api/iswatching', async (req, res) => {
    res.status(200).send(watchingStreamer);
  })

  api.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`)
  });
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }

  })
  win.removeMenu()

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    axios({
      method: 'post',
      url: 'http://' + lovenseIp + ':20010/command',
      data: {
        command: "Function",
        action: "Stop",
        timeSec: 1,
        apiVer: 1
      }
    }).catch(() => {
      console.log('Attempted to stop vibrator but it was already stopped');
    })
    app.quit()

  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  server()
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        axios({
          method: 'post',
          url: 'http://' + lovenseIp + ':20010/command',
          data: {
            command: "Function",
            action: "Stop",
            timeSec: 1,
            apiVer: 1
          }
        }).catch(() => {
          console.log('Attempted to stop vibrator but it was already stopped');
        })
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      axios({
        method: 'post',
        url: 'http://' + lovenseIp + ':20010/command',
        data: {
          command: "Function",
          action: "Stop",
          timeSec: 1,
          apiVer: 1
        }
      }).catch(() => {
        console.log('Attempted to stop vibrator but it was already stopped');
      })
      app.quit()
    })
  }
}
