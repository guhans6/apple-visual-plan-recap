const REQUIRED_NODE_MAJOR = 26;
const actualMajor = Number(process.versions.node.split(".")[0]);

if (!Number.isFinite(actualMajor) || actualMajor !== REQUIRED_NODE_MAJOR) {
  console.error(
    [
      `visual-companion requires Node ${REQUIRED_NODE_MAJOR}.x for a stable native-module toolchain.`,
      `Current Node: ${process.versions.node} (${process.execPath})`,
      "Run `nvm use` from the repo root or otherwise switch to Node 26 before running workspace commands.",
    ].join("\n"),
  );
  process.exit(1);
}
