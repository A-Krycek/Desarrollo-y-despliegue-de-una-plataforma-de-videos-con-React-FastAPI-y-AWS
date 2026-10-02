#!/usr/bin/env bash
# =======================================================================
# SCRIPT PARA COMPILAR Y SUBIR LA SPA A S3 FRONTEND
# =======================================================================
set -e

BUCKET_NAME="${1:-video-platform-frontend-kry}"
REGION="${2:-us-east-1}"


echo "=== 1. Compilando aplicación React con Vite ==="
cd "$(dirname "$0")/../frontend"
npm install
npm run build

echo "=== 2. Verificando que dist/ existe ==="
if [ ! -d "dist" ]; then
  echo "Error: dist/ no existe."
  exit 1
fi

echo "=== 3. Sincronizando dist/ con s3://$BUCKET_NAME ==="
# Sube únicamente dist/, nunca src/, node_modules/ ni package.json
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --region "$REGION"

echo "=== Despliegue completado con éxito ==="
echo "Accede a tu SPA en S3:"
echo "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
