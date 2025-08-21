import ChildProcess from "child_process";
import util from "util";
import db from "../db/db.ts";
import { confirm } from "@inquirer/prompts";
import { Source } from "../types.ts";

export const checkVersion = async (source: Source = "preAction") => {
  const { lastVersionCheckAt } = db.data;

  const diffTime = Date.now() - +new Date(lastVersionCheckAt);

  if (!diffTime || diffTime > 21600000 || source === "command") {
    const exec = util.promisify(ChildProcess.exec);
    try {
      // @ TODO change workingBranch to main once fully merged
      const workingBranch = "feat/init_api_integration";
      await exec(`git fetch origin ${workingBranch}`);
      const result = await exec(
        `git log ${workingBranch}..origin/${workingBranch}`
      );
      if (result.stdout) {
        console.log("New rrivctl update found...");
        const answer = await confirm({ message: `Update?` });
        if (answer) {
          const mergeResult = await exec(`git merge origin/${workingBranch}`);
          console.log(mergeResult.stdout);
          if (mergeResult.stdout.includes("package.json")) {
            const npmResult = await exec(`npm i`);
            console.log(npmResult.stdout);
          }
          await exec(`npm run build`);
          console.log("updates applied. rerun previous command");
          process.exit();
        }
      } else {
        if (source === "command") {
          console.log("no new rrivctl updates found");
        }
      }
    } catch (error: any) {
      if (!error?.stderr.includes("Could not resolve host")) {
        console.log("auto update check failed, contact support");
      }
    }

    db.update((data) => {
      data.lastVersionCheckAt = new Date();
    });
  }
};
