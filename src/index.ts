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

function readSerialUntilQuit(serialPath: string, file: string) {

  const homedir = require('os').homedir();

  const dir = path.join(homedir, ".rriv", "watch");
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
  const serialPort = new SerialPort({
    path: serialPath, //'/dev/serial/by-id/usb-RRIV_RRIV_Data_Logger__rriv-if00',
    baudRate: 57600,
  });
  serialPort.write("{\"object\":\"datalogger\", \"action\":\"set_mode\", \"mode\":\"quiet\"}\n");
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


cli.parse(process.argv)


