import React, { Component } from 'react';
import './App.css';
import classNames from 'classnames'
import Dropzone from 'react-dropzone'
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const { ipcRenderer } = window.require('electron')


class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      files: [],
      status : "", 
      totalBinary: 0,
    }
  }
  componentDidMount() {
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg) // Prints 'whoooooooh!'
    })
   }

  onDrop(filename) {
    this.setState({files : filename});
    this.uploadFile(filename)
  }

  async uploadFile(file){
    await fetch('https://fhirtest.uhn.ca/baseDstu3/Binary', { method: 'POST', body: file })
    this.setState({status : "ok"})
    this.findTotalBinary()
  }

  async findTotalBinary(){
    const totalHistory = await fetch("http://hapi.fhir.org/baseDstu3/Binary/_history?_format=json")
    const { total } = await totalHistory.json()

    this.setState({totalBinary : total})
  }



  render() {
    const files = this.state.files.map(file => (
      <li key={file.name}>
        {file.name}
      </li>
    ))
    const {status, totalBinary}= this.state
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

      <aside>
          <h4>File</h4>
          <ul>{files}</ul>
          <p>{status}</p>
          <h4>Total number of files uploaded :</h4>
          <p>{totalBinary}</p>

          
        </aside>

      </div>
    );
  }
}

export default App;
