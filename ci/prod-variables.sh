#!/bin/bash

# PORT is set by Google Cloud Run automatically

variables_array=(
  "NODE_ENV=production"
  
  "GUIHO_APP_MODE=prod"

  "PG_PORT=6000"
  "PG_DATABASE=guiho"
  "PG_USER=guiho"

  "VALKEY_PORT=7000"
)

join_by_comma() {
  local IFS=","
  echo "$*"
}

one_string=$(join_by_comma "${variables_array[@]}")

echo "$one_string"
