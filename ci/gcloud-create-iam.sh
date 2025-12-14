#!/bin/bash

# --- Variables ---
export PROJECT_ID="guiho40"

export SA_ID="guiho-core"
export SA_DISPLAY_NAME="GUIHO Core"
export SA_DESCRIPTION="Backend of GUIHO application."

# --- Announce ---
echo -e "\n🚀 Creating and configuring GCP IAM Service Account for $SA_DISPLAY_NAME \n"
echo "🕗 You have 10 seconds to cancel it (if needed). Otherwise wait!"

sleep 6 && echo "🕘 4 seconds left."
sleep 1 && echo "🕖 3 seconds left."
sleep 1 && echo "🕕 2 seconds left."
sleep 1 && echo "🕔 1 second left."


# --- Configuration ---

echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

echo "Creating service account [$SA_ID]..."

gcloud iam service-accounts create $SA_ID \
  --display-name="$SA_DISPLAY_NAME" \
  --description="$SA_DESCRIPTION"

# Construct the full email address of the new service account
export SA_EMAIL="${SA_ID}@${PROJECT_ID}.iam.gserviceaccount.com"
echo "Service account created with email: $SA_EMAIL"


# --- Grant the Required IAM Roles ---

ROLES=(
  "roles/artifactregistry.reader"
  "roles/artifactregistry.writer"
  "roles/firebase.admin"
  "roles/firebaseauth.admin"
  "roles/pubsub.editor"
  "roles/secretmanager.secretAccessor"
  "roles/iam.serviceAccountTokenCreator"
  "roles/storage.objectUser"
)

echo "Granting IAM roles to $SA_EMAIL..."

# Loop through the array and grant each role one by one.
for ROLE in "${ROLES[@]}"; do
  echo "--> Adding role: $ROLE"
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --condition=None
done

echo ""
echo "✅ Done. Service account [$SA_ID] is created and configured."
