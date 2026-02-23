import { Octokit } from "@octokit/rest";

export const getLatestFirmwareVersion = async (diagnostic = false) => {
  console.log("looking up latest firmware...");
  let repo: string;
  if (diagnostic) {
    repo = "rriv-scripts";
  } else {
    repo = "rriv-firmware";
  }
  const octokit = new Octokit();
  const release = await octokit.repos.getLatestRelease({
    owner: "rrivirr",
    repo,
  });
  return release.data.tag_name;
};
