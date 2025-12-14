#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.

_app_name="$1"

if [ -z "$_app_name" ]; then
  echo "Usage: $0 <app-name>" >&2
  exit 1
fi

_repo_url="https://github.com/cguiho/${_app_name}.git"

echo "Fetching latest tag for app: ${_app_name} from repo: $_repo_url" >&2

# Fetches tags, finds the ones matching the app name pattern, sorts them by version, and gets the last one.
# The output is redirected to /dev/null to suppress git's progress messages on stderr.
latest_tag=$(git ls-remote --tags $_repo_url 2>/dev/null | grep -o "refs/tags/${_app_name}@[^ ]*" | sed 's#refs/tags/##' | grep -v '\^{}' | sort -V | tail -n1)

if [ -z "$latest_tag" ]; then
  echo "No tags found for app: ${_app_name}" >&2
  exit 1
fi

# tag shape: <app-name>@X.Y.Z
# Where X is major, Y is minor, Z is patch
_version="$(echo "$latest_tag" | cut -d'@' -f2)"

echo "Using Latest tag: $latest_tag" >&2
echo "Version: $_version" >&2

# Output only the version number to stdout
echo "$_version"
