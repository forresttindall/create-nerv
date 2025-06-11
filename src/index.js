#!/usr/bin/env node

// Import statements converted to CommonJS require
const { spawn, exec } = require("child_process");
const { promisify } = require("util");
const chalk = require("chalk");
const ora = require("ora");
const figlet = require("figlet");
const gradient = require("gradient-string");
const { writeFile, readFile, access } = require("fs/promises");
const { constants } = require("fs");
const readline = require('readline');
const { stdin, stdout, exit } = require('process');

const execAsync = promisify(exec);
const TEMPLATE_REPO = "https://github.com/forresttindall/nerv.git";
const target = process.argv[2] || "my-nerv-app";


console.log(figlet.textSync('NERV'));
 

console.log(gradient.vice("⚡ Full stack serverless site launcher"));
console.log(chalk.gray("Created by Creationbase.io"));
console.log(chalk.magenta(`→ Creating your project in: ${chalk.bold(target)}\n`));

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

// Helper function to check if a file exists
async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Helper function to run shell commands
async function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      stdio: options.quiet ? 'pipe' : 'inherit',
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (options.quiet) {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

(async () => {
  try {
    // Check if git is available
    try {
      await runCommand('git --version', { quiet: true });
    } catch (e) {
      console.error(chalk.red("❌ Git is required but not found. Please install Git and try again."));
      exit(1);
    }

    // Check if npm is available
    try {
      await runCommand('npm --version', { quiet: true });
    } catch (e) {
      console.error(chalk.red("❌ npm is required but not found. Please install Node.js and npm."));
      exit(1);
    }

    // Check if target directory already exists
    if (await fileExists(target)) {
      console.error(chalk.red(`❌ Directory '${target}' already exists. Please choose a different name or remove the existing directory.`));
      exit(1);
    }

    const lang = await askQuestion(chalk.bold("Use TypeScript? [Y/n] "));
    const useTS = lang.trim().toLowerCase() === "y" || lang.trim() === "";
    console.log(); // spacing

    const cloneSpinner = ora("Cloning template...").start();
    try {
      await runCommand(`git clone ${TEMPLATE_REPO} ${target}`, { quiet: true });
      cloneSpinner.succeed("✅ Template cloned.");
    } catch (e) {
      cloneSpinner.fail("❌ Failed to clone the template.");
      console.error(chalk.red("Error details:"), e.message);
      exit(1);
    }

    const cleanSpinner = ora("Cleaning up template...").start();
    try {
      // Cross-platform way to remove .git directory
      if (process.platform === 'win32') {
        await runCommand(`rmdir /s /q "${target}\\.git"`, { quiet: true });
      } else {
        await runCommand(`rm -rf "${target}/.git"`, { quiet: true });
      }
      cleanSpinner.succeed("🧼 Cleanup complete.");
    } catch (e) {
      cleanSpinner.fail("❌ Failed to clean up.");
      console.error(chalk.red("Error details:"), e.message);
      exit(1);
    }

    if (useTS) {
      const tsSpinner = ora("Converting to TypeScript...").start();
      try {
        // Check if source files exist before moving them
        const appJsxPath = `${target}/src/app.jsx`;
        const mainJsxPath = `${target}/src/main.jsx`;
        
        if (await fileExists(appJsxPath)) {
          if (process.platform === 'win32') {
            await runCommand(`move "${appJsxPath}" "${target}/src/app.tsx"`, { quiet: true });
          } else {
            await runCommand(`mv "${appJsxPath}" "${target}/src/app.tsx"`, { quiet: true });
          }
        }
        
        if (await fileExists(mainJsxPath)) {
          if (process.platform === 'win32') {
            await runCommand(`move "${mainJsxPath}" "${target}/src/main.tsx"`, { quiet: true });
          } else {
            await runCommand(`mv "${mainJsxPath}" "${target}/src/main.tsx"`, { quiet: true });
          }
        }

        const vitePath = `${target}/vite.config.js`;
        const viteTSPath = `${target}/vite.config.ts`;

        if (await fileExists(vitePath)) {
          const viteContents = await readFile(vitePath, "utf-8");
          const viteTS = viteContents
            .replace(/\/\*\* @type \{import\("vite"\)\.UserConfig\} \*\//, "")
            .replace("export default", "const config =")
            .concat("\nexport default config;\n");

          await writeFile(viteTSPath, viteTS);
          
          // Cross-platform file deletion
          if (process.platform === 'win32') {
            await runCommand(`del "${vitePath}"`, { quiet: true });
          } else {
            await runCommand(`rm "${vitePath}"`, { quiet: true });
          }
        }

        // Update package.json to include TypeScript dependencies
        const packageJsonPath = `${target}/package.json`;
        if (await fileExists(packageJsonPath)) {
          const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
          
          // Add TypeScript dev dependencies
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

        tsSpinner.succeed("🔷 TypeScript files prepared.");
      } catch (e) {
        tsSpinner.fail("❌ TypeScript conversion failed.");
        console.error(chalk.red("Error details:"), e.message);
        exit(1);
      }
    }

    console.log(chalk.greenBright("\n🚀 All set!"));
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
        await runCommand('npm install');
        runSpinner.succeed("📦 Dependencies installed.");
        console.log(chalk.greenBright("\nStarting development server..."));
        console.log(chalk.gray("(Press Ctrl+C to stop)"));
        
        // Run dev server without capturing output so user can see it
        await runCommand('npm run dev');
      } catch (e) {
        runSpinner.fail("❌ Setup failed.");
        console.error(chalk.red("Error details:"), e.message);
        exit(1);
      }
    } else {
      console.log(chalk.greenBright("\n👍 You can run these later:"));
      console.log(chalk.magenta(`  cd ${target}`));
      console.log(chalk.magenta(`  npm install`));
      console.log(chalk.magenta(`  npm run dev`));
      console.log(chalk.greenBright("\nHappy hacking!"));
      
      // Clean exit
      exit(0);
    }
  } catch (error) {
    console.error(chalk.red("An unexpected error occurred:"), error.message || error);
    exit(1);
  }
})();