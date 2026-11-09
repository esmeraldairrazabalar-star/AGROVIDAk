# AgroVida

Plataforma web agrícola: cultivos, análisis de planta por comparación de imágenes, catálogo de enfermedades, historial y panel de administrador.

## Cómo funciona

- **Login / Registro / Google**: los usuarios se guardan en la colección `users` de la base de datos.
- **Administrador**: es la cuenta cuyo UID existe en la colección `admins` (se crea una sola vez desde la consola).
- **Catálogo de enfermedades**: colección `enfermedades_catalogo`, con varias fotos por enfermedad.
- **Analizar planta**: compara la foto con las fotos del catálogo y muestra la ficha de la enfermedad que más se parezca; si ninguna coincide, lo indica.

## Puesta en marcha (una sola vez)

1. Authentication → Sign-in method: activar **Correo/contraseña** y **Google**.
2. Authentication → Users → **Add user**: crear el correo y contraseña del administrador y copiar su **UID**.
3. Firestore Database → **Start collection** `admins` → Document ID = el UID copiado → campo `rol` (string) = `admin`.
4. Firestore Database → Rules: pegar el contenido de `firebase/firestore.rules` y **Publish**.
5. Abrir la página con Live Server (no con doble clic en el archivo) e ingresar con **Acceso de administrador**.
6. En Panel de Administrador → Catálogo de Enfermedades → **Importar catálogo base** (opcional) y agregar tus enfermedades con fotos.

## Estructura

```
index.html            Interfaz completa (login, app, panel admin, modales)
css/styles.css        Estilos
js/firebase-config.js Conexión, utilidades de imagen y almacenamiento local
js/auth.js            Sesión, registro, Google, roles
js/enfermedades.js    Catálogo en tiempo real
js/similitud.js       Comparador de imágenes (color, distribución y textura)
js/analisis.js        Cámara y análisis de planta
js/admin.js           Usuarios y enfermedades (agregar, editar, eliminar)
firebase/             Reglas de seguridad
img/fondo-login.jpg   Fondo del login
```
