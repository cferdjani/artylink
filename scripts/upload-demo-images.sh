#!/usr/bin/env bash
# Script d'exemple pour uploader des images demo dans un bucket Supabase nommé 'demos'.
# Requis: supabase CLI installé et authentifié, ou utilisez curl avec une clé de service.

# Utilisation:
# chmod +x scripts/upload-demo-images.sh
# ./scripts/upload-demo-images.sh <path-to-images-dir>

set -euo pipefail
IMAGES_DIR=${1:-./public/images}
BUCKET="demos"

if [ ! -d "$IMAGES_DIR" ]; then
  echo "Directory $IMAGES_DIR does not exist"
  exit 1
fi

for f in "$IMAGES_DIR"/*; do
  filename=$(basename "$f")
  echo "Uploading $filename to bucket $BUCKET..."
  # supabase storage requires you to be authenticated with supabase CLI
  supabase storage upload "$BUCKET/$filename" "$f" --no-guess-file-type --file-path "$filename" || {
    echo "Failed to upload $filename via supabase CLI; try with curl and SERVICE_ROLE_KEY"
  }
done

echo "Done. Files uploaded to bucket: $BUCKET"