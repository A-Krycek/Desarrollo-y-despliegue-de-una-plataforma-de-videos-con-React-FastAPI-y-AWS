# Guía de Despliegue en AWS (EC2 + RDS + S3)

Esta guía documenta el procedimiento paso a paso para el despliegue y puesta en marcha de la **Plataforma de Videos** en la infraestructura de **Amazon Web Services (AWS)** con los recursos aprovisionados.

---

## 1. Resumen de Recursos Aprovisionados

| Componente | Recurso AWS | Identificador / Valor |
| :--- | :--- | :--- |
| **Instancia EC2** | Nombre | `video-platform-api` |
| | ID de Instancia | `i-04273f9c71ed7f695` |
| | IP Pública | `3.89.105.251` |
| | IP Privada | `172.31.29.57` |
| | Sistema Operativo | Ubuntu 26.04 / 24.04 LTS (amd64) |
| | Tipo | `t3.micro` |
| | Security Group | `video-platform-ec2-sg` (`sg-03936b6c3db887868`) |
| **Base de Datos RDS** | Identificador | `video-platform-db` |
| | Endpoint | `video-platform-db.c2z26ggasfw5.us-east-1.rds.amazonaws.com` |
| | Motor | PostgreSQL 18.3 |
| | Puerto | `5432` |
| | Usuario | `postgres` |
| | Base de Datos | `postgres` |
| | Security Group | `sg-database-rds` (`sg-04e61852f6ffaed59`) |
| **IAM** | Rol de Instancia | `EC2-VideoPlatform-Role` |
| | Política | `EC2-VideoPlatform-S3-Policy` |
| **Almacenamiento S3** | Región | `us-east-1` |
| | Bucket Frontend | `video-platform-frontend-kry` |
| | Bucket Videos | `video-platform-videos-kry` |
| | Bucket Miniaturas | `video-platform-thumbnails-kry` |

---

## 2. Paso 1: Configurar Permisos y CORS en los Buckets S3

Para permitir la visualización de la SPA, streaming de videos y subidas directas desde el navegador:

### 2.1. Habilitar Alojamiento de Sitios Web Estáticos en Frontend
1. Ve a **Amazon S3** > Bucket `video-platform-frontend-kry` > **Propiedades**.
2. Al final, en **Alojamiento de sitios web estáticos**, pulsa **Editar**:
   - Selecciona **Habilitar**.
   - Documento de índice: `index.html`.
   - Documento de error: `index.html`.
   - Guarda los cambios.
3. El endpoint resultante de tu SPA es:
   `http://video-platform-frontend-kry.s3-website-us-east-1.amazonaws.com`

### 2.2. Desactivar Bloqueo de Acceso Público
En los 3 buckets (`video-platform-frontend-kry`, `video-platform-videos-kry`, `video-platform-thumbnails-kry`):
- Pestaña **Permisos** > **Bloqueo del acceso público (configuración de bucket)** > **Editar**.
- **Desmarcar** la casilla *"Bloquear todo el acceso público"* y confirmar guardado.

### 2.3. Aplicar Políticas de Bucket (Bucket Policy)
- En `video-platform-frontend-kry`, copia y pega el contenido del archivo `aws/s3-bucket-policy-frontend.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObjectFrontend",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::video-platform-frontend-kry/*"
    }
  ]
}
```

- En `video-platform-videos-kry` y `video-platform-thumbnails-kry`, aplica la política pública de lectura de `aws/s3-bucket-policy-media.json`.

### 2.4. Aplicar Configuración CORS para Subida Directa (Presigned PUT)
En `video-platform-videos-kry` y `video-platform-thumbnails-kry`:
- Pestaña **Permisos** > **Uso compartido de recursos entre orígenes (CORS)** > **Editar**.
- Pega el contenido de `aws/s3-cors.json`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedOrigins": [
      "http://video-platform-frontend-kry.s3-website-us-east-1.amazonaws.com",
      "http://3.89.105.251:8000",
      "http://localhost:5173",
      "*"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 3. Paso 2: Despliegue del Backend FastAPI en Amazon EC2

### 3.1. Conexión SSH a la Instancia
```bash
ssh -i "tu-llave.pem" ubuntu@3.89.105.251
```

### 3.2. Instalación de Paquetes del Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv libpq-dev git
```

### 3.3. Clonación o Copia del Código
```bash
# Si usas Git:
git clone <URL_DE_TU_REPOSITORIO> video-platform-aws
cd video-platform-aws/backend

# O si transfieres via SCP / SFTP a /home/ubuntu/video-platform-aws/backend
```

### 3.4. Entorno Virtual e Instalación de Dependencias
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.5. Archivo de Variables de Entorno (`.env`)
Verifica o crea `/home/ubuntu/video-platform-aws/backend/.env`:
```ini
ENVIRONMENT=production

# Conexión confirmada a Amazon RDS PostgreSQL
DATABASE_URL=postgresql://postgres:videoplatform@video-platform-db.c2z26ggasfw5.us-east-1.rds.amazonaws.com:5432/postgres


AWS_REGION=us-east-1
S3_BUCKET_VIDEOS=video-platform-videos-kry
S3_BUCKET_THUMBNAILS=video-platform-thumbnails-kry

# Vacíos para usar automáticamente el IAM Role EC2-VideoPlatform-Role
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

JWT_SECRET_KEY=prod_video_platform_aws_jwt_secret_key_kry_2026
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

CORS_ORIGINS=http://video-platform-frontend-kry.s3-website-us-east-1.amazonaws.com,http://video-platform-frontend-kry.s3-website.us-east-1.amazonaws.com,http://3.89.105.251:8000,http://localhost:5173,*

PORT=8000
HOST=0.0.0.0
```

### 3.6. Ejecución del Servidor como Servicio Systemd (Recomendado)
Para asegurar que el backend se mantenga activo permanentemente:
```bash
sudo cp /home/ubuntu/video-platform-aws/aws/video-platform.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable video-platform
sudo systemctl start video-platform
```

Verifica el estado del servicio:
```bash
sudo systemctl status video-platform
```

### 3.7. Comprobación de la API
Visita en tu navegador:
- Swagger UI: `http://3.89.105.251:8000/docs`
- Healthcheck: `http://3.89.105.251:8000/health` (debe responder `{"status":"healthy","database":"connected",...}`)

---

## 4. Paso 3: Compilación y Despliegue del Frontend React en S3

El frontend ya se encuentra configurado para apuntar a la IP de la instancia EC2 (`http://3.89.105.251:8000`).

### 4.1. Compilación
En tu entorno de desarrollo local (o en la terminal donde tengas Node.js instalado):
```bash
cd frontend
npm install
npm run build
```
Esto genera la carpeta optimizada `dist/`.

### 4.2. Sincronización con el Bucket S3
Sube únicamente los artefactos de `dist/` a `video-platform-frontend-kry`:
```bash
aws s3 sync dist/ s3://video-platform-frontend-kry --delete
```
*(O ejecuta `./aws/deploy-frontend.ps1` en PowerShell o `./aws/deploy-frontend.sh` en Linux/macOS)*.

---

## 5. Paso 4: Pruebas Funcionales Completas en la Nube

1. Ingresa a la URL del Frontend:
   `http://video-platform-frontend-kry.s3-website-us-east-1.amazonaws.com`
2. Realiza el flujo completo:
   - **Registro de Usuario**: Crea una cuenta nueva.
   - **Login**: Inicia sesión y verifica que el token JWT se almacena y la sesión se mantiene activa.
   - **Publicación de Video**: Sube un video `.mp4` y una miniatura `.jpg/.png`. Observa la barra de progreso de subida directa a S3.
   - **Catálogo Principal**: Verifica que la miniatura y los metadatos cargan desde S3 y RDS.
   - **Reproducción de Video**: Haz clic en el video y comprueba la reproducción nativa HTML5 desde S3.
   - **Contador de Vistas**: Verifica que las vistas aumentan de forma atómica.
   - **Comentarios**: Agrega comentarios y comprueba que aparecen al instante.
   - **Gestión de Videos**: Ve a tu perfil, edita el título/descripción y elimina un video, verificando que desaparece del catálogo y de S3.
