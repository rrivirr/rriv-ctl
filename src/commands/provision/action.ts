import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { flashInitialFirmware } from "../../modules/firmware/flash.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { italic } from "yoctocolors";
import { provisionDevice } from "../../api/device.ts";
import { logAsDebug } from "../../util/debug-logger.ts";
import { getBoardVersion } from "../../util/get-device-details.ts";

export const provisionAction = async () => {
  const result = await getConnectedDevice({
    provisionCommand: true,
  });

  let uid = result?.uid;
  let serialPortPath = result?.serialPortPath;
  let boardVersion = "";

  if (uid && serialPortPath) {
    boardVersion = await getBoardVersion(serialPortPath);
  }

  await flashInitialFirmware(boardVersion);
  logAsDebug("device successfully flashed...");

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
  const device = await provisionDevice({ uid });
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
