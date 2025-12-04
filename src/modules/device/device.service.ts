import Table from "cli-table3";
import {
  unbindDevice as unbindDeviceApiCall,
  getDevices as getDevicesApiCall,
} from "../../api/device.ts";
import db from "../../db/db.ts";
import { pronounce } from "../../util/console-log.ts";
import { listContextDevices } from "../context/device-context.service.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const unbindDevice = async (serialNumber: string) => {
  const { email } = getActiveUser();

  await unbindDeviceApiCall({ serialNumber });

  db.update((data) => {
    data[email].deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
    data[email].device = {
      id: "",
      serialNumber: "",
      uniqueName: "",
      serialPortPath: "",
    };
  });
  console.log("device removed from your account successfully");
};

export const listDevices = async (all?: boolean) => {
  const {
    device: { id: deviceId },
  } = getActiveUser();

  if (all) {
    const devices = await getDevicesApiCall({});
    if (devices.length) {
      const table = new Table({
        head: [
          "id",
          "uniqueName",
          "serialNumber",
          "context",
          "assignedDeviceName",
        ],
      });
      for (const { id, uniqueName, serialNumber, DeviceContext } of devices) {
        const assignedDeviceName = DeviceContext[0]?.assignedDeviceName;
        const name = DeviceContext[0]?.Context?.name;

        if (id === deviceId) {
          table.push([
            pronounce(id),
            pronounce(uniqueName),
            pronounce(serialNumber),
            pronounce(name),
            pronounce(assignedDeviceName),
          ]);
        } else {
          table.push([id, uniqueName, serialNumber, name, assignedDeviceName]);
        }
      }
      console.log("\n" + table.toString());
    } else {
      console.log("no devices found bound to you");
    }
  } else {
    await listContextDevices();
  }
};
