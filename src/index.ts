#!/usr/bin/env node
import { Command } from 'commander'
import { description, version } from '../package.json'
import { SerialPort, ReadlineParser } from 'serialport';
import * as fs from 'fs';
import moment from 'moment'

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

function readSerialUntilQuit(path: string, file: string){

  console.log(`Watching output and logging sensor data to ${file}\n`)

  const parser = new ReadlineParser({
    delimiter: '\n',
    includeDelimiter: false
  })
  const serialPort = new SerialPort({
    path, //'/dev/serial/by-id/usb-RRIV_RRIV_Data_Logger__rriv-if00',
    baudRate: 57600,
  });
  serialPort.pipe(parser)

  parser.on('data', function (data: String) {
    console.log(data);



    fs.writeFileSync(file, moment().format() + ',' + data.toString() + '\n', {
      flag: "a"
    })
  });

}


cli
  .command('watch')
  .description('watch data output and log to a file')
  .option('-f, --file <file>', 'name of a file to output sensor data to')
  .option('-p, --path <serial_path>', 'serial path of the RRIV device')
  .action((options) => {
    console.log(options);
    // console.log(name);
    const file = options.file;

    if(!options.path){
      SerialPort.list().then((list) => {

        // detect the serial port
        let serialPortPath = "";
        for( const pathItem of list ){
          if( pathItem.productId && pathItem.pnpId?.includes('rriv')){
            console.log(`Found a RRIV device ${pathItem.pnpId}`)
            console.log(`Connecting to it at ${pathItem.path}`)
            serialPortPath = pathItem.path
          }
        }
        if(serialPortPath === ""){
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


