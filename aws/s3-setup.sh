#!/usr/bin/env bash
# =======================================================================
# SCRIPT DE CREACIÓN Y CONFIGURACIÓN DE LOS 3 BUCKETS EN AMAZON S3
# Requisitos: AWS CLI configurado (aws configure)
# =======================================================================
set -e

# Nombres de buckets configurados para la plataforma de videos en AWS
AWS_REGION="us-east-1"

BUCKET_FRONTEND="${1:-video-platform-frontend-kry}"
BUCKET_VIDEOS="${2:-video-platform-videos-kry}"
BUCKET_THUMBNAILS="${3:-video-platform-thumbnails-kry}"


echo "=== Configurando 3 Buckets en Región: $AWS_REGION ==="
echo "Bucket Frontend:    $BUCKET_FRONTEND"
echo "Bucket Videos:      $BUCKET_VIDEOS"
echo "Bucket Miniaturas:  $BUCKET_THUMBNAILS"

# 1. Crear los 3 buckets
echo "--- 1. Creando Buckets ---"
aws s3 mb "s3://$BUCKET_FRONTEND" --region "$AWS_REGION"
aws s3 mb "s3://$BUCKET_VIDEOS" --region "$AWS_REGION"
aws s3 mb "s3://$BUCKET_THUMBNAILS" --region "$AWS_REGION"

# 2. Desactivar bloqueo de acceso público para buckets
echo "--- 2. Configurando Acceso Público ---"
for BUCKET in "$BUCKET_FRONTEND" "$BUCKET_VIDEOS" "$BUCKET_THUMBNAILS"; do
  aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
done

# 3. Habilitar Static Website Hosting en Bucket 1 (Frontend)
echo "--- 3. Habilitando Static Website Hosting en Bucket Frontend ---"
aws s3 website "s3://$BUCKET_FRONTEND" \
  --index-document index.html \
  --error-document index.html

# 4. Políticas de lectura pública para los 3 buckets
echo "--- 4. Aplicando Políticas de Lectura Pública (Bucket Policy) ---"
for BUCKET in "$BUCKET_FRONTEND" "$BUCKET_VIDEOS" "$BUCKET_THUMBNAILS"; do
  POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/*"
    }
  ]
}
EOF
)
  aws s3api put-bucket-policy --bucket "$BUCKET" --policy "$POLICY"
done

# 5. Configurar CORS para Videos y Miniaturas
echo "--- 5. Configurando CORS para streaming y carga de miniaturas ---"
CORS_CONFIG=$(cat <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF
)
aws s3api put-bucket-cors --bucket "$BUCKET_VIDEOS" --cors-configuration "$CORS_CONFIG"
aws s3api put-bucket-cors --bucket "$BUCKET_THUMBNAILS" --cors-configuration "$CORS_CONFIG"

echo "=== Configuración de S3 completada con éxito ==="
echo "URL Pública de la SPA (Frontend):"
echo "http://$BUCKET_FRONTEND.s3-website-$AWS_REGION.amazonaws.com"
echo ""
echo "Recuerda actualizar estas variables en tu archivo .env del backend:"
echo "S3_BUCKET_VIDEOS=$BUCKET_VIDEOS"
echo "S3_BUCKET_THUMBNAILS=$BUCKET_THUMBNAILS"
