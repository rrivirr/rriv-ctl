import { DefaultObject } from "../types.ts";
import { sendCommandAndEchoResponse } from "./send-command-and-echo-response.ts";

export const writeConfigToDevice = (payload: DefaultObject) => {
  const payloadString = JSON.stringify(payload) + "\n";
  console.log("payloadString", payloadString);

  sendCommandAndEchoResponse(payloadString);
};
