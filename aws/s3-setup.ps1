# =======================================================================
# SCRIPT POWERSHELL PARA CREAR Y CONFIGURAR LOS 3 BUCKETS EN AMAZON S3
# Requisitos: AWS CLI instalado y configurado (aws configure)
# =======================================================================
$ErrorActionPreference = "Stop"

param(
    [string]$BucketFrontend = "video-platform-frontend-kry",
    [string]$BucketVideos = "video-platform-videos-kry",
    [string]$BucketThumbnails = "video-platform-thumbnails-kry",
    [string]$AwsRegion = "us-east-1"
)

$BUCKET_FRONTEND = $BucketFrontend
$BUCKET_VIDEOS = $BucketVideos
$BUCKET_THUMBNAILS = $BucketThumbnails
$AWS_REGION = $AwsRegion


Write-Host "=== Creando 3 Buckets en Región: $AWS_REGION ===" -ForegroundColor Cyan
Write-Host "Bucket Frontend:    $BUCKET_FRONTEND"
Write-Host "Bucket Videos:      $BUCKET_VIDEOS"
Write-Host "Bucket Miniaturas:  $BUCKET_THUMBNAILS"

# 1. Crear buckets
aws s3 mb "s3://$BUCKET_FRONTEND" --region "$AWS_REGION"
aws s3 mb "s3://$BUCKET_VIDEOS" --region "$AWS_REGION"
aws s3 mb "s3://$BUCKET_THUMBNAILS" --region "$AWS_REGION"

# 2. Desactivar bloqueo público
$buckets = @($BUCKET_FRONTEND, $BUCKET_VIDEOS, $BUCKET_THUMBNAILS)
foreach ($b in $buckets) {
    aws s3api put-public-access-block --bucket $b --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
}

# 3. Static Website Hosting en Frontend
aws s3 website "s3://$BUCKET_FRONTEND" --index-document index.html --error-document index.html

# 4. Políticas de lectura pública
foreach ($b in $buckets) {
    $policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$b/*"
    }
  ]
}
"@
    aws s3api put-bucket-policy --bucket $b --policy $policy
}

# 5. Configurar CORS
$cors = @"
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
"@

$corsTemp = [System.IO.Path]::GetTempFileName()
$cors | Out-File -FilePath $corsTemp -Encoding ascii
aws s3api put-bucket-cors --bucket $BUCKET_VIDEOS --cors-configuration "file://$corsTemp"
aws s3api put-bucket-cors --bucket $BUCKET_THUMBNAILS --cors-configuration "file://$corsTemp"
Remove-Item $corsTemp

Write-Host "=== Buckets configurados correctamente! ===" -ForegroundColor Green
Write-Host "URL SPA Frontend: http://$BUCKET_FRONTEND.s3-website-$AWS_REGION.amazonaws.com" -ForegroundColor Yellow
