#!/bin/bash

# @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.

set -e

_repo_url="https://github.com/cguiho/guiho-core.git"
_package_name="@guiho40/guiho-core" # Also change this on the command line below. (around line 14)

_cwd=$(pwd)
_repo_dir="$_cwd/../../.temp/guiho-core"
_project_dir=$_repo_dir/core

if [ -z "$1" ]; then
  echo "No version tag provided. Using the latest tag."
  latest_tag=$(git ls-remote --tags $_repo_url | grep -o 'refs/tags/guiho-core@[^ ]*' | sed 's#refs/tags/##' | grep -v '\^{}' | sort -V | tail -n1)
  echo "Using Latest tag: $latest_tag"
  
  _tag=$latest_tag
else
  _tag="$_package_name@$_version"
fi

echo "🔥🎯 Version tag: $_tag"

sleep 2

function cleanup {
  rm -rf "$_repo_dir"
}
cleanup

mkdir -p "$_repo_dir"

cd "$_repo_dir"

git clone $_repo_url .
git checkout $_tag

cd $_project_dir

function beforeBuilding {
  echo "Preparing for publishing..."

  # --- Swap package.json ---

  # Check if the build file exists before proceeding
  if [ -f "package.build.json" ]; then
    echo "Swapping package.json..."
    # Delete the original package.json if it exists
    rm -f package.json
    # Rename package.build.json to package.json
    mv package.build.json package.json
  else
    echo "Warning: package.build.json not found. Skipping swap."
  fi


  # --- Swap tsconfig.json ---

  # Check if the build file exists before proceeding
  if [ -f "tsconfig.build.json" ]; then
    echo "Swapping tsconfig.json..."
    # Delete the original tsconfig.json if it exists
    rm -f tsconfig.json
    # Rename tsconfig.build.json to tsconfig.json
    mv tsconfig.build.json tsconfig.json
  else
    echo "Warning: tsconfig.build.json not found. Skipping swap."
  fi

  echo "✅ Preparation complete. Ready to publish."
}

beforeBuilding

echo "Building $_package_name version: $_tag"

bun x google-artifactregistry-auth
bun install

bun run typecheck
bun test

bun run pkg:build

bun publish

cleanup
