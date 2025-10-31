import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { flashInitialFirmware } from "../../modules/firmware/flash.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { italic } from "yoctocolors";
import { provisionDevice } from "../../api/device.ts";
import { logAsDebug } from "../../util/debug-logger.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const provisionAction = async (options: any) => {
  const { path } = options;
  const { serialPortPath, uid } = await getConnectedDevice({
    specifiedSerialPortPath: path,
    provisionCommand: true,
  });
  const { accessToken } = getActiveUser();

  await flashInitialFirmware(serialPortPath);
  logAsDebug("device successfully flashed...");
  const device = await provisionDevice({ uid, accessToken });
  logAsDebug("setting serial number on device...");
  await sendCommands(
    [
      JSON.stringify({
        action: "set",
        object: "device",
        serial_number: device.serialNumber,
      }),
    ],
    false,
    serialPortPath
  );
  console.log(
    `device successfully provisioned
  run ${italic("rrivctl connect -a <name to assign device in current context>")}
  to connect the device to your account`
  );
};
