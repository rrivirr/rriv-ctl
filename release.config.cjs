const ref = process.env.GITHUB_REF;
const branch = ref.split("/").pop();

const config = {
  branches: [
    "main",
    {
      name: "alpha",
      prerelease: true,
    },
    {
      name: "beta",
      prerelease: true,
    },
    {
      name: "preview-*",
      prerelease: true,
    },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    "@semantic-release/github",
    "semantic-release-export-data",
  ],
};

if (
  config.branches.some(
    (it) => it === branch || (it.name === branch && !it.prerelease),
  )
) {
  config.plugins.push("@semantic-release/changelog", [
    "@semantic-release/git",
    {
      assets: ["package.json", "CHANGELOG.md"],
      message: "chore(release): ${nextRelease.version} [skip ci]",
    },
  ]);
} else {
  config.plugins.push([
    "@semantic-release/git",
    {
      assets: ["package.json"],
      message: "chore(pre-release): ${nextRelease.version}",
    },
  ]);
}

module.exports = config;
