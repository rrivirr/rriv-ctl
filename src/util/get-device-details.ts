import { bold, yellow } from "yoctocolors";
import { sendCommands } from "../infra/send-commands.ts";

export const getDeviceDetails = async (path: string) => {
  const result = await sendCommands(
    [JSON.stringify({ object: "device", action: "get" })],
    false,
    path,
  );

  const { serial_number, uid, codes } = result[0];
  if (codes && codes.length) {
    console.log(
      `${yellow("Warning!")} Device codes raised: ${bold(codes.join(","))}`,
    );
  }
  return { serialNumber: serial_number, uid };
};

export const getBoardVersion = async (path: string) => {
  const result = await sendCommands(
    [JSON.stringify({ object: "board", action: "get", parameter: "version" })],
    false,
    path,
  );

  const { message } = result[0];
  return JSON.parse(message).fv;
};
