import ChildProcess from "child_process";
import util from "util";
import db from "../db/db.ts";
import { confirm } from "@inquirer/prompts";

export const checkVersion = async () => {
  const { lastVersionCheckAt } = db.data;

  const diffTime = Date.now() - +new Date(lastVersionCheckAt);

  if (diffTime > 21600000 || !diffTime) {
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
