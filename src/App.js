import React, { Component } from 'react';
import './App.css';
import classNames from 'classnames'
import Dropzone from 'react-dropzone'
const chokidar = window.require('chokidar');
const fs = window.require('fs');
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

var watcher = chokidar.watch(`FHIR`, {
    ignored: /(^|[/\\])\../,
    persistent: true
});

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      files: [],
      path : "",
      totalBinary: 0,
      filename : "", 
      status : "not ok",
      data : ""
    }
  }

  componentDidMount() {
    watcher
      .on('add', (path, stats) => {
        if(stats.size < 2000000){
          this.setState({path});
          this.checkFile(path)
        }
      })
  }

  async onDrop(files){
    // console.log("file dropped")
    await this.setState({files});
    console.log("state.files", this.state.files[0].name)
    this.setState({filename : this.state.files[0].name.replace(/^.*[\\\/]/, '')})
    this.uploadFile(this.state.files[0])
  }
  
  checkFile(path) {
    var extension = path.substr((path.lastIndexOf('.') +1));
    if (/(pdf)$/ig.test(extension)) {
      this.convertPathToFile(path)
    }
  }
  
  async convertPathToFile(path){
    const data = await readFile(path)
       this.setState({
        data,
        filename : this.state.path.replace(/^.*[\\\/]/, '')
      });
      // console.log('path', this.state.path, 'filename', this.state.filename, 'data', this.state.data)
    
    this.uploadFile(this.state.data)
  }
  
  async uploadFile(file){
    // console.log("uploading file....")
    const rep = await fetch('https://fhirtest.uhn.ca/baseDstu3/Binary', { method: 'POST', body: file })
    // console.log("file uploaded!", rep)
    this.setState({status : "ok"})
    this.findTotalBinary()
  }

  async findTotalBinary(){
    const totalHistory = await fetch("http://hapi.fhir.org/baseDstu3/Binary/_history?_format=json")
    const { total } = await totalHistory.json()
    this.setState({totalBinary : total})
  }

  render() {
    
    const {status, totalBinary, filename}= this.state

    return (
      <div className="App">
        <header className="App-header">
        Lifen Frontend Test
        </header>
          <Dropzone onDrop={(oneFile)=>this.onDrop(oneFile)} >
          {({getRootProps, getInputProps, isDragActive}) => {
            return (
              <div
                {...getRootProps()}
                className={classNames('dropzone', {'dropzone--isActive': isDragActive})}
              >
                <input {...getInputProps()} />
                {
                  isDragActive ?
                    <p>Drop files here...</p> :
                    <p>Try dropping some files here, or click to select files to upload.</p>
                }
              </div>
            )
          }}
        </Dropzone>

        <div>
            <h4>File</h4>
            <p>{filename}</p>
            <p>Status : {status}</p>
            <h4>Total number of files uploaded :</h4>
            <p>{totalBinary}</p>
        </div>

      </div>
    );
  }
}

export default App;
