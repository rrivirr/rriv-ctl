import { Command } from "commander";
import { authCheck } from "../util/auth-check.ts";
import { runChecks } from "./run-checks.ts";
import { checkVersionAndUpdate } from "../modules/update/update.service.ts";
import db from "../db/db.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command,
) => {
  const commandName = actionCommand.name();
  const args = actionCommand.args;
  const options = actionCommand.opts();
  const commandParentName = actionCommand.parent?.name();

  if (args.length && commandName === "rrivctl") {
    console.log("invalid command received");
    process.exit();
  }

  if (!db.data?.environment?.name) {
    db.update((data) => {
      data.environment = {
        name: "prod",
        config: {
          RRIV_API_URL: process.env.RRIV_API_URL!,
          KEYCLOAK_URL: process.env.KEYCLOAK_URL!,
          KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID!,
          DATA_API_URL: process.env.DATA_API_URL!,
          MQTT_URL: process.env.MQTT_URL!,
          ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
        },
      };
    });
  }

  if (commandName !== "update") {
    await checkVersionAndUpdate();
  }

  if (
    !(
      commandParentName === "auth" ||
      commandName === "test" ||
      commandName === "whoami" ||
      commandName === "update" ||
      options.env ||
      options.debugMode
    )
  ) {
    await authCheck();
    if (
      !(
        commandName === "rrivctl" ||
        (commandName === "list" && args[0] === "device") ||
        (commandName === "send" && args[0] === "command") ||
        (commandName === "device" && commandParentName === "provision") ||
        (commandName === "debug" && commandParentName === "probe") ||
        commandParentName === "history" ||
        commandParentName === "library" ||
        commandParentName === "firmware" ||
        commandParentName === "logs" ||
        (commandName === "watch" && args.length) ||
        (commandName === "history" &&
          commandParentName === "get" &&
          actionCommand.parent?.parent?.name() === "firmware" &&
          args.length) ||
        (commandName === "list" &&
          commandParentName === "lorawan" &&
          actionCommand.parent?.parent?.name() === "telemetry")
      )
    ) {
      await runChecks({
        commandName,
        commandParentName,
        commandArgument: args[0],
      });
    }
  }
};
