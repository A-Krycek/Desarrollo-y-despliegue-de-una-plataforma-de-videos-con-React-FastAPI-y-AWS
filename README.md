# CloudTube - Plataforma de Videos con React, FastAPI y AWS

Plataforma de videos tipo Single Page Application (SPA) desarrollada con **React + Vite**, **FastAPI (FastAPI CLI: `fastapi dev` / `fastapi run`)**, **Amazon S3**, **Amazon EC2** y **Amazon RDS**.

![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%5Bstandard%5D-009688?logo=fastapi)
![AWS S3](https://img.shields.io/badge/AWS-S3%20%7C%20EC2%20%7C%20RDS-orange?logo=amazon-aws)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20MySQL-336791?logo=postgresql)

---

## 🏛️ Arquitectura del Sistema

El proyecto implementa una arquitectura cloud desacoplada, moderna y escalable:

- **Frontend (SPA)**: Desarrollada en **React + Vite**, compilada en `dist/` y alojada en **Amazon S3** con *Static Website Hosting*.
- **Backend API**: Desarrollada en **FastAPI** con la CLI oficial (`fastapi[standard]`). Se ejecuta directamente en una instancia **Amazon EC2 (Ubuntu)** usando `fastapi dev` (desarrollo) o `fastapi run` (producción).
- **Base de Datos**: Instancia gestionada en **Amazon RDS (PostgreSQL / MySQL)** que almacena usuarios, metadatos de videos y comentarios.
- **Almacenamiento Multimedia (Amazon S3)**:
  - **Bucket 1 (Frontend)**: Hospeda la aplicación web SPA compilada (`dist/`).
  - **Bucket 2 (Videos)**: Almacena archivos de video en formato MP4 (hasta 100 MB).
  - **Bucket 3 (Miniaturas)**: Almacena imágenes de portada (JPG, JPEG, PNG).
- **Seguridad**: Autenticación JWT, hashing de contraseñas PBKDF2/SHA-256, **IAM Roles** (Instance Profile sin credenciales quemadas en código) y **Security Groups** restringidos.

Para ver los diagramas detallados y políticas, consulta el archivo [ARQUITECTURA.md](docs/ARQUITECTURA.md).

---

## 📄 Estructura de Páginas de la SPA

La aplicación cuenta estrictamente con las 4 páginas requeridas:

1. **Página 1: Registro / Login (`AuthPage`)**
   - Creación de cuenta e inicio de sesión.
   - Campos mínimos: Nombre, Correo y Contraseña.
   - Generación de token JWT y sesión persistente en `localStorage`.

2. **Página 2: Principal (`HomePage`)**
   - Catálogo dinámico de videos consumido desde FastAPI en EC2.
   - Cada tarjeta muestra: Miniatura, Título, Usuario autor, Número de vistas y Fecha de publicación.
   - Barra de búsqueda interactiva en tiempo real.

3. **Página 3: Reproductor (`PlayerPage`)**
   - Reproductor de video HTML5 transmitiendo directamente desde Amazon S3 (MP4).
   - Título, descripción expandible, usuario que publicó y contador de vistas (se incrementa automáticamente al reproducir).
   - Módulo de comentarios (`CommentSection`) con formulario para comentar y listado dinámico.
   - Lista lateral de videos recomendados cargados dinámicamente desde la API.

4. **Página 4: Perfil del usuario (`ProfilePage`)**
   - Información básica del usuario y cantidad de videos publicados.
   - Lista de videos subidos por el usuario.
   - Modal para publicar nuevo video (MP4 y miniatura con barra de progreso).
   - Consultar / reproducir videos propios.
   - Actualizar información del video (Título y descripción vía `PUT /videos/{id}`).
   - Eliminar video (borrado en RDS y en los buckets S3 correspondientes vía `DELETE /videos/{id}`).

---

## 🚀 Estructura del Repositorio

```
video-platform-aws/
├── frontend/                   # Single Page Application (React + Vite)
│   ├── public/                 # Archivos estáticos
│   ├── src/
│   │   ├── api/client.js       # Cliente Axios y llamadas a FastAPI
│   │   ├── components/         # Navbar, VideoCard, CommentSection, Modales
│   │   ├── context/            # AuthContext (JWT, usuario activo)
│   │   ├── pages/              # Páginas 1, 2, 3 y 4
│   │   ├── App.jsx             # Enrutador SPA y layout principal
│   │   ├── App.css             # Estilos modernos modo oscuro
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── backend/                    # API REST (FastAPI)
│   ├── main.py                 # Punto de entrada principal (autodescubierto por fastapi dev/run)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuración mediante variables de entorno
│   │   ├── database.py         # Conexión SQLAlchemy (RDS PostgreSQL / MySQL / SQLite)
│   │   ├── models.py           # Modelos User, Video, Comment
│   │   ├── schemas.py          # Esquemas Pydantic
│   │   ├── auth.py             # Hash de contraseñas y tokens JWT
│   │   ├── s3.py               # Integración con Amazon S3 vía Boto3 / IAM Role
│   │   └── routers/            # Routers /users, /videos, /comments
│   ├── requirements.txt        # Dependencias oficiales (fastapi[standard])
│   ├── test_api.py             # Suite de pruebas automatizadas (12/12)
│   └── .env.example
├── aws/                        # Scripts de soporte para S3 y RDS
│   ├── s3-setup.sh / .ps1      # Creación de los 3 buckets S3 y políticas CORS
│   ├── deploy-frontend.sh      # Compilación y sincronización de dist/ a S3
│   ├── deploy-frontend.ps1     # Versión PowerShell para desplegar dist/ a S3
│   └── rds-schema.sql          # DDL de base de datos para PostgreSQL / MySQL
└── docs/                       # Documentación académica de soporte
    ├── ARQUITECTURA.md         # Diagramas y descripción técnica
    ├── GUIA_DESPLIEGUE_AWS.md  # Tutorial de despliegue paso a paso
    └── EVIDENCIAS_GUIA.md      # Checklist de evidencias y guion del video
```

---

## 💻 Ejecución y Pruebas en Entorno Local

Puedes probar la plataforma de forma local inmediatamente:

### 1. Iniciar el Backend con FastAPI CLI
```bash
cd backend
python -m venv venv

# En Linux / Mac:
source venv/bin/activate
# En Windows:
.\venv\Scripts\activate

pip install -r requirements.txt

# Iniciar servidor con la CLI oficial de FastAPI:
fastapi dev
```
FastAPI autodescubrirá `main.py` y levantará el servidor en: `http://127.0.0.1:8000`
Documentación interactiva disponible en: `http://127.0.0.1:8000/docs`

### 2. Ejecutar Pruebas Automatizadas
```bash
python test_api.py
```
*(Valida los 12 flujos requeridos: registro, login, subida, catálogo, reproducción, vistas, comentarios, edición y eliminación)*.

### 3. Iniciar el Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Abre en tu navegador: `http://localhost:5173`

---

## ☁️ Despliegue Manual en Amazon EC2 (Paso a Paso)

Para encender el servidor manualmente en tu instancia EC2:

1. **Conéctate por SSH a la instancia EC2**:
   ```bash
   ssh -i "tu-clave.pem" ubuntu@<IP_PUBLICA_EC2>
   ```

2. **Instala los paquetes básicos**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y python3 python3-pip python3-venv git libpq-dev
   ```

3. **Clona tu repositorio**:
   ```bash
   git clone https://github.com/<tu-usuario>/video-platform-aws.git
   cd video-platform-aws/backend
   ```

4. **Crea el entorno virtual e instala dependencias**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Configura tus variables de entorno (`.env`)**:
   ```bash
   nano .env
   ```
   *(Ingresa los endpoints de tu RDS y los nombres de tus buckets S3)*.

6. **Enciende el servidor con FastAPI**:
   ```bash
   # Modo desarrollo con auto-reload:
   fastapi dev --host 0.0.0.0 --port 8000

   # O modo producción:
   fastapi run --host 0.0.0.0 --port 8000
   ```

7. **Verifica en tu navegador**:
   ```
   http://<IP_PUBLICA_EC2>:8000/docs
   ```

---

## 📋 Resumen de Endpoints de la API

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Healthcheck y verificación de conexión activa con RDS | No |
| `POST` | `/users` | Registrar nuevo usuario | No |
| `POST` | `/login` | Iniciar sesión y obtener token JWT | No |
| `GET` | `/users/{id}` | Consultar perfil y conteo de videos | No |
| `GET` | `/videos` | Listar catálogo de videos (búsqueda y paginación) | No |
| `GET` | `/videos/{id}` | Ver detalle del video | No |
| `POST` | `/videos/{id}/views` | Incremento atómico del contador de vistas | No |
| `POST` | `/videos/presigned-url` | Generar Presigned URLs para subida directa a S3 | **Bearer JWT** |
| `POST` | `/videos/direct` | Registrar metadatos tras subida directa a S3 | **Bearer JWT** |
| `POST` | `/videos` | Fallback de streaming multipart a S3 | **Bearer JWT** |
| `PUT` | `/videos/{id}` | Actualizar título y descripción | **Bearer JWT** (Autor) |
| `DELETE` | `/videos/{id}` | Eliminar video de RDS y objetos de S3 | **Bearer JWT** (Autor) |
| `POST` | `/videos/{id}/comments` | Agregar comentario a un video | **Bearer JWT** |
| `GET` | `/videos/{id}/comments` | Listar comentarios de un video (paginado) | No |
| `GET` | `/docs` | Documentación interactiva Swagger UI | No |


---

## 📦 Lista de Verificación para la Entrega

Antes de entregar la actividad, asegúrate de tener todos los requisitos listados en [EVIDENCIAS_GUIA.md](docs/EVIDENCIAS_GUIA.md):
- [x] Repositorio en GitHub / GitLab con código limpio y sin credenciales.
- [x] URL pública de la SPA funcionando en S3.
- [x] URL pública de FastAPI interactiva en `http://<IP_EC2>:8000/docs`.
- [x] Capturas de EC2 (Instancia, Security Groups, IAM Role, ejecución de `fastapi dev`).
- [x] Capturas de RDS (Estado disponible, Endpoint, tablas creadas).
- [x] Capturas de los 3 buckets en S3 con sus políticas y contenidos.
- [x] Capturas demostrando el funcionamiento de las 4 páginas y todas las funciones.
- [x] Video explicativo grabado siguiendo el guion estructurado.
