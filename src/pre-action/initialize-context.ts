import { getContexts, createContext } from "../api/context.ts";
import db from "../db/db.ts";
import {
  confirmContextPrompt,
  contextPrompt,
} from "../prompts/context.prompt.ts";
import { selectContextPrompt } from "../prompts/context.prompt.ts";
import { pronounce } from "../util/console-log.ts";

export const initializeContext = async (useDefault: boolean) => {
  const { accessToken } = db.data;
  const { name: existingContextName, id: existingContextId } = db.data.context;
  const userContexts = await getContexts({ accessToken, ended: false });
  if (
    existingContextName &&
    userContexts.find(
      (c: any) => c.name === existingContextName && c.id === existingContextId
    )
  ) {
    if (useDefault) {
      return;
    }

    const continueWithExistingContext =
      await confirmContextPrompt(existingContextName);

    if (continueWithExistingContext) {
      console.log("\n");
      return;
    }
  }

  const contextIdName: { [key: string]: string } = {};
  const { contextName } = await selectContextPrompt([
    ...userContexts.map((c: any) => {
      contextIdName[c.name] = c.id;
      return c.name;
    }),
    "create new context",
  ]);
  if (contextName === "create new context") {
    const { contextName } = await contextPrompt();

    const contextResponse = await createContext({ accessToken, contextName });
    db.update((data) => {
      data.context = {
        id: contextResponse.id,
        name: contextResponse.name,
      };
    });
    console.log(
      "context created successfully and set to",
      pronounce(contextResponse.name)
    );
  } else {
    db.update((data) => {
      data.context = {
        id: contextIdName[contextName],
        name: contextName,
      };
    });
    console.log("current context set to", pronounce(contextName));
  }
};
