#!/bin/bash

# @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.

# Function to load environment variables from a .env file
load_env() {
  local env_file="$1"

  # Check if the .env file exists
  if [ ! -f "$env_file" ]; then
    echo "Error: .env file not found at '$env_file'"
    return 1
  fi

  # Read the .env file line by line and export the variables
  while IFS='=' read -r key value
  do
    # Ignore comments and empty lines
    if [[ ! "$key" =~ ^# ]] && [[ -n "$key" ]]; then
      # Remove leading/trailing whitespace from key and value
      key=$(echo "$key" | xargs)
      value=$(echo "$value" | xargs)

      # Remove surrounding quotes from the value if they exist
      value="${value#\"}"
      value="${value%\"}"
      value="${value#\'}"
      value="${value%\'}"

      # Export the variable to the current shell
      export "$key"="$value"
    fi
  done < "$env_file"

  echo "Environment variables from '$env_file' loaded."
}

# Use the first argument as the .env file path, or default to ./.env
ENV_FILE_PATH="${1:-./.env}"

# Call the function to load the .env file
load_env "$ENV_FILE_PATH"
