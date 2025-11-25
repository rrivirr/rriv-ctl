import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { flashInitialFirmware } from "../../modules/firmware/flash.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { italic } from "yoctocolors";
import { provisionDevice } from "../../api/device.ts";
import { logAsDebug } from "../../util/debug-logger.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const provisionAction = async () => {
  const result = await getConnectedDevice({
    provisionCommand: true,
  });
  const { accessToken } = getActiveUser();

  await flashInitialFirmware();
  logAsDebug("device successfully flashed...");
  let uid = result?.uid;
  let serialPortPath = result?.serialPortPath;
  if (!uid) {
    const connectedDevice = await getConnectedDevice({
      provisionCommand: true,
    });
    uid = connectedDevice?.uid;
    serialPortPath = connectedDevice?.serialPortPath;
  }
  if (!uid) {
    throw new Error(
      "unplug and plug back in the device or press the reset button on the device\nthen run provision command again"
    );
  }
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
  run ${italic("rrivctlv2 connect -a <name to assign device in current context>")}
  to connect the device to your account`
  );
};
