#!/usr/bin/env node

import { spawn } from "child_process";
import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { writeFileSync } from "fs";

// Configuration
const MODEL = process.env.COPILOT_MODEL || "gpt-5-mini";
const OUTPUT_FILE = process.argv[2]; // Get output file path from command line arg
const COPILOT_PATH = process.env.COPILOT_PATH || "copilot";

// Cleanup function to remove markdown code blocks and extra formatting
function cleanupCommand(command) {
  let cleaned = command.trim();

  // Remove markdown code blocks (```bash, ```sh, ```zsh, or just ```)
  // Match opening backticks with optional language identifier
  cleaned = cleaned.replace(/^```(?:bash|sh|zsh|shell)?\s*\n?/i, "");
  // Remove closing backticks
  cleaned = cleaned.replace(/\n?```\s*$/, "");

  // Trim again after removing code blocks
  cleaned = cleaned.trim();

  // Remove any leading/trailing quotes if the entire command is quoted
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned;
}

// Run copilot command
function runCopilot(userPrompt) {
  return new Promise((resolve, reject) => {
    const fullPrompt = `You are a master at providing zsh command lines. Current system is Ubuntu 25.10. Given the following prompt, you must return the suggested command to achieve what's asked. Do not add any extra information or explanation, just return the command line. DO NOT wrap the command in markdown code blocks (no triple backticks, no \`\`\`zsh or \`\`\`bash). Return only the raw command. Prompt: ${userPrompt}`;

    const args = [
      "--silent",
      "--model",
      MODEL,
      "--no-custom-instructions",
      "--no-auto-update",
      "--disable-builtin-mcps",
      "-p",
      fullPrompt,
    ];

    const copilot = spawn(COPILOT_PATH, args);
    let output = "";
    let error = "";

    copilot.stdout.on("data", (data) => {
      output += data.toString();
    });

    copilot.stderr.on("data", (data) => {
      error += data.toString();
    });

    copilot.on("close", (code) => {
      if (code === 0) {
        const trimmedOutput = output.trim();
        if (!trimmedOutput) {
          reject(new Error("Copilot returned empty output"));
        } else {
          // Apply cleanup to remove markdown code blocks
          const cleanedOutput = cleanupCommand(trimmedOutput);
          resolve(cleanedOutput);
        }
      } else {
        reject(new Error(error || `copilot exited with code ${code}`));
      }
    });
  });
}

// Show result and get user choice
async function showResultMenu(result) {
  console.log("\n    " + chalk.green(result) + "\n");

  const action = await select({
    message: "What would you like to do?",
    choices: [
      { name: "Use this command", value: "use" },
      { name: "Re-prompt", value: "reprompt" },
      { name: "Cancel", value: "cancel" },
    ],
    default: "use",
  });

  return action;
}

// Main function
async function main() {
  try {
    // Get user prompt
    const userPrompt = await input({
      message: chalk.cyan("🤖 Copilot prompt:"),
      validate: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter a prompt";
        }
        return true;
      },
    });

    let currentPrompt = userPrompt.trim();
    let keepPrompting = true;

    while (keepPrompting) {
      // Show spinner while generating
      const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
      let spinnerIndex = 0;
      const spinnerInterval = setInterval(() => {
        process.stdout.write(
          `\r${chalk.cyan(spinnerFrames[spinnerIndex])} Generating command...`
        );
        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
      }, 80);

      try {
        const result = await runCopilot(currentPrompt);

        // Clear spinner
        clearInterval(spinnerInterval);
        process.stdout.write("\r\x1b[K");

        // Show result and get choice
        const choice = await showResultMenu(result);

        switch (choice) {
          case "use":
            // Use prompt - write to output file if specified, otherwise stdout
            if (OUTPUT_FILE) {
              writeFileSync(OUTPUT_FILE, result, "utf8");
            } else {
              process.stdout.write(result);
            }
            process.exit(0);
            break;

          case "reprompt":
            // Re-prompt
            const newPrompt = await input({
              message: chalk.cyan("🤖 Copilot prompt:"),
              default: currentPrompt,
              prefill: "editable",
              validate: (value) => {
                if (!value || value.trim() === "") {
                  return "Please enter a prompt";
                }
                return true;
              },
            });
            currentPrompt = newPrompt.trim();
            break;

          case "cancel":
            // Cancel
            console.log("Cancelled.");
            process.exit(1);
            break;
        }
      } catch (error) {
        // Clear spinner on error
        clearInterval(spinnerInterval);
        process.stdout.write("\r\x1b[K");
        console.error(chalk.red(`\nError: ${error.message}`));
        process.exit(1);
      }
    }
  } catch (error) {
    if (error.isTtyError) {
      console.error(
        chalk.red("Prompt couldn't be rendered in the current environment")
      );
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\nCancelled.");
  process.exit(1);
});

main();
