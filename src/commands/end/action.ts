import { endContext } from "../../modules/context/context.service.ts";
import { endDeviceContext } from "../../modules/context/device-context.service.ts";

export const endAction = async (object: string) => {
  if (object === "context") {
    await endContext();
    console.log("current context ended successfully");
  } else if (object === "device-context") {
    await endDeviceContext();
    console.log("device removed from current context successfully");
  }
};
