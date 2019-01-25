import React, { Component } from 'react';
import './App.css';
import classNames from 'classnames'
import Dropzone from 'react-dropzone'
const chokidar = window.require('chokidar');
const fs = window.require('fs');

var watcher = chokidar.watch(`FHIR`, {
    ignored: /(^|[/\\])\../,
    persistent: true
});

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      files: [],
      totalBinary: 0,
      filename : "", 
      status : "not ok",
      data : ""
    }
  }

  componentDidMount() {
    watcher
      .on('add', path => {
          this.setState({
              files : path
          });
          this.checkFile(path)
      })
  }

  checkFile(path) {
    var extension = path.substr((path.lastIndexOf('.') +1));
    if (/(pdf)$/ig.test(extension)) {
      
      this.uploadFile(path)
    }
  }
  
      
  async uploadFile(path){
    this.state.filename = this.state.files.replace(/^.*[\\\/]/, '')

    await fs.readFile(path, async (err, data) => {
            if (err) {
                console.error(err);
            }
            this.setState({data})
          });
    await fetch('https://fhirtest.uhn.ca/baseDstu3/Binary', { method: 'POST', body: this.state.data })
          
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


        <Dropzone onDrop={(oneFile)=>this.onDrop(oneFile)}>
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
