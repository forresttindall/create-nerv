#!/usr/bin/env node

// src/index.js
var { spawn, exec } = require("child_process");
var { promisify } = require("util");
var chalk = require("chalk");
var ora = require("ora");
var gradient = require("gradient-string");
var { writeFile, readFile, access } = require("fs/promises");
var { constants } = require("fs");
var readline = require("readline");
var { stdin, stdout, exit } = require("process");
var execAsync = promisify(exec);
var TEMPLATE_REPO = "https://github.com/forresttindall/nerv.git";
var target = process.argv[2] || "my-nerv-app";
console.log(`
  \u2588\u2588\u2588\u2584    \u2588 \u2593\u2588\u2588\u2588\u2588\u2588  \u2588\u2588\u2580\u2588\u2588\u2588   \u2588\u2588\u2592   \u2588\u2593
  \u2588\u2588 \u2580\u2588   \u2588 \u2593\u2588   \u2580 \u2593\u2588\u2588 \u2592 \u2588\u2588\u2592\u2593\u2588\u2588\u2591   \u2588\u2592
 \u2593\u2588\u2588  \u2580\u2588 \u2588\u2588\u2592\u2592\u2588\u2588\u2588   \u2593\u2588\u2588 \u2591\u2584\u2588 \u2592 \u2593\u2588\u2588  \u2588\u2592\u2591
 \u2593\u2588\u2588\u2592  \u2590\u258C\u2588\u2588\u2592\u2592\u2593\u2588  \u2584 \u2592\u2588\u2588\u2580\u2580\u2588\u2584    \u2592\u2588\u2588 \u2588\u2591\u2591
 \u2592\u2588\u2588\u2591   \u2593\u2588\u2588\u2591\u2591\u2592\u2588\u2588\u2588\u2588\u2592\u2591\u2588\u2588\u2593 \u2592\u2588\u2588\u2592   \u2592\u2580\u2588\u2591  
 \u2591 \u2592\u2591   \u2592 \u2592 \u2591\u2591 \u2592\u2591 \u2591\u2591 \u2592\u2593 \u2591\u2592\u2593\u2591   \u2591 \u2590\u2591  
 \u2591 \u2591\u2591   \u2591 \u2592\u2591 \u2591 \u2591  \u2591  \u2591\u2592 \u2591 \u2592\u2591   \u2591 \u2591\u2591  
    \u2591   \u2591 \u2591    \u2591     \u2591\u2591   \u2591      \u2591\u2591  
          \u2591    \u2591  \u2591   \u2591           \u2591  
 `);
console.log(gradient.vice("\u26A1 Full stack serverless site launcher"));
console.log(chalk.gray("Created by Creationbase.io"));
console.log(chalk.magenta(`\u2192 Creating your project in: ${chalk.bold(target)}
`));
function askQuestion(query) {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
      stdio: options.quiet ? "pipe" : "inherit",
      shell: true,
      ...options
    });
    let stdout2 = "";
    let stderr = "";
    if (options.quiet) {
      child.stdout?.on("data", (data) => {
        stdout2 += data.toString();
      });
      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
    }
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout: stdout2, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr || stdout2}`));
      }
    });
    child.on("error", (error) => {
      reject(error);
    });
  });
}
(async () => {
  try {
    try {
      await runCommand("git --version", { quiet: true });
    } catch (e) {
      console.error(chalk.red("\u274C Git is required but not found. Please install Git and try again."));
      exit(1);
    }
    try {
      await runCommand("npm --version", { quiet: true });
    } catch (e) {
      console.error(chalk.red("\u274C npm is required but not found. Please install Node.js and npm."));
      exit(1);
    }
    if (await fileExists(target)) {
      console.error(chalk.red(`\u274C Directory '${target}' already exists. Please choose a different name or remove the existing directory.`));
      exit(1);
    }
    const lang = await askQuestion(chalk.bold("Use TypeScript? [Y/n] "));
    const useTS = lang.trim().toLowerCase() === "y" || lang.trim() === "";
    console.log();
    const cloneSpinner = ora("Cloning template...").start();
    try {
      await runCommand(`git clone ${TEMPLATE_REPO} ${target}`, { quiet: true });
      cloneSpinner.succeed("\u2705 Template cloned.");
    } catch (e) {
      cloneSpinner.fail("\u274C Failed to clone the template.");
      console.error(chalk.red("Error details:"), e.message);
      exit(1);
    }
    const cleanSpinner = ora("Cleaning up template...").start();
    try {
      if (process.platform === "win32") {
        await runCommand(`rmdir /s /q "${target}\\.git"`, { quiet: true });
      } else {
        await runCommand(`rm -rf "${target}/.git"`, { quiet: true });
      }
      cleanSpinner.succeed("\u{1F9FC} Cleanup complete.");
    } catch (e) {
      cleanSpinner.fail("\u274C Failed to clean up.");
      console.error(chalk.red("Error details:"), e.message);
      exit(1);
    }
    if (useTS) {
      const tsSpinner = ora("Converting to TypeScript...").start();
      try {
        const appJsxPath = `${target}/src/app.jsx`;
        const mainJsxPath = `${target}/src/main.jsx`;
        if (await fileExists(appJsxPath)) {
          if (process.platform === "win32") {
            await runCommand(`move "${appJsxPath}" "${target}/src/app.tsx"`, { quiet: true });
          } else {
            await runCommand(`mv "${appJsxPath}" "${target}/src/app.tsx"`, { quiet: true });
          }
        }
        if (await fileExists(mainJsxPath)) {
          if (process.platform === "win32") {
            await runCommand(`move "${mainJsxPath}" "${target}/src/main.tsx"`, { quiet: true });
          } else {
            await runCommand(`mv "${mainJsxPath}" "${target}/src/main.tsx"`, { quiet: true });
          }
        }
        const vitePath = `${target}/vite.config.js`;
        const viteTSPath = `${target}/vite.config.ts`;
        if (await fileExists(vitePath)) {
          const viteContents = await readFile(vitePath, "utf-8");
          const viteTS = viteContents.replace(/\/\*\* @type \{import\("vite"\)\.UserConfig\} \*\//, "").replace("export default", "const config =").concat("\nexport default config;\n");
          await writeFile(viteTSPath, viteTS);
          if (process.platform === "win32") {
            await runCommand(`del "${vitePath}"`, { quiet: true });
          } else {
            await runCommand(`rm "${vitePath}"`, { quiet: true });
          }
        }
        const packageJsonPath = `${target}/package.json`;
        if (await fileExists(packageJsonPath)) {
          const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
          packageJson.devDependencies = {
            ...packageJson.devDependencies,
            "typescript": "^5.0.0",
            "@types/react": "^18.0.0",
            "@types/react-dom": "^18.0.0"
          };
          await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
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
        tsSpinner.succeed("\u{1F537} TypeScript files prepared.");
      } catch (e) {
        tsSpinner.fail("\u274C TypeScript conversion failed.");
        console.error(chalk.red("Error details:"), e.message);
        exit(1);
      }
    }
    console.log(chalk.greenBright("\n\u{1F680} All set!"));
    console.log(gradient.vice("\nNext steps:"));
    console.log(chalk.cyan(`  cd ${target}`));
    console.log(chalk.cyan(`  npm install`));
    console.log(chalk.cyan(`  npm run dev`));
    console.log(gradient.vice("\nOr press Y below to run these now."));
    const answer = await askQuestion(chalk.bold("\nRun setup now? [Y/n] "));
    if (answer.trim().toLowerCase() === "y" || answer.trim() === "") {
      const runSpinner = ora("Installing dependencies...").start();
      try {
        process.chdir(target);
        await runCommand("npm install");
        runSpinner.succeed("\u{1F4E6} Dependencies installed.");
        console.log(chalk.greenBright("\nStarting development server..."));
        console.log(chalk.gray("(Press Ctrl+C to stop)"));
        await runCommand("npm run dev");
      } catch (e) {
        runSpinner.fail("\u274C Setup failed.");
        console.error(chalk.red("Error details:"), e.message);
        exit(1);
      }
    } else {
      console.log(chalk.greenBright("\n\u{1F44D} You can run these later:"));
      console.log(chalk.magenta(`  cd ${target}`));
      console.log(chalk.magenta(`  npm install`));
      console.log(chalk.magenta(`  npm run dev`));
      console.log(chalk.greenBright("\nHappy hacking!"));
      exit(0);
    }
  } catch (error) {
    console.error(chalk.red("An unexpected error occurred:"), error.message || error);
    exit(1);
  }
})();
