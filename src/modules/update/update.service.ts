import { confirm } from "@inquirer/prompts";
import db from "../../db/db.ts";
import { UpdateChannel } from "../../constants.ts";
import packageJson from "../../../package.json" with { type: "json" };
import { getLatestTag } from "./util/get-latest-tag.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { spawn } from "../../util/spawn.ts";
import { loadScript } from "../../util/load-script.ts";

export const updateRrivctl = async (tag?: string, channel?: UpdateChannel) => {
  if (channel) {
    db.update((data) => {
      data.updateChannel = channel;
    });
    if (!tag) {
      console.log("update channel changed successfully to", channel);
      return;
    }
  }

  const { updateChannel } = db.data;
  if (!updateChannel) {
    db.update((data) => {
      data.updateChannel = "stable";
    });
  }

  const currentTag = `v${packageJson.version}`;

  await loadScript("../rrivctl-installer.sh", "rrivctl-installer.sh");
  const args = ["rrivctl-installer.sh"];

  if (tag) {
    if (
      (tag.includes("alpha") && !updateChannel?.includes("alpha")) ||
      (!tag.includes("alpha") && updateChannel?.includes("alpha"))
    ) {
      throw new Error(
        "Tag specified not in update channel. Use --channel to change your update channel"
      );
    }
    if (tag === currentTag) {
      console.log("rrivctlv2 is on the specified version");
      return;
    }
    args.push(tag);
  } else if (!tag && updateChannel === "alpha") {
    const latestTag = await getLatestTag("alpha");
    console.log("updating to", latestTag);

    if (currentTag === latestTag) {
      console.log("rrivctlv2 is already on the latest version");
      return;
    }
    args.push(latestTag);
  } else {
    const latestTag = await getLatestTag("stable");
    console.log("updating to", latestTag);

    if (latestTag === currentTag) {
      console.log("rrivctlv2 is already on the latest version");
      return;
    }
  }

  await spawn(`bash`, args);
  await spawn("rm", [args[0]]);
};

export const checkVersionAndUpdate = async () => {
  const currentTag = `v${packageJson.version}`;
  const { lastVersionCheckAt, updateChannel } = db.data;

  const diffTime = Date.now() - +new Date(lastVersionCheckAt);

  if (!diffTime || diffTime > 86400000) {
    try {
      const latestTag = await getLatestTag(updateChannel || "stable");
      if (latestTag !== currentTag) {
        console.log("New rrivctlv2 update found...", latestTag);

        const answer = await confirm({ message: `Update?` });
        if (answer) {
          await updateRrivctl(latestTag);
        }
      }
    } catch (error) {
      errorHandler({ error, exit: false });
    }

    db.update((data) => {
      data.lastVersionCheckAt = new Date();
    });
  }
};
