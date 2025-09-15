import ChildProcess from "child_process";
import util from "util";
import db from "../db/db.ts";
import { confirm } from "@inquirer/prompts";
import { Source } from "../types.ts";

export const checkVersion = async (source: Source = "preAction") => {
  const { lastVersionCheckAt } = db.data;

  const diffTime = Date.now() - +new Date(lastVersionCheckAt);
  const fromCommand = source === "command";

  if (!diffTime || diffTime > 21600000 || fromCommand) {
    const exec = util.promisify(ChildProcess.exec);
    try {
      const workingBranchResult = await exec(`git rev-parse --abbrev-ref HEAD`);
      const workingBranch = workingBranchResult.stdout.replace("\n", "");
      await exec(`git fetch origin ${workingBranch}`);
      const result = await exec(
        `git log ${workingBranch}..origin/${workingBranch}`
      );
      if (result.stdout) {
        console.log("New rrivctl update found...");
        let toUpdate = fromCommand;
        if (!toUpdate) {
          const answer = await confirm({ message: `Update?` });
          toUpdate = answer;
        }
        if (toUpdate) {
          const mergeResult = await exec(`git merge origin/${workingBranch}`);
          console.log(mergeResult.stdout);
          if (mergeResult.stdout.includes("package.json")) {
            const npmResult = await exec(`npm i`);
            console.log(npmResult.stdout);
          }
          await exec(`npm run build`);
          if (!fromCommand) {
            console.log("updates applied. rerun previous command");
          }
          process.exit();
        }
      } else {
        if (fromCommand) {
          console.log("no new rrivctl updates found");
        }
      }
    } catch (error: any) {
      console.log(error);
      if (!error?.stderr.includes("Could not resolve host")) {
        console.log("auto update failed, contact support");
      }
    }

    db.update((data) => {
      data.lastVersionCheckAt = new Date();
    });
  }
};
