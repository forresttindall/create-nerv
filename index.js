#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";

const TEMPLATE_REPO = "https://github.com/forresttindall/zap-template.git";
const target = Bun.argv[2] || "my-vorb-app";

// Logo header
console.log(
  gradient.pastel(
    figlet.textSync("Vorb", {
      font: "Slant",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

console.log(chalk.green("⚡ Blazing fast static app launcher"));
console.log(chalk.magenta(`→ Creating your project in: ${chalk.bold(target)}\n`));

const cloneSpinner = ora("Cloning template...").start();
try {
  await $`git clone ${TEMPLATE_REPO} ${target}`;
  cloneSpinner.succeed("Template cloned.");
} catch (e) {
  cloneSpinner.fail("Failed to clone the template.");
  console.error(e);
  process.exit(1);
}

const cleanSpinner = ora("Cleaning up template...").start();
try {
  await $`rm -rf ${target}/.git`;
  cleanSpinner.succeed("Cleanup complete.");
} catch (e) {
  cleanSpinner.fail("Failed to clean up.");
  console.error(e);
  process.exit(1);
}

console.log("\n🚀 All set!");
console.log(chalk.cyan(`\nNext steps:`));
console.log(chalk.white(`  cd ${target}`));
console.log(chalk.white(`  bun install`));
console.log(chalk.white(`  bun run dev`));
console.log(chalk.gray("\nHappy hacking. Stay fast. Stay free."));
