import * as fs from "fs";
import { SerialPort } from "serialport";
import paths from "../util/paths";

export const cacheSerialPath = (serialPath: string) => {
  if (!fs.existsSync(serialPath)) {
    console.log(`The serial path ${serialPath} does not currently exist`);
    SerialPort.list().then((list) => {
      if (list.length == 0) {
        console.log("No serial devices found");
        return;
      }

      console.log(`Try using one of these:`);
      for (const pathItem of list) {
        if (pathItem.productId) {
          console.log(pathItem.path);
        }
      }
    });
  }
  fs.mkdirSync(paths.getRrivCtlDir(), { recursive: true });
  // if(!fs.existsSync(defaultSerialFile())){
  //   fs.
  // }
  fs.writeFileSync(paths.defaultSerialFile(), serialPath);
  console.log("Connected to RRIV device");
};
