#!/bin/bash

# A script to delete old Docker image tags from a Google Artifact Registry repository,
# keeping a specified number of the most recent tags.
#
# Deletion is done by a unique digest, which ensures the entire image version and all its
# associated tags are removed.
#
# This version uses a robust gcloud list | awk | tail pipeline for maximum compatibility.

echo "🔄 Starting Artifact Registry Cleanup Script..."

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
  echo "Usage: $0 [--force] <IMAGE_NAME> <NUM_TAGS_TO_KEEP>"
  echo ""
  echo "Deletes all but the N most recent tags for a given image in Artifact Registry."
  echo ""
  echo "Arguments:"
  echo "  <IMAGE_NAME>         The name of the image to clean up (e.g., 'organization')."
  echo "  <NUM_TAGS_TO_KEEP>   The number of recent image versions to keep."
  echo ""
  echo "Options:"
  echo "  --force              Actually perform the deletion. By default, the script runs in"
  echo "                       'dry run' mode and only prints what it would delete."
  echo ""
  echo "Example (Dry Run):"
  echo "  $0 organization 4"
  echo ""
  echo "Example (Execute Deletion):"
  echo "  $0 --force organization 4"
}

# --- Argument Parsing ---
DRY_RUN=true
if [[ "$1" == "--force" ]]; then
  DRY_RUN=false
  shift # Remove --force from the arguments list
fi

if [[ "$#" -ne 2 ]]; then
  echo "Error: Invalid number of arguments."
  print_usage
  exit 1
fi

IMAGE_NAME="$1"
NUM_TO_KEEP="$2"

# Validate that NUM_TO_KEEP is a positive integer
if ! [[ "$NUM_TO_KEEP" =~ ^[0-9]+$ ]] || [[ "$NUM_TO_KEEP" -lt 1 ]]; then
    echo "❌ Error: <NUM_TAGS_TO_KEEP> must be a positive number."
    print_usage
    exit 1
fi

# --- Main Logic ---
FULL_IMAGE_BASE_PATH="${LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}"

echo "========================================================================"
echo "Artifact Registry Cleanup"
echo "========================================================================"
echo "Project:        ${PROJECT_ID}"
echo "Location:       ${LOCATION}"
echo "Repository:     ${REPOSITORY}"
echo "Image:          ${IMAGE_NAME}"
echo "Tags to keep:   ${NUM_TO_KEEP}"
if [ "$DRY_RUN" = true ]; then
  echo "Mode:           DRY RUN (no changes will be made)"
else
  echo "Mode:           EXECUTE (deletions will be performed)"
fi
echo "========================================================================"
echo ""

echo "Fetching all versions for image '${IMAGE_NAME}'..."
echo "🕗 FULL_IMAGE_BASE_PATH: ${FULL_IMAGE_BASE_PATH}"

### *** THIS IS THE ROBUST, CORRECTED COMMAND *** ###
DIGESTS_TO_DELETE=$(gcloud artifacts docker images list "${FULL_IMAGE_BASE_PATH}" \
  --sort-by="~UPDATE_TIME" \
  | awk 'NR>1 {print $2}' \
  | tail -n +$((NUM_TO_KEEP + 1))
)


# Check if there's anything to delete
if [ -z "$DIGESTS_TO_DELETE" ]; then
  echo "🕗 No image versions found to delete. All versions are within the retention count (${NUM_TO_KEEP})."
  exit 0
fi

echo "🕗 The following image versions (digests) will be DELETED:"
echo "${DIGESTS_TO_DELETE}"
echo ""

# Loop through the list of digests and delete them
echo "🕗 Starting deletion process..."
while IFS= read -r digest; do
  # Construct the full image reference using the digest
  image_to_delete="${FULL_IMAGE_BASE_PATH}@${digest}"

  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would delete: ${image_to_delete}"
  else
    echo "🗑️ Deleting: ${image_to_delete}"
    gcloud artifacts docker images delete "${image_to_delete}" --delete-tags --quiet
    echo "Successfully deleted."
  fi
done <<< "$DIGESTS_TO_DELETE"

echo ""
echo "✅ Cleanup complete."
