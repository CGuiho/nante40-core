#!/bin/bash

# A script to list all tags for a specific Docker image in a
# Google Artifact Registry repository.

echo "🔄 Starting Artifact Registry Tag Lister..."

# --- Configuration ---
# Set your project, location, and repository details here.
PROJECT_ID="guiho40"
LOCATION="europe-west4"
REPOSITORY="guiho"
# --- End Configuration ---

# Exit script on any error
set -e
# Exit script if any command in a pipeline fails
set -o pipefail

# --- Functions ---
print_usage() {
  echo "Usage: $0 <IMAGE_NAME>"
  echo ""
  echo "Lists all tags and versions for a given image in Artifact Registry."
  echo ""
  echo "Arguments:"
  echo "  <IMAGE_NAME>         The name of the image to inspect (e.g., 'organization')."
  echo ""
  echo "Example:"
  echo "  $0 organization"
}

# --- Argument Parsing ---
if [[ "$#" -ne 1 ]]; then
  echo "❌ Error: Invalid number of arguments."
  print_usage
  exit 1
fi

IMAGE_NAME="$1"

# --- Main Logic ---
FULL_IMAGE_PATH="projects/${PROJECT_ID}/locations/${LOCATION}/repositories/${REPOSITORY}/packages/${IMAGE_NAME}"
FULL_IMAGE_BASE_PATH="${LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}"


echo "========================================================================"
echo "Artifact Registry Tag Lister"
echo "========================================================================"
echo "Project:        ${PROJECT_ID}"
echo "Location:       ${LOCATION}"
echo "Repository:     ${REPOSITORY}"
echo "Image:          ${IMAGE_NAME}"
echo "========================================================================"
echo ""

echo "🕗 Fetching all versions and tags for image '${IMAGE_NAME}'..."
echo "Full Image Path: ${FULL_IMAGE_BASE_PATH}"
echo ""

### *** THIS IS THE CORRECTED AND IMPROVED COMMAND *** ###
# The '--include-tags' flag is crucial to ensure tags are listed.
# The '--format' flag provides a clear, tabular output with the desired columns.
gcloud artifacts docker images list "${FULL_IMAGE_BASE_PATH}" \
  --include-tags \
  --sort-by="~UPDATE_TIME" \
  --format="table(
      DIGEST,
      TAGS,
      UPDATE_TIME.date(format='%Y-%m-%d %H:%M:%S')
    )"

echo ""
echo "✅ Listing complete."
