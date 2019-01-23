// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const fetch = require('node-fetch')

let mainWindow

var chokidar = require('chokidar');

function checkFile(file) {
    var extension = file.substr((file.lastIndexOf('.') +1));
    if (/(pdf)$/ig.test(extension)) {
        uploadFile(file)
    }
}

const uploadFile = async (file) => {
    await fetch('https://fhirtest.uhn.ca/baseDstu3/Binary', { method: 'POST', body: file });
    findTotalBinary(file)
}

const findTotalBinary = async (file) => {
    const totalHistory = await fetch("http://hapi.fhir.org/baseDstu3/Binary/_history?_format=json")
    const { total } = await totalHistory.json()
    const filename = file.replace(/^.*[\\\/]/, '')
    console.log("what is it?",filename)
    mainWindow.webContents.send("checktotal" , filename)
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