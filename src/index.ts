#!/usr/bin/env node
import { Command } from 'commander'
import { description, version } from '../package.json'
import { SerialPort, ReadlineParser } from 'serialport';
import * as fs from 'fs';
import moment from 'moment'
import path from 'path'

let cli = new Command()

cli
  .name('rrivctl')
  .description(description)
  .version('1.0', '-v, --version')

cli
  .command('test')
  .description('test command')
  .action(() => {
    console.log('test command called')
  })


function getRRIVDir(){
  const homedir = require('os').homedir();
  return path.join(homedir, ".rriv");
}

function connectSerial(serialPath: string){
  return new SerialPort({
    path: serialPath,
    baudRate: 57600,
  });


}

function readSerialUntilQuit(serialPath: string, file: string) {


  const dir = path.join(getRRIVDir(), "watch");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }


  const logPath = path.join(dir, file)
  const dirPath = logPath.substring(0, logPath.lastIndexOf("/"));
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  console.log(`Watching output and logging sensor data to ${logPath}\n`)



  const parser = new ReadlineParser({
    delimiter: '\n',
    includeDelimiter: false
  })
  const serialPort = connectSerial(serialPath);
  serialPort.write("{\"object\":\"datalogger\", \"action\":\"set_mode\", \"mode\":\"quiet\"}\n");
  // TODO: note sure if drain, timeout, and flush are all necessary
  // TODO: this has to do with waiting for the serial port to open and flushing existing input to make a nice file output
  serialPort.drain(() => {

    setTimeout(() => {
      serialPort.flush();
      serialPort.pipe(parser)
      serialPort.write("{\"object\":\"datalogger\", \"action\":\"set_mode\", \"mode\":\"watch\"}\n");
    }, 1000);
  });

  parser.on('data', function (data: String) {
    console.log(data);
    if (data[0] == '{') {
      // skip this line
      return;
    }

    fs.writeFileSync(
      logPath,
      moment().format() + ',' + data.toString() + '\n',
      {
        flag: "a"
      })
  });

}


cli
  .command('watch')
  .description('watch data output and log to a file')
  .option('-f, --file <file>', 'name of a file to output sensor data to')
  .option('-p, --path <serial_path>', 'serial path of the RRIV device')
  .option('--project <project>', 'a project name for organizing watch files')
  .action((options) => {

    let file = options.file
    let project = options.project

    if (!project) {
      project = "rriv";
    }

    if (!file) {
      // file = path.join(project, project + "_" + moment().format('YYYY-MM-DDTHH:mm') + "_watch.txt")
      file = project + "_" + moment().format('YYYY-MM-DDTHH:mm') + "_watch.txt"
    }

    if (!options.path) {
      SerialPort.list().then((list) => {

        // detect the serial port
        let serialPortPath = "";
        for (const pathItem of list) {
          if (pathItem.productId && pathItem.pnpId?.includes('rriv')) {
            console.log(`Found a RRIV device ${pathItem.pnpId}`)
            console.log(`Connecting to it at ${pathItem.path}`)
            serialPortPath = pathItem.path
          }
        }
        if (serialPortPath === "") {
          console.log("No RRIV device found")
          console.log("Try using -p <path> to specify the path to the RRIV serial device")
        }

        readSerialUntilQuit(serialPortPath, file);

      })
    } else {
      readSerialUntilQuit(options.path, file);

    }
  })


cli
  .command('set')
  .argument('<object>')
  .argument('[properities]', 'JSON representation of properties')
  .option('-p, --path <serial_path>', 'serial path of the RRIV device')
  .description('set values on an object or create an object')
  .action((object, properties) => {
    console.log(object)
    console.log(properties)
    let payload = JSON.parse(properties);
    payload.object = object;
    payload.action = 'set';
    let payloadString = JSON.stringify(payload) + '\n'

    const serialPath = getSerialPathFromCache();
    const serialPort = connectSerial(serialPath.toString());
    serialPort.write(payloadString);
  })


function getRrivCtlDir(){
  return path.join(getRRIVDir(), '.rrivctl');
}

function defaultSerialFile(){
  return path.join(getRrivCtlDir(), 'default_serial');
}

function cacheSerialPath(serialPath: string){
  if(!fs.existsSync(serialPath)){
    console.log(`The serial path ${serialPath} does not currently exist`);
    SerialPort.list().then((list) => {
      if(list.length == 0){
        console.log("No serial devices found");
        return;
      }

      console.log(`Try using one of these:`);
      for (const pathItem of list) {
        if(pathItem.productId){
          console.log(pathItem.path);
        }
      }
    });
  }
  fs.mkdirSync(getRrivCtlDir(), { recursive: true})
  // if(!fs.existsSync(defaultSerialFile())){
  //   fs.
  // }
  fs.writeFileSync(defaultSerialFile(), serialPath);
  console.log("Connected to RRIV device");
}

function getSerialPathFromCache(){
  const defaultSerial = path.join(getRrivCtlDir(), 'default_serial')
  const serialPath = fs.readFileSync(defaultSerial);
  return serialPath;
}

cli
  .command('connect')
  .option('-p, --path <serial_path>', 'serial path of the RRIV device')
  .action((options) => {
    if (!options.path) {
      SerialPort.list().then((list) => {

        // detect the serial port
        let serialPortPath = "";
        for (const pathItem of list) {
          if (pathItem.productId && pathItem.pnpId?.includes('rriv')) {
            console.log(`Found a RRIV device ${pathItem.pnpId}`)
            console.log(`Connecting to it at ${pathItem.path}`)
            serialPortPath = pathItem.path
          }
        }
        if (serialPortPath === "") {
          console.log("No RRIV device found")
          console.log("Try using -p <path> to specify the path to the RRIV serial device")
        }

        cacheSerialPath(serialPortPath);

      })
    } else {
      cacheSerialPath(options.path);
    }
  })

cli.parse(process.argv)


