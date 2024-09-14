#!/usr/bin/env node
import { Argument, Command } from 'commander'
import { description, version } from '../package.json'
import { SerialPort, ReadlineParser } from 'serialport';
import * as fs from 'fs';
import moment from 'moment'
import path from 'path'
import serialCommands from './util/serial_commands';

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
  serialPort.write(serialCommands.quietModeCommand);
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


      const serialPortPath = getSerialPathFromCache();
      readSerialUntilQuit(serialPortPath.toString(), file);
      // const serialPort = connectSerial(serialPath.toString());
      // SerialPort.list().then((list) => {

      //   // detect the serial port
      //   let serialPortPath = "";
      //   for (const pathItem of list) {
      //     if (pathItem.productId && pathItem.pnpId?.includes('rriv')) {
      //       console.log(`Found a RRIV device ${pathItem.pnpId}`)
      //       console.log(`Connecting to it at ${pathItem.path}`)
      //       serialPortPath = pathItem.path
      //     }
      //   }
      //   if (serialPortPath === "") {
      //     console.log("No RRIV device found")
      //     console.log("Try using -p <path> to specify the path to the RRIV serial device")
      //   }

      //   readSerialUntilQuit(serialPortPath, file);

      // })
    } else {
      readSerialUntilQuit(options.path, file);

    }
  })

  cli
  .command('list')
  .addArgument(new Argument('<object>').choices(['sensor', 'actuator', 'telemeter']))
  .description('get values on an object or create an object')
  .action((object) => {

    const serialPath = getSerialPathFromCache();
    const serialPort = connectSerial(serialPath.toString());
    serialPort.write(serialCommands.quietModeCommand);

    const parser = new ReadlineParser({
      delimiter: '\n',
      includeDelimiter: false
    })
    parser.on('data', function (data: String) {
      console.log(data);
      if (data[0] == '{') {
        // skip this line
        return;
      } else {
        // process.exit();
      }
  
    });
    serialPort.pipe(parser);

    let payload = new Map();
    payload.set('object', object);
    payload.set('action', 'list');

    let payloadString = JSON.stringify(Object.fromEntries(payload)) + '\n'
    console.log(payloadString);
    serialPort.write(payloadString);


  });

cli
  .command('get')
  .addArgument(new Argument('<object>').choices(['sensor', 'actuator', 'telemeter']))
  .argument('[id]')
  .description('get values on an object or create an object')
  .action((object, id) => {


    const serialPath = getSerialPathFromCache();
    const serialPort = connectSerial(serialPath.toString());
    serialPort.write(serialCommands.quietModeCommand);

    const parser = new ReadlineParser({
      delimiter: '\n',
      includeDelimiter: false
    })
    parser.on('data', function (data: String) {
      console.log(data);
      if (data[0] == '{') {
        // skip this line
        return;
      } else {
        // process.exit();
      }
  
    });
    serialPort.pipe(parser);

    let payload = new Map();
    payload.set('object', object);
    payload.set('action', 'get');
    if(id){
      console.log(id);
      payload.set('id', id)
    }
    let payloadString = JSON.stringify(Object.fromEntries(payload)) + '\n'
    console.log(payloadString);
    serialPort.write(payloadString);


  });

cli
  .command('set')
  .addArgument(new Argument('<object>').choices(['sensor', 'actuator', 'telemeter']))
  .argument('[id]')
  .argument('[property]')
  .argument('[property_value]')
  // .argument('[properities]', 'JSON representation of properties')
  // .option('-p, --path <serial_path>', 'serial path of the RRIV device')
  // .option('-t, --type [type]')
  // .option('--burst-size [burst_size]')
  // .option('--warm-up-delay [warm_up_delay]')
  // .option('-o, --property [sensor_properties...]')
  .option('-f, --file <file>')
  .description('set values on an object or create an object')
  .action((object, id, property, property_value, options) => {
    console.log(object)
    console.log(id)
    
    // let props = 
    let payload = new Map();
    payload.set('object', object);
    payload.set('action', 'set');
    if(id){
      console.log(id);
      payload.set('id', id)
    }

    if(property && property_value){
      payload.set(property, property_value);
    } else {

      const properties = fs.readFileSync(options['file'])
      console.log(properties.toString())
      const propertiesObject = JSON.parse(properties.toString());
      console.log(propertiesObject);
      Object.keys(propertiesObject).forEach((key) => {
        payload.set(key, propertiesObject[key as keyof typeof properties])
      })

    }


    let payloadString = JSON.stringify(Object.fromEntries(payload)) + '\n'
    console.log(payloadString);

    const serialPath = getSerialPathFromCache();
    const serialPort = connectSerial(serialPath.toString());
    serialPort.write(serialCommands.quietModeCommand);


    const parser = new ReadlineParser({
      delimiter: '\n',
      includeDelimiter: false
    })
    parser.on('data', function (data: String) {
      console.log(data);
      if (data[0] == '{') {
        // skip this line
        return;
      } else {
        // process.exit();
      }
  
    });
    serialPort.pipe(parser);
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


cli
  .command('debug')
  .action(() => {


    const serialPortPath = getSerialPathFromCache();
    const parser = new ReadlineParser({
      delimiter: '\n',
      includeDelimiter: false
    })
    const serialPort = connectSerial(serialPortPath.toString());


    parser.on('data', function (data: String) {
      console.log(data);
    });

    serialPort.pipe(parser)

  })

  