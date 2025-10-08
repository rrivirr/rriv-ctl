import { Octokit } from "@octokit/rest";
import { UpdateChannel } from "../../../constants.ts";

export const getLatestTag = async (channel: UpdateChannel) => {
  const octokit = new Octokit();
  let latestTag = "";

  if (channel === "alpha") {
    const releases = await octokit.repos.listReleases({
      owner: "rrivirr",
      repo: "rriv-ctl",
      per_page: 100,
    });
    const latestAlphaPrerelease = releases.data.find(
      (r) => r.prerelease && r.tag_name.includes("alpha")
    );
    if (!latestAlphaPrerelease) {
      // not expected
      throw new Error("Unexpected error");
    }
    latestTag = latestAlphaPrerelease.tag_name;
  } else {
    const latestRelease = await octokit.repos.getLatestRelease({
      owner: "rrivirr",
      repo: "rriv-ctl",
    });

    latestTag = latestRelease.data.tag_name;
  }

  return latestTag;
};
