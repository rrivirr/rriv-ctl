import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { flashInitialFirmware } from "../../modules/firmware/flash.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { italic, yellowBright } from "yoctocolors";
import { provisionDevice, registerEui } from "../../api/device.ts";
import { logAsDebug } from "../../util/debug-logger.ts";
import { getBoardVersion } from "../../util/get-device-details.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const provisionAction = async (options: any) => {
  const { factory, skip, firmwareVersion } = options;

  let result;

  if (!factory) {
    console.log(`${yellowBright("checking for connected rriv devices...")}`);
    result = await oraPromise(() =>
      getConnectedDevice({
        provisionCommand: true,
      }),
    );
  }

  let uid = result?.uid;
  let serialPortPath = result?.serialPortPath;
  let boardVersion = "";

  if (uid && serialPortPath) {
    boardVersion = await oraPromise(() => getBoardVersion(serialPortPath));
  }

  if (!skip) {
    await flashInitialFirmware(boardVersion, firmwareVersion);
  }

  if (!uid) {
    console.log(`${yellowBright("checking for connected rriv devices...")}`);
    const connectedDevice = await oraPromise(() =>
      getConnectedDevice({
        provisionCommand: true,
      }),
    );
    uid = connectedDevice?.uid;
    serialPortPath = connectedDevice?.serialPortPath;
  }
  if (!uid) {
    throw new Error(
      "No uid found. unplug and plug back in the device or press the reset button on the device\nthen run provision command again",
    );
  }
  const matched = uid.match(/^[0-9A-Fa-f]{24}$/g);
  if (!matched) {
    throw new Error(`invalid uid received: ${uid}`);
  }
  const device = await oraPromise(() => provisionDevice({ uid }));
  logAsDebug("setting serial number on device...");
  await oraPromise(() =>
    sendCommands(
      [
        JSON.stringify({
          action: "set",
          object: "device",
          serial_number: device.serialNumber,
        }),
      ],
      false,
      serialPortPath,
    ),
  );
  console.log(
    `device successfully provisioned
  run ${italic("rrivctlv2 connect -a <name to assign device in current context>")}
  to connect the device to your account`,
  );
};

export const registerEuiAction = async () => {
  let eui;

  const [result1] = await oraPromise(() =>
    sendCommands(
      [JSON.stringify({ object: "telemeter", action: "get" })],
      false,
    ),
  );
  if (result1.message) {
    // try again
    const [result2] = await oraPromise(() =>
      sendCommands(
        [JSON.stringify({ object: "telemeter", action: "get" })],
        false,
      ),
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
  await oraPromise(() => registerEui({ eui, deviceId: id }));
  console.log("successful");
};
