#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: No image tag provided."
  echo "Usage: $0 <docket-image-tag>"
  exit 1
fi

_image_tag=$1
_docker_image=nante40-core
_service=guiho-nante40-core
_service_account=nante40-core@guiho40.iam.gserviceaccount.com

script_dir=$(dirname $0)
variables_string=$("$script_dir/prod-variables.sh")
secrets_string=$("$script_dir/prod-secrets.sh")

echo "🔄 Checking if docker image $_docker_image:$_image_tag exist in the registry."
if ! gcloud container images describe europe-west4-docker.pkg.dev/guiho40/guiho/$_docker_image:$_image_tag > /dev/null 2>&1; then
  echo "❌ Docker image $_docker_image:$_image_tag does not exist in the registry."
  exit 1
fi
echo "✅ Docker image $_docker_image:$_image_tag exist in the registry."

echo "🔄 Deploying $_service with image $_docker_image:$_image_tag"

echo ""
echo "🕗 You have 10 seconds to cancel it (if needed). Otherwise wait!"

sleep 6 && echo "🕘 4 seconds left."
sleep 1 && echo "🕖 3 seconds left."
sleep 1 && echo "🕕 2 seconds left."
sleep 1 && echo "🕔 1 second left."
echo ""

gcloud run deploy $_service \
  --image europe-west4-docker.pkg.dev/guiho40/guiho/$_docker_image:$_image_tag \
  --service-account $_service_account \
  --timeout 3600 \
  --concurrency 100 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 4 \
  --port 8080 \
  --execution-environment gen2 \
  --region europe-west4 \
  --platform managed \
  --project guiho40 \
  --set-env-vars "$variables_string" \
  --set-secrets "$secrets_string" \
  --allow-unauthenticated \
  --session-affinity

  # --no-session-affinity \

  # Default
  #  --timeout 300
  #  --no-session-affinity
  #  --concurrency 100

  # WebSockets
  #  --timeout 3600
  #  --session-affinity
  #  --concurrency 1000

echo "✅ Deployment done."
echo "🚀 https://core.nante40.guiho.co"
