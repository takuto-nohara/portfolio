import { spawn } from "node:child_process";

const colors = {
  green: (text) => `\u001b[32m${text}\u001b[0m`,
  red: (text) => `\u001b[31m${text}\u001b[0m`,
  bold: (text) => `\u001b[1m${text}\u001b[0m`,
};

const commands = [
  { name: "check:layers", cmd: "npm", args: ["run", "check:layers"] },
  { name: "lint", cmd: "npm", args: ["run", "lint"] },
  { name: "build", cmd: "npm", args: ["run", "build"] },
  { name: "check:dup", cmd: "npm", args: ["run", "check:dup"] },
  { name: "check:lines", cmd: "npm", args: ["run", "check:lines"] },
  { name: "check:api", cmd: "npm", args: ["run", "check:api"] },
  { name: "check:sync", cmd: "npm", args: ["run", "check:sync"] },
  { name: "knip", cmd: "npm", args: ["run", "knip"] },
];

const runCommand = ({ name, cmd, args }) =>
  new Promise((resolve) => {
    const isWin = process.platform === "win32";
    const command = isWin ? "cmd.exe" : cmd;
    const commandArgs = isWin ? ["/d", "/s", "/c", [cmd, ...args].join(" ")] : args;
    const child = spawn(command, commandArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("exit", (status) => {
      resolve({ name, status: status ?? 1, stdout, stderr });
    });
  });

const results = await Promise.all(commands.map(runCommand));
const failed = results.filter((result) => result.status !== 0);
const succeeded = results.filter((result) => result.status === 0);

for (const result of failed) {
  console.log(`\n${colors.red(`[${result.name}] failed`)}`);
  if (result.stdout.trim() !== "") {
    console.log(result.stdout.trimEnd());
  }
  if (result.stderr.trim() !== "") {
    console.error(result.stderr.trimEnd());
  }
}

console.log(`\n${colors.bold("CI summary")}`);
if (succeeded.length > 0) {
  console.log(`  ${colors.green("Passed")}: ${succeeded.map((result) => result.name).join(", ")}`);
}
if (failed.length > 0) {
  console.log(`  ${colors.red("Failed")}: ${failed.map((result) => result.name).join(", ")}`);
}

process.exit(failed.length > 0 ? 1 : 0);