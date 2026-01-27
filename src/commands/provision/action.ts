import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { flashInitialFirmware } from "../../modules/firmware/flash.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { italic } from "yoctocolors";
import { provisionDevice, registerEui } from "../../api/device.ts";
import { logAsDebug } from "../../util/debug-logger.ts";
import { getBoardVersion } from "../../util/get-device-details.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const provisionAction = async (options: any) => {
  const result = await getConnectedDevice({
    provisionCommand: true,
  });

  let uid = result?.uid;
  let serialPortPath = result?.serialPortPath;
  let boardVersion = "";

  if (uid && serialPortPath) {
    boardVersion = await getBoardVersion(serialPortPath);
  }

  if (!options.skip) {
    await flashInitialFirmware(boardVersion, options?.firmwareVersion);
  }

  if (!uid) {
    const connectedDevice = await getConnectedDevice({
      provisionCommand: true,
    });
    uid = connectedDevice?.uid;
    serialPortPath = connectedDevice?.serialPortPath;
  }
  if (!uid) {
    throw new Error(
      "unplug and plug back in the device or press the reset button on the device\nthen run provision command again",
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
    serialPortPath,
  );
  console.log(
    `device successfully provisioned
  run ${italic("rrivctlv2 connect -a <name to assign device in current context>")}
  to connect the device to your account`,
  );
};

export const registerEuiAction = async () => {
  let eui;

  const [result1] = await sendCommands(
    [JSON.stringify({ object: "telemeter", action: "get" })],
    false,
  );
  if (result1.message) {
    // try again
    const [result2] = await sendCommands(
      [JSON.stringify({ object: "telemeter", action: "get" })],
      false,
    );

    if (result2.message) {
      console.log(result2);
      process.exit();
    } else {
      logAsDebug(result2);
      eui = result1.dev_eui;
    }
  } else {
    logAsDebug(result1);
    eui = result1.dev_eui;
  }

  if (!eui) {
    console.log("no valid eui found");
    process.exit();
  }

  const {
    device: { id },
  } = getActiveUser();
  await registerEui({ eui, deviceId: id });
};
