#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { writeFile } from "fs/promises";

// reusable prompt function
const prompt = async (question: string) => {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim().toLowerCase();
};

const TEMPLATE_REPO = "https://github.com/forresttindall/vorb.git";
const target = Bun.argv[2] || "my-vorb-app";

// ASCII title
console.log(
  gradient.pastel(
    figlet.textSync("Vorb", { font: "Slant" })
  )
);

console.log(gradient.vice("⚡ Blazing fast static site launcher"));
console.log(chalk.magenta(`→ Creating your project in: ${chalk.bold(target)}\n`));

// Ask for TypeScript preference
const useTS = await prompt(chalk.bold("Use TypeScript? [Y/n] ")) !== "n";

// Clone template repo
const cloneSpinner = ora("Cloning template...").start();
try {
  await $`git clone ${TEMPLATE_REPO} ${target}`;
  cloneSpinner.succeed("✅ Template cloned.");
} catch (err) {
  cloneSpinner.fail("❌ Failed to clone the template.");
  console.error(err);
  process.exit(1);
}

// Remove .git
const cleanSpinner = ora("Cleaning up template...").start();
try {
  await $`rm -rf ${target}/.git`;
  cleanSpinner.succeed("🧼 Cleanup complete.");
} catch (err) {
  cleanSpinner.fail("❌ Failed to clean up.");
  console.error(err);
  process.exit(1);
}

// Convert to TypeScript if requested
if (useTS) {
  const tsSpinner = ora("Converting to TypeScript...").start();
  try {
    await $`mv ${target}/src/app.jsx ${target}/src/app.tsx`;
    await $`mv ${target}/src/main.jsx ${target}/src/main.tsx`;

    // Create tsconfig.json
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

    // Replace vite.config.js with vite.config.ts
    await $`rm ${target}/vite.config.js`;
    await writeFile(
      `${target}/vite.config.ts`,
      `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});\n`
    );

    // Install types
    await $`bun add -d typescript @types/react @types/react-dom`;

    tsSpinner.succeed("🔷 TypeScript setup complete.");
  } catch (err) {
    tsSpinner.fail("❌ TypeScript conversion failed.");
    console.error(err);
    process.exit(1);
  }
}

// Show next steps
console.log(chalk.greenBright("\n🚀 All set!"));
console.log(gradient.vice("\nNext steps:"));
console.log(chalk.cyan(`  cd ${target}`));
console.log(chalk.cyan(`  bun install`));
console.log(chalk.cyan(`  bun run dev`));
console.log(gradient.vice("\nOr press Y below to run these now."));

const runNow = await prompt(chalk.bold("\nRun setup now? [Y/n] "));
if (runNow === "y" || runNow === "") {
  const runSpinner = ora("Setting up project...").start();
  try {
    process.chdir(target);
    await $`bun install`;
    runSpinner.succeed("📦 Dependencies installed.");
    await $`bun run dev`;
  } catch (err) {
    runSpinner.fail("❌ Setup failed.");
    console.error(err);
    process.exit(1);
  }
} else {
  console.log(chalk.greenBright("\n👍 You can run these later:"));
  console.log(chalk.magenta(`  cd ${target}`));
  console.log(chalk.magenta(`  bun install`));
  console.log(chalk.magenta(`  bun run dev`));
  console.log(chalk.greenBright("\nHappy hacking!"));
}
