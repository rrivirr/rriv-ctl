import { Octokit } from "@octokit/rest";

export const getLatestFirmwareVersion = async () => {
  console.log("looking up latest firmware...");
  const octokit = new Octokit();
  const release = await octokit.repos.getLatestRelease({
    owner: "rrivirr",
    repo: "rriv-firmware",
  });
  return release.data.tag_name;
};
