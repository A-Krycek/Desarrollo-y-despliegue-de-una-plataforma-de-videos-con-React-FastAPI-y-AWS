# Guía de Preparación de Evidencias para la Entrega

Este documento sirve como lista de verificación (*checklist*) y plantilla de reporte para recopilar todas las evidencias solicitadas en la sección **6. Entrega** de la actividad académica.

---

## 1. Tabla Resumen de URLs y Enlaces de Entrega

| Elemento | URL / Identificador | Observaciones |
| :--- | :--- | :--- |
| **Repositorio GitHub / GitLab** | `https://github.com/<tu-usuario>/video-platform-aws` | Código completo del Frontend, Backend (FastAPI CLI) y documentación. |
| **URL Pública de la SPA** | `http://<bucket-frontend>.s3-website-<region>.amazonaws.com` | Alojada en el Bucket 1 de Amazon S3 con Static Website Hosting. |
| **URL Pública de FastAPI** | `http://<ip-publica-ec2>:8000/docs` | Documentación interactiva Swagger UI iniciada con `fastapi dev`. |
| **Video Explicativo** | `https://youtu.be/...` o enlace a Google Drive/Loom | Grabación demostrativa de la plataforma y la arquitectura AWS. |

---

## 2. Lista de Capturas de Pantalla Requeridas

Toma capturas de pantalla claras de la consola de AWS y de la aplicación web:

### A. Evidencia de Amazon EC2
1. **Instancia en Ejecución**:
   - Captura de la consola de EC2 mostrando la instancia en estado `Running` (En ejecución).
   - Mostrar la **Dirección IPv4 pública**, el **Tipo de instancia** (`t2.micro` o `t3.micro`) y el **ID de la instancia**.
2. **Grupo de Seguridad (Security Group)**:
   - Captura de las Reglas de entrada (`Inbound Rules`) mostrando los puertos `8000` (FastAPI), `80` (HTTP opcional) y `22` (SSH).
3. **IAM Role**:
   - Captura de la sección de seguridad de la instancia EC2 donde se aprecie el **Rol de IAM** asignado (`EC2-VideoPlatform-S3-Role`).
4. **Terminal / Consola SSH**:
   - Captura de la terminal ejecutando manualmente:
     ```bash
     fastapi dev --host 0.0.0.0 --port 8000
     ```
     Mostrando el banner oficial de FastAPI CLI:
     ```
      Starting FastAPI in development mode
      Using import string: main:app
      Server started at http://0.0.0.0:8000
        Documentation at http://0.0.0.0:8000/docs
     ```

---

### B. Evidencia de Amazon RDS
1. **Estado de la Base de Datos**:
   - Captura de la consola de RDS mostrando la base de datos en estado `Disponible` (*Available*).
   - Mostrar el **Punto de enlace (Endpoint)** y el puerto (`5432` para PostgreSQL o `3306` para MySQL).
2. **Grupo de Seguridad de RDS**:
   - Captura de las reglas de entrada mostrando que solo permite tráfico proveniente del grupo de seguridad de EC2 (`sg-ec2-api`).
3. **Tablas Creadas**:
   - Captura de un cliente SQL o terminal mostrando las 3 tablas creadas por el `lifespan` de FastAPI: `users`, `videos`, `comments`.

---

### C. Evidencia de los Tres Buckets de Amazon S3
1. **Listado de Buckets**:
   - Captura de la consola principal de S3 donde se listen los 3 buckets:
     - `video-platform-frontend-...`
     - `video-platform-videos-...`
     - `video-platform-thumbnails-...`
2. **Bucket 1 (Frontend)**:
   - Captura de la pestaña **Propiedades** con la sección **Alojamiento de sitios web estáticos** en estado `Habilitado`.
   - Captura del contenido del bucket mostrando **únicamente la estructura de `dist/`** (`index.html`, carpeta `assets/`).
3. **Bucket 2 (Videos)**:
   - Captura de la pestaña **Permisos** mostrando la configuración **CORS**.
   - Captura de la pestaña **Objetos** mostrando archivos `.mp4` almacenados tras las pruebas.
4. **Bucket 3 (Miniaturas)**:
   - Captura de la pestaña **Permisos** con la configuración **CORS**.
   - Captura de la pestaña **Objetos** con imágenes `.jpg`, `.jpeg` o `.png`.

---

### D. Evidencias del Funcionamiento de la Aplicación (SPA + FastAPI)

1. **Evidencia de Registro**:
   - Captura de la **Página 1 (Registro)** con los campos completados (Nombre, Correo, Contraseña).
   - Captura del mensaje de confirmación de registro y redirección automática.
2. **Evidencia de Login**:
   - Captura del formulario de inicio de sesión y la cabecera del Navbar mostrando el nombre del usuario y el avatar una vez autenticado.
3. **Evidencia de Publicación de Videos**:
   - Captura del modal de subida con el título, descripción, selección de archivo MP4 y miniatura.
   - Captura de la barra de progreso de subida a Amazon S3.
4. **Evidencia del Catálogo de Videos (Página 2: Principal)**:
   - Captura de la vista principal mostrando múltiples tarjetas de video con:
     - Miniatura cargada desde el Bucket S3 de miniaturas.
     - Título del video.
     - Nombre del usuario autor.
     - Contador de vistas.
     - Fecha formateada de publicación.
5. **Evidencia de Reproducción (Página 3: Reproductor)**:
   - Captura del reproductor de video HTML5 reproduciendo el archivo MP4 alojado en el Bucket S3 de videos.
   - Detalle de título, descripción completa y autor.
   - Contador de vistas incrementado.
6. **Evidencia de Videos Recomendados**:
   - Captura de la columna lateral en el reproductor mostrando los videos sugeridos obtenidos dinámicamente desde la API.
7. **Evidencia de Comentarios**:
   - Captura del formulario de comentarios con un comentario publicado por el usuario.
   - Captura del listado de comentarios reflejando el autor y la fecha/hora.
8. **Evidencia de Perfil del Usuario (Página 4: Perfil)**:
   - Captura mostrando los datos básicos del usuario, cantidad de videos publicados y la lista de videos subidos.
   - Captura de la ventana modal para **actualizar información del video** (título/descripción).
   - Captura de la confirmación de **eliminación de un video**.
9. **Evidencia de Documentación Interactiva FastAPI**:
   - Captura de la URL pública `http://<IP-EC2>:8000/docs` mostrando los routers: `Usuarios`, `Videos`, `Comentarios` y `General`.

---

## 3. Guion Recomendado para el Video Explicativo (Duración: 5 a 8 minutos)

| Tiempo | Sección | Qué mostrar y explicar |
| :--- | :--- | :--- |
| **00:00 - 01:00** | **Introducción y Arquitectura** | Presenta tu nombre, el objetivo del proyecto y muestra el diagrama de arquitectura AWS explicando el rol de cada servicio (S3 Frontend, S3 Videos, S3 Miniaturas, EC2 con FastAPI CLI y RDS). |
| **01:00 - 02:00** | **Demostración de AWS Console** | Muestra en vivo la consola de AWS: los 3 buckets S3 configurados, la instancia EC2 activa y la base de datos RDS en estado Disponible. Destaca el uso del IAM Role sin claves quemadas. |
| **02:00 - 03:00** | **Encendido Manual con FastAPI CLI y /docs** | Muestra la terminal SSH en EC2 ejecutando `fastapi dev --host 0.0.0.0 --port 8000`. Luego abre en el navegador `http://<IP-EC2>:8000/docs` mostrando Swagger UI interactivo. |
| **03:00 - 04:30** | **Registro, Login y Publicación** | Abre la URL pública de la SPA en S3. Demuestra el registro de un nuevo usuario, el inicio de sesión y la subida de un video MP4 con su miniatura observando la subida a S3. |
| **04:30 - 06:00** | **Catálogo y Reproductor** | Regresa al Catálogo (Página 2), abre el video en el Reproductor (Página 3), reproduce el contenido, demuestra el incremento de vistas, los videos recomendados y publica un comentario. |
| **06:00 - 07:00** | **Gestión en Perfil del Usuario** | Navega a la Página 4 (Perfil), muestra la cantidad de videos, edita el título de un video y demuestra la eliminación del video verificando que desaparezca del catálogo. |
| **07:00 - 07:30** | **Conclusiones** | Resumen de los requerimientos cumplidos y cierre de la presentación. |
