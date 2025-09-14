import { DefaultObject } from "../types.ts";
import { sendCommands } from "../infra/send-commands.ts";

export const writeConfigToDevice = async (payload: DefaultObject) => {
  const payloadString = JSON.stringify({ ...payload, action: "set" }) + "\n";
  console.log("payloadString", payloadString);

  const appliedConfigs = await sendCommands([payloadString], false);
  return appliedConfigs[0];
};
