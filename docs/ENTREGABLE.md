# Documento de Entrega del Proyecto: Plataforma de Videos en AWS

## 1. Datos Generales

* **Proyecto:** Desarrollo y Despliegue de una Plataforma de Videos con React, FastAPI y AWS
* **Tecnologías Principales:** React 18, Vite, FastAPI (FastAPI CLI), Amazon S3, Amazon EC2, Amazon RDS (PostgreSQL), PM2
* **Región AWS:** `us-east-1` (EE.UU. Este - N. Virginia)
* **Fecha de Despliegue:** Octubre 2026

---

## 2. Enlaces del Despliegue y Repositorio

| Recurso | Enlace / URL | Descripción |
| :--- | :--- | :--- |
| **Repositorio en GitHub** | [Repositorio en GitHub](https://github.com/A-Krycek/Desarrollo-y-despliegue-de-una-plataforma-de-videos-con-React-FastAPI-y-AWS.git) | Código fuente completo (Frontend, Backend, scripts de aprovisionamiento y documentación técnica). |
| **Frontend SPA (Página Principal)** | [CloudTube en AWS S3](http://video-platform-frontend-kry.s3-website-us-east-1.amazonaws.com) | Aplicación React alojada en Amazon S3 con Static Website Hosting habilitado. |
| **Demostración en Reproductor** | [Reproductor de Video (ID: 16)](http://video-platform-frontend-kry.s3-website-us-east-1.amazonaws.com/#player?id=16) | Vista de reproducción con streaming de video MP4, contador de vistas, miniaturas y comentarios. |
| **Documentación de la API (Swagger UI)** | [Swagger UI interactivo](http://3.89.105.251:8000/docs#/) | Documentación OpenAPI interactiva de FastAPI ejecutándose en Amazon EC2. |
| **Endpoint Raíz / Health Check** | [API Health Endpoint](http://3.89.105.251:8000/) | Verificación de estado operativo y metadatos de la API en producción. |
| **Documentación Alternativa (ReDoc)** | [ReDoc OpenAPI](http://3.89.105.251:8000/redoc) | Especificación OpenAPI renderizada mediante ReDoc. |

---

## 3. Resumen de la Arquitectura en AWS

```
+---------------------------------------------------------------------------------+
|                                 USUARIO / NAVEGADOR                             |
+---------------------------------------+-----------------------------------------+
                                        |
       +--------------------------------+-------------------------------+
       | Descarga SPA (HTML/JS/CSS)                                     | Carga Multimedia
       v                                                                v
+-------------------------------+                     +-----------------------------------+
|     Amazon S3 (Frontend)      |                     |      Amazon S3 (Multimedia)       |
|  video-platform-frontend-kry  |                     |  - video-platform-videos-kry      |
|  (Static Website Hosting)     |                     |  - video-platform-thumbnails-kry  |
+-------------------------------+                     +-----------------+-----------------+
                                                                        ^
                                       Llamadas REST / API (JSON)       | Subida / Lectura
                                       +--------------------------------+ (IAM Role EC2)
                                       v
                     +-----------------------------------+
                     |         Amazon EC2 Ubuntu         |
                     |         IP: 3.89.105.251          |
                     |  - FastAPI (fastapi run) en PM2   |
                     |  - Puerto 8000                    |
                     |  - IAM Role (Acceso a S3 sin keys)|
                     +-----------------+-----------------+
                                       |
                                       | Conexión Segura (Puerto 5432)
                                       v
                     +-----------------------------------+
                     |            Amazon RDS             |
                     |     PostgreSQL 16 / Postgres      |
                     |  - video-platform-db....rds       |
                     |  - Tablas: users, videos, comments|
                     +-----------------------------------+
```

---

## 4. Requerimientos Funcionales Implementados

### Página 1: Autenticación y Registro
* **Registro de Usuarios:** Formulario con validación de nombre, correo electrónico y contraseña. Almacenamiento con hash seguro de contraseñas mediante `bcrypt`.
* **Inicio de Sesión (Login):** Autenticación de credenciales y expedición de tokens JSON Web Tokens (JWT) firmados con expiración configurada.
* **Control de Sesión:** Persistencia local del token y actualización reactiva de la barra de navegación con avatar y estado de usuario.

### Página 2: Catálogo de Videos (Principal)
* **Visualización de Contenido:** Cuadrícula responsiva de videos con miniaturas optimizadas, títulos, autores, conteo de vistas y fecha formateada.
* **Búsqueda y Filtros:** Búsqueda en tiempo real por título y descripción de videos.
* **Publicación de Videos:** Modal interactivo que permite ingresar metadatos y subir archivos MP4 y miniaturas JPG/PNG con barra de progreso en tiempo real hacia Amazon S3.

### Página 3: Reproductor de Video y Comentarios
* **Reproductor HTML5:** Streaming fluido de video alojado directamente en el bucket de videos de S3.
* **Incremento Atómico de Vistas:** Registro en base de datos cada vez que un video es reproducido.
* **Sistema de Comentarios:** Listado dinámico de comentarios por video y formulario para agregar nuevas opiniones en tiempo real.
* **Videos Recomendados:** Barra lateral con videos sugeridos relacionados para navegación continua.

### Página 4: Perfil de Usuario y Gestión de Contenido
* **Información del Perfil:** Conteo total de videos publicados por el usuario autenticado.
* **Listado de Videos Propios:** Visualización de todas las publicaciones del usuario activo.
* **Edición de Metadatos:** Modal para actualizar el título y la descripción del video en la base de datos RDS.
* **Eliminación Segura:** Opción para borrar videos, eliminando tanto el registro en PostgreSQL como los archivos físicos correspondientes en los buckets de S3.

---

## 5. Detalles de Configuración de la Infraestructura Cloud

### 1. Amazon S3
* **Bucket Frontend:** `video-platform-frontend-kry`
  * Propiedad: Alojamiento de sitios web estáticos (*Static Website Hosting*) habilitado.
  * Documento de índice: `index.html`.
  * Documento de error: `index.html` (soporte nativo para enrutamiento SPA).
  * Política de bucket: Acceso público de solo lectura para `s3:GetObject`.
* **Bucket de Videos:** `video-platform-videos-kry`
  * Configuración CORS completa para permitir solicitudes `GET`, `PUT`, `POST` y `HEAD` desde el frontend.
* **Bucket de Miniaturas:** `video-platform-thumbnails-kry`
  * Configuración CORS activa y cabeceras `Cache-Control: public, max-age=31536000, immutable` para máxima eficiencia de carga en clientes.

### 2. Amazon EC2
* **Instancia:** Ubuntu 24.04 LTS (IP Pública: `3.89.105.251`).
* **Seguridad (Security Group):**
  * Puerto 22 (SSH) abierto para administración remota.
  * Puerto 8000 (TCP) abierto al público para recibir las peticiones REST de la SPA.
* **Seguridad IAM:** Rol asignado a la instancia (`EC2-VideoPlatform-S3-Role`) para interactuar con Amazon S3 de forma nativa sin exponer claves de acceso estáticas en archivos `.env` o código.
* **Gestión de Procesos:** **PM2** ejecutando el servidor de producción mediante:
  `fastapi run app/main.py --host 0.0.0.0 --port 8000` con reinicio automático ante fallos.

### 3. Amazon RDS
* **Motor:** PostgreSQL (Instancia `video-platform-db.c2z26ggasfw5.us-east-1.rds.amazonaws.com`).
* **Seguridad:** Grupo de seguridad configurado para permitir conexiones al puerto 5432 únicamente desde el grupo de seguridad de la instancia EC2.
* **Esquema:** Tablas relacionales normalizadas: `users`, `videos`, `comments` con claves foráneas e índices de búsqueda.

---

## 6. Aseguramiento de Calidad y Pruebas

* **Pruebas Automatizadas del Backend:** 12 pruebas de integración en `test_api.py` verificando el ciclo completo de autenticación, publicación, lectura, edición, comentarios y eliminación (100% aprobadas).
* **Auditoría Lighthouse:**
  * Accesibilidad: 100/100 (cumplimiento estricto de WCAG AA en contrastes y roles ARIA válidos).
  * SEO: 100/100 (metadatos de indexación, meta descripciones y etiquetas de compatibilidad).
  * Rendimiento: Carga de miniaturas principales con `fetchpriority="high"` y `loading="eager"`, junto con directivas `preconnect` a S3.
