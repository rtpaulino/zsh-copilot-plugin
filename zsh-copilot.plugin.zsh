#!/usr/bin/env zsh

# zsh-copilot - Interactive LLM prompt mode for zsh
# Press Ctrl+Space to enter prompt mode

# Get the directory where this script is located
typeset -g ZSH_COPILOT_PLUGIN_DIR="${0:A:h}"

# Main widget that handles the prompt mode
_zsh_copilot_prompt_mode() {
    # Save the original buffer
    local original_buffer="$BUFFER"
    
    # Create a temp file to store the result
    local temp_file=$(mktemp)
    
    # Set up trap to always remove temp file
    trap "rm -f '$temp_file'" EXIT INT TERM
    
    # Allow interaction outside of ZLE
    zle -I
    
    # Print newline and run the Node.js script, passing temp file path as argument
    # Redirect stdin from tty to allow inquirer to read input
    
    node "$ZSH_COPILOT_PLUGIN_DIR/copilot-prompt.js" "$temp_file" < /dev/tty
    local exit_code=$?
    
    # Read the result from temp file
    local result
    if [[ -f "$temp_file" && -s "$temp_file" ]]; then
        result=$(<"$temp_file")
    fi
    
    # If successful (exit code 0), use the result as the new buffer
    if [[ $exit_code -eq 0 && -n "$result" ]]; then
        BUFFER="$result"
        CURSOR=${#BUFFER}
    else
        # If cancelled or error, restore original buffer
        BUFFER="$original_buffer"
    fi
    
    zle reset-prompt
}

# Create ZLE widget
zle -N _zsh_copilot_prompt_mode

# Bind Ctrl+Space to the widget
bindkey '^ ' _zsh_copilot_prompt_mode
