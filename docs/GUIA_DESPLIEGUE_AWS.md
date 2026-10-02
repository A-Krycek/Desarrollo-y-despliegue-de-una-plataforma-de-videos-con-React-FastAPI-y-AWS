# Guía de Despliegue en AWS (EC2 + RDS + S3 + PM2)

Esta guía documenta el procedimiento paso a paso para el despliegue y puesta en marcha de la **Plataforma de Videos** en la infraestructura de **Amazon Web Services (AWS)** con los recursos aprovisionados y gestión de procesos con **PM2**.

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
      "http://video-platform-frontend-kry.s3-website.us-east-1.amazonaws.com",
      "http://localhost:5173"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 3. Paso 2: Despliegue del Backend FastAPI en Amazon EC2 con PM2

### 3.1. Conexión SSH a la Instancia
```bash
ssh -i "tu-llave.pem" ubuntu@3.89.105.251
```

### 3.2. Instalación de Paquetes Base del Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv libpq-dev git nodejs npm
```

### 3.3. Clonación o Actualización del Repositorio
```bash
git clone https://github.com/A-Krycek/Desarrollo-y-despliegue-de-una-plataforma-de-videos-con-React-FastAPI-y-AWS.git
cd Desarrollo-y-despliegue-de-una-plataforma-de-videos-con-React-FastAPI-y-AWS/backend
```

### 3.4. Entorno Virtual e Instalación de Dependencias
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```
*(Nota: `requirements.txt` incluye `"fastapi[standard]"` que instala el comando CLI oficial `fastapi`)*.

Verifica la disponibilidad de la CLI:
```bash
fastapi --help
```

### 3.5. Configuración del Archivo `.env`
Crea o edita `/home/ubuntu/Desarrollo-y-despliegue-de-una-plataforma-de-videos-con-React-FastAPI-y-AWS/backend/.env`:
```ini
ENVIRONMENT=production

DATABASE_URL=postgresql://postgres:videoplatform@video-platform-db.c2z26ggasfw5.us-east-1.rds.amazonaws.com:5432/postgres

AWS_REGION=us-east-1
S3_BUCKET_VIDEOS=video-platform-videos-kry
S3_BUCKET_THUMBNAILS=video-platform-thumbnails-kry

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

JWT_SECRET_KEY=prod_video_platform_aws_jwt_secret_key_kry_2026
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

CORS_ORIGINS=http://video-platform-frontend-kry.s3-website-us-east-1.amazonaws.com,http://video-platform-frontend-kry.s3-website.us-east-1.amazonaws.com,http://localhost:5173

PORT=8000
HOST=0.0.0.0
```

### 3.6. Prueba Manual de Producción con FastAPI CLI
Antes de configurar PM2, comprueba que la API inicia correctamente:
```bash
fastapi run app/main.py --host 0.0.0.0 --port 8000
```
Comprueba abriendo en tu navegador:
```
http://3.89.105.251:8000/docs
```
Si Swagger UI carga correctamente, detén el proceso en la terminal con `Ctrl + C`.

---

### 3.7. Instalación y Puesta en Marcha con PM2

1. **Instalar PM2 de forma global**:
```bash
sudo npm install -g pm2
pm2 --version
```

2. **Levantar la API con el ejecutable FastAPI del entorno virtual**:
Estando en `~/Desarrollo-y-despliegue-de-una-plataforma-de-videos-con-React-FastAPI-y-AWS/backend`:
```bash
pm2 start venv/bin/fastapi --name video-platform-api -- run app/main.py --host 0.0.0.0 --port 8000
```
*(O utilizando el archivo de configuración: `pm2 start ecosystem.config.js`)*.

3. **Verificar el estado y logs**:
```bash
pm2 status
pm2 logs video-platform-api
```
*(Para salir de la vista de logs sin detener el servicio, presiona `Ctrl + C`)*.

4. **Persistir el proceso ante reinicios de la máquina EC2**:
```bash
pm2 save
pm2 startup
```
*Ejecuta el comando `sudo env PATH=...` que te devuelva la terminal y vuelve a ejecutar:*
```bash
pm2 save
```

---

### 3.8. Comandos Útiles de Administración con PM2

- **Ver estado general**: `pm2 status`
- **Ver logs en tiempo real**: `pm2 logs video-platform-api`
- **Reiniciar la API tras cambios de código**: `pm2 restart video-platform-api`
- **Detener temporalmente**: `pm2 stop video-platform-api`
- **Volver a iniciar**: `pm2 start video-platform-api`
- **Eliminar de la lista de PM2**: `pm2 delete video-platform-api`

---

## 4. Paso 3: Compilación y Despliegue del Frontend React en S3

El frontend ya se encuentra configurado para apuntar a la IP de la instancia EC2 (`http://3.89.105.251:8000`).

### 4.1. Compilación
En tu entorno de desarrollo local:
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
   - Registro de usuario.
   - Login (autenticación JWT).
   - Publicación de video MP4 y miniatura con subida directa a S3.
   - Catálogo principal con metadatos de RDS.
   - Reproducción de video HTML5 desde S3.
   - Contador de vistas atómico.
   - Comentarios dinámicos.
   - Gestión de videos propios en perfil (edición y eliminación).
