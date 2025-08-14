import { DefaultObject } from "../types.ts";
import { logToConsole } from "./console-log.ts";
import { sendCommandAndEchoResponse } from "./send-command-and-echo-response.ts";

export const writeConfigToDevice = (payload: DefaultObject) => {
  const payloadString = JSON.stringify(payload) + "\n";
  logToConsole("payloadString", payloadString);

  sendCommandAndEchoResponse(payloadString);
};
