import {
  shareContext,
  getContextShareRecipients,
  getSharedContexts,
} from "../../modules/context/context.service.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const shareAction = async (
  obj: string,
  identifier: string,
  email: string,
) => {
  const body = { identifier, email };
  if (obj === "device") {
    // await oraPromise(() => shareDevice(body));
  } else if (obj === "context") {
    await oraPromise(() => shareContext(body));
  }
};

export const listShareRecipientsAction = async (
  obj: string,
  identifier: string,
) => {
  if (identifier) {
    if (obj === "device") {
      // await oraPromise(() => shareDevice(body));
    } else if (obj === "context") {
      await oraPromise(() => getContextShareRecipients({ identifier }));
    }
  } else {
    if (obj === "device") {
      // await oraPromise(() => shareDevice(body));
    } else if (obj === "context") {
      await oraPromise(() => getSharedContexts());
    }
  }
};
