#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { writeFile, readFile } from "fs/promises";

const TEMPLATE_REPO = "https://github.com/forresttindall/vorb.git";
const target = Bun.argv[2] || "my-vorb-app";

// Logo
console.log(
  gradient.pastel(
    figlet.textSync("Vorb", {
      font: "Slant",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

console.log(gradient.vice("⚡ Blazing fast static site launcher"));
console.log(chalk.magenta(`→ Creating your project in: ${chalk.bold(target)}\n`));

// Prompt
const rl = readline.createInterface({ input, output });
let useTS = false;
const lang = await rl.question(chalk.bold("Use TypeScript? [Y/n] "));
if (lang.trim().toLowerCase() === "y" || lang.trim() === "") {
  useTS = true;
}
console.log(); // spacing

// Clone
const cloneSpinner = ora("Cloning template...").start();
try {
  await $`git clone ${TEMPLATE_REPO} ${target}`;
  cloneSpinner.succeed("✅ Template cloned.");
} catch (e) {
  cloneSpinner.fail("❌ Failed to clone the template.");
  console.error(e);
  process.exit(1);
}

// Remove .git
const cleanSpinner = ora("Cleaning up template...").start();
try {
  await $`rm -rf ${target}/.git`;
  cleanSpinner.succeed("🧼 Cleanup complete.");
} catch (e) {
  cleanSpinner.fail("❌ Failed to clean up.");
  console.error(e);
  process.exit(1);
}

// Convert to TypeScript
if (useTS) {
  const tsSpinner = ora("Converting to TypeScript...").start();
  try {
    await $`mv ${target}/src/app.jsx ${target}/src/app.tsx`;
    await $`mv ${target}/src/main.jsx ${target}/src/main.tsx`;

    const vitePath = `${target}/vite.config.js`;
    const viteTSPath = `${target}/vite.config.ts`;

    // Convert vite.config.js to vite.config.ts
    const viteContents = await readFile(vitePath, "utf-8");
    const viteTS = viteContents
      .replace(/\/\*\* @type \{import\("vite"\)\.UserConfig\} \*\//, "")
      .replace("export default", "const config =")
      .replace(/$/, "\nexport default config;\n");
    await writeFile(viteTSPath, viteTS);
    await $`rm ${vitePath}`;

    // tsconfig.json
    await writeFile(
      `${target}/tsconfig.json`,
      `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"]
}
`
    );

    tsSpinner.succeed("🔷 TypeScript files prepared. Dependencies will be installed after confirmation.");
  } catch (e) {
    tsSpinner.fail("❌ TypeScript conversion failed.");
    console.error(e);
    process.exit(1);
  }
}

// Prompt to install
console.log(chalk.greenBright("\n🚀 All set!"));
console.log(gradient.vice("\nNext steps:"));
console.log(chalk.cyan(`  cd ${target}`));
console.log(chalk.cyan(`  bun install`));
console.log(chalk.cyan(`  bun run dev`));
console.log(gradient.vice("\nOr press Y below to run these now."));

const answer = await rl.question(chalk.bold("\nRun setup now? [Y/n] "));
rl.close();

if (answer.trim().toLowerCase() === "y" || answer.trim() === "") {
  const runSpinner = ora("Setting up project...").start();
  try {
    process.chdir(target);
    await $`bun install`;
    runSpinner.succeed("📦 Dependencies installed.");
    await $`bun run dev`;
  } catch (e) {
    runSpinner.fail("❌ Setup failed.");
    console.error(e);
    process.exit(1);
  }
} else {
  console.log(chalk.greenBright("\n👍 You can run these later:"));
  console.log(chalk.magenta(`  cd ${target}`));
  console.log(chalk.magenta(`  bun install`));
  console.log(chalk.magenta(`  bun run dev`));
  console.log(chalk.greenBright("\nHappy hacking!"));
}
