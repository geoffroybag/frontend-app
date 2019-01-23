// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const fetch = require('node-fetch')
const fs = require('fs')
const { ipcMain } = require('electron')
let mainWindow

var chokidar = require('chokidar');

function checkFile(path) {
  var extension = path.substr((path.lastIndexOf('.') +1));
  if (/(pdf)$/ig.test(extension)) {
    
    uploadFile(path)
  }
}

const uploadFile = async (pathname) => {
  
  const file = await fs.readFile(pathname, 'utf8',async (err, data) => {
    const response = await fetch(`https://fhirtest.uhn.ca/baseDstu3/Binary`, {
      method: 'POST',
      body: data,
    })
    console.log("hu", (data))

      ipcMain.on('asynchronous-message', (event, arg) => {
        console.log("hi", arg)
        ipcMain.send('asynchronous-reply', 'pong')
      })

  
})}



const findTotalBinary = async () => {
    const totalHistory = await fetch("http://hapi.fhir.org/baseDstu3/Binary/_history?_format=json")
    const { total } = await totalHistory.json()
}


function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600})
    
  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000')
  
  var watcher = chokidar.watch(`${process.env.HOME}/FHIR`, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  
  watcher
  .on('add', path => checkFile(path))
 
  mainWindow.on('closed', function () {
      mainWindow = null
    })
}






app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})







