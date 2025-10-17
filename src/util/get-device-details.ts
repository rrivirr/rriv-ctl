import { sendCommands } from "../infra/send-commands.ts";

export const getDeviceDetails = async (path: string) => {
  const result = await sendCommands(
    [JSON.stringify({ object: "device", action: "get" })],
    false,
    path
  );

  const { serial_number, uid } = result[0];
  return { serialNumber: serial_number, uid };
};
