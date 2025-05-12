#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import { writeFile, readFile } from "fs/promises";

// Use synchronous readline from Node.js
import * as readline from 'readline';
import { stdin, stdout, exit } from 'process';

const TEMPLATE_REPO = "https://github.com/forresttindall/vorb.git";
const target = Bun.argv[2] || "my-vorb-app";

// Display logo
console.log(
  gradient.pastel(
    figlet.textSync("Vorb", {
      font: "Slant",
    })
  )
);

console.log(gradient.vice("⚡ Blazing fast static site launcher"));
console.log(chalk.magenta(`→ Creating your project in: ${chalk.bold(target)}\n`));

// Create a synchronous question helper
function askQuestion(query) {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  return new Promise(resolve => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Main execution wrapped in an async IIFE
(async () => {
  try {
    // Ask about TypeScript
    const lang = await askQuestion(chalk.bold("Use TypeScript? [Y/n] "));
    const useTS = lang.trim().toLowerCase() === "y" || lang.trim() === "";
    console.log(); // spacing

    // Clone the repo
    const cloneSpinner = ora("Cloning template...").start();
    try {
      await $`git clone ${TEMPLATE_REPO} ${target}`;
      cloneSpinner.succeed("✅ Template cloned.");
    } catch (e) {
      cloneSpinner.fail("❌ Failed to clone the template.");
      console.error(e);
      exit(1);
    }

    // Clean up git
    const cleanSpinner = ora("Cleaning up template...").start();
    try {
      await $`rm -rf ${target}/.git`;
      cleanSpinner.succeed("🧼 Cleanup complete.");
    } catch (e) {
      cleanSpinner.fail("❌ Failed to clean up.");
      console.error(e);
      exit(1);
    }

    // Convert to TypeScript if requested
    if (useTS) {
      const tsSpinner = ora("Converting to TypeScript...").start();
      try {
        await $`mv ${target}/src/app.jsx ${target}/src/app.tsx`;
        await $`mv ${target}/src/main.jsx ${target}/src/main.tsx`;

        const vitePath = `${target}/vite.config.js`;
        const viteTSPath = `${target}/vite.config.ts`;

        const viteContents = await readFile(vitePath, "utf-8");
        const viteTS = viteContents
          .replace(/\/\*\* @type \{import\("vite"\)\.UserConfig\} \*\//, "")
          .replace("export default", "const config =")
          .concat("\nexport default config;\n");

        await writeFile(viteTSPath, viteTS);
        await $`rm ${vitePath}`;

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

        tsSpinner.succeed("🔷 TypeScript files prepared.");
      } catch (e) {
        tsSpinner.fail("❌ TypeScript conversion failed.");
        console.error(e);
        exit(1);
      }
    }

    // Display next steps
    console.log(chalk.greenBright("\n🚀 All set!"));
    console.log(gradient.vice("\nNext steps:"));
    console.log(chalk.cyan(`  cd ${target}`));
    console.log(chalk.cyan(`  bun install`));
    console.log(chalk.cyan(`  bun run dev`));
    console.log(gradient.vice("\nOr press Y below to run these now."));

    // Ask about running setup
    const answer = await askQuestion(chalk.bold("\nRun setup now? [Y/n] "));
    
    if (answer.trim().toLowerCase() === "y" || answer.trim() === "") {
      // User wants to run setup
      const runSpinner = ora("Setting up project...").start();
      try {
        process.chdir(target);
        await $`bun install`;
        runSpinner.succeed("📦 Dependencies installed.");
        console.log(chalk.greenBright("\nStarting development server..."));
        console.log(chalk.gray("(Press Ctrl+C to stop)"));
        await $`bun run dev`;
      } catch (e) {
        runSpinner.fail("❌ Setup failed.");
        console.error(e);
        exit(1);
      }
    } else {
      // User doesn't want to run setup
      console.log(chalk.greenBright("\n👍 You can run these later:"));
      console.log(chalk.magenta(`  cd ${target}`));
      console.log(chalk.magenta(`  bun install`));
      console.log(chalk.magenta(`  bun run dev`));
      console.log(chalk.greenBright("\nHappy hacking!"));
      
      // Force exit with a deliberate console message
      console.log(chalk.gray("\nExiting process..."));
      
      // Kill the process forcefully
      process.kill(process.pid, 'SIGTERM');
    }
  } catch (error) {
    console.error(chalk.red("An unexpected error occurred:"), error);
    exit(1);
  }
})();