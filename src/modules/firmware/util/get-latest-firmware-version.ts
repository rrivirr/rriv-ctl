import { Octokit } from "@octokit/rest";

export const getLatestFirmwareVersion = async (diagnostic = false) => {
  let repo: string;
  if (diagnostic) {
    repo = "rriv-scripts";
  } else {
    repo = "rriv-firmware";
  }

  console.log(`looking up latest ${repo} firmware...`);
  const octokit = new Octokit();
  const release = await octokit.repos.getLatestRelease({
    owner: "rrivirr",
    repo,
  });
  return release.data.tag_name;
};
