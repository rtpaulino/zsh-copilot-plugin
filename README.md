# ZSH Copilot Plugin

An interactive zsh plugin that lets you generate shell commands using an LLM by pressing `Ctrl+Space`.

## Features

- 🚀 Press `Ctrl+Space` to enter prompt mode
- 🤖 Type your natural language prompt
- ⚡ Animated braille spinner while generating
- ✨ Get AI-generated shell commands
- 🔄 Re-prompt if the result isn't quite right
- 📋 Interactive menu with arrow key navigation
- ⌨️ Use the generated command or cancel
- 🎯 Seamless integration with your existing shell workflow

## Prerequisites

- [copilot CLI](https://github.com/github/copilot-cli) command-line tool installed
- Node.js (v14 or higher)
- npm or yarn
- zsh shell

## Installation

### Using Oh My Zsh

1. Clone this repository into your Oh My Zsh custom plugins directory:

```bash
git clone https://github.com/yourusername/zsh-copilot-plugin.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-copilot
```

2. Install Node.js dependencies:

```bash
cd ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-copilot
npm install
```

3. Add `zsh-copilot` to your plugins array in `~/.zshrc`:

```bash
plugins=(... zsh-copilot)
```

4. Restart your shell or run:

```bash
source ~/.zshrc
```

### Manual Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/zsh-copilot-plugin.git
cd zsh-copilot-plugin
```

2. Install Node.js dependencies:

```bash
npm install
```

3. Source the plugin in your `~/.zshrc`:

```bash
source /path/to/zsh-copilot-plugin/zsh-copilot.plugin.zsh
```

4. Restart your shell or run:

```bash
source ~/.zshrc
```

## Usage

### Basic Workflow

1. **Enter Prompt Mode**: Press `Ctrl+Space` at any time in your shell

2. **Type Your Prompt**: Enter a natural language description of what you want to do
   ```
   ? 🤖 Copilot prompt: find all javascript files modified in the last week
   ```

3. **Wait for Result**: An animated spinner appears while generating the command
   ```
   ⠹ Generating command...
   ```

4. **View Result**: The generated command is displayed
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Result:
   find . -name "*.js" -mtime -7
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

5. **Choose an Action**: Use arrow keys to select an option
   ```
   ? What would you like to do? (Use arrow keys)
   ❯ Use this command
     Re-prompt
     Cancel
   ```

   - **Use this command**: The generated command replaces your current command line
   - **Re-prompt**: Edit your original prompt and try again
   - **Cancel**: Return to normal mode without changes

### Keyboard Shortcuts

- `Ctrl+Space`: Enter prompt mode
- `Ctrl+C`: Cancel at any time
- `Enter`: Submit prompt (or cancel if empty)
- `↑/↓`: Navigate menu options
- `Enter`: Select menu option

### Examples

**Example 1: File operations**
```
? 🤖 Copilot prompt: compress all log files older than 30 days
Result: find . -name "*.log" -mtime +30 -exec gzip {} \;
```

**Example 2: Git operations**
```
? 🤖 Copilot prompt: show commits from last month by author
Result: git log --since="1 month ago" --author="$(git config user.name)" --oneline
```

**Example 3: System monitoring**
```
? 🤖 Copilot prompt: check which process is using port 8080
Result: lsof -i :8080 -P -n
```

## How It Works

1. When you press `Ctrl+Space`, the plugin creates a ZLE widget that:
   - Saves your current command line
   - Runs the Node.js script (`copilot-prompt.js`)
   - Allows full terminal interaction

2. The Node.js script:
   - Uses `@inquirer/prompts` for interactive input
   - Displays your prompt with syntax highlighting (via `chalk`)
   - Shows an animated braille spinner while waiting
   - Calls the copilot CLI with your prompt
   - Displays results in a formatted menu

3. When you select "Use this command":
   - The result is written to a temporary file
   - The zsh plugin reads it and updates your command line
   - The temporary file is automatically cleaned up

## Configuration

### Environment Variables

- `COPILOT_PROMPT_MODEL`: Set the LLM model to use (default: `gpt-5-mini`)
  ```bash
  export COPILOT_PROMPT_MODEL="gpt-4o"
  ```

### Copilot CLI Flags

The plugin uses these copilot CLI flags by default:
- `--silent`: Suppress unnecessary output
- `--model <model>`: Use the configured model (default: gpt-5-mini)
- `--no-custom-instructions`: Don't use custom instructions
- `--no-auto-update`: Don't auto-update copilot
- `--disable-builtin-mcps`: Disable built-in MCPs

You can modify these flags by editing the `runCopilot` function in `copilot-prompt.js`.

### Custom Key Binding

To use a different key binding, edit the last line of `zsh-copilot.plugin.zsh`:

```bash
# Change Ctrl+Space to Ctrl+G
bindkey '^G' _zsh_copilot_prompt_mode
```

## Architecture

The plugin consists of two main components:

1. **zsh-copilot.plugin.zsh**: ZLE widget that handles shell integration
2. **copilot-prompt.js**: Node.js script with inquirer-based UI

### Tech Stack

- **Shell**: zsh with ZLE (Zsh Line Editor)
- **Runtime**: Node.js (ESM modules)
- **UI**: [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js/tree/master/packages/prompts) - Interactive CLI prompts
- **Styling**: [chalk](https://github.com/chalk/chalk) - Terminal string styling
- **LLM**: copilot CLI

## Troubleshooting

### Plugin not loading
- Make sure the plugin file is sourced in your `~/.zshrc`
- Ensure Node.js is installed: `node --version`
- Check that dependencies are installed: `npm list`
- Restart your shell

### Ctrl+Space not working
- Some terminal emulators may intercept `Ctrl+Space`
- Try running `bindkey '^ '` to check if the binding is active
- Test the Node.js script directly: `node copilot-prompt.js /tmp/test.txt`
- You can rebind to a different key (see Configuration section)

### Copilot command not found
- Make sure the copilot CLI is installed and in your PATH
- Test by running `copilot --version`

### Interactive prompts not displaying
- Ensure you're using a modern terminal emulator
- Check that stdin/stdout aren't being redirected
- Try running the script directly to test: `node copilot-prompt.js /tmp/test.txt`

### Node.js errors
- Ensure you're using Node.js v14 or higher: `node --version`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check for ESM support (the plugin uses ES modules, not CommonJS)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
