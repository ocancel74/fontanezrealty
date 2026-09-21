# Joe Fontanez — Real Estate Website

Sitio web estático para **Joe Fontanez, Real Estate Broker Lic. 12114**, con un
panel de administración (CMS) sin necesidad de programar, alojado
completamente en **GitHub Pages** (sin WordPress, PHP, MySQL ni servidor
tradicional).

```
Joe / Admin → CMS (Decap CMS) → GitHub Repository → GitHub Actions (build) → GitHub Pages → Visitantes
```

- **CMS:** [Decap CMS](https://decapcms.org/) (git-based, de código abierto). Joe
  edita propiedades, testimonios, áreas y configuración desde `/admin/`; cada
  cambio se guarda como un commit en este repositorio.
- **Build:** `scripts/build.js` (Node.js) convierte el contenido de `/content`
  en el sitio final: genera `config/*.json` para las páginas dinámicas y una
  página estática real por propiedad en `/properties/<slug>/` (URLs limpias,
  sin `?id=`).
- **Deploy:** `.github/workflows/deploy.yml` corre el build automáticamente en
  cada `push` a `main` y publica el resultado con las acciones oficiales de
  GitHub Pages (`actions/upload-pages-artifact` + `actions/deploy-pages`).
- **Sitio público:** 100% estático (HTML/CSS/JS). Nada de esto requiere un
  servidor propio ni una base de datos.

---

## Antes de empezar: una limitación importante de GitHub Pages

GitHub Pages solo puede servir archivos estáticos; no puede ejecutar código
con secretos (como el "client secret" de una app de GitHub). Decap CMS con
backend de GitHub necesita ese intercambio para iniciar sesión. Por eso hace
falta un **OAuth provider** pequeño y separado (no es un servidor tradicional,
es una función gratuita en Vercel, Netlify o Cloudflare Workers que solo hace
el intercambio de login). Esto es normal y es la forma estándar de usar Decap
CMS con GitHub Pages — no hay forma de evitarlo sin cambiar de proveedor de
alojamiento. Los pasos exactos están en la sección "Configurar autenticación"
más abajo.

---

## 1. Crear el repositorio en GitHub

1. Crea un repositorio nuevo en GitHub (público o privado).
2. Sube el contenido de esta carpeta a ese repositorio:

```bash
git init
git add .
git commit -m "Sitio inicial de Joe Fontanez Real Estate"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## 2. Configurar el CMS (`admin/config.yml`)

Abre `admin/config.yml` y reemplaza:

- `backend.repo` → `TU-USUARIO/TU-REPO`
- `backend.base_url` → la URL de tu OAuth provider (ver paso 3)
- `site_url` / `display_url` → la URL pública final del sitio

## 3. Configurar la autenticación (OAuth provider)

Necesitas desplegar un pequeño proveedor de OAuth para GitHub. Opción
recomendada (gratis, sin tarjeta): **Vercel**.

1. Crea una GitHub OAuth App: GitHub → Settings → Developer settings → OAuth
   Apps → New OAuth App.
   - Homepage URL: la URL de tu sitio (o la de Vercel, provisionalmente).
   - Authorization callback URL: `https://TU-OAUTH-PROVIDER.vercel.app/callback`
   - Guarda el `Client ID` y el `Client secret` que te da GitHub.
2. Despliega un proveedor de OAuth para Decap CMS en Vercel. Hay varias
   implementaciones de código abierto listas para usar (por ejemplo
   `decap-cms-oauth` de daresaydigital, o cualquier equivalente actualizado
   que encuentres en GitHub buscando "decap cms oauth provider vercel").
   Al desplegarlo en Vercel, configura como variables de entorno de Vercel
   (nunca en este repositorio):
   - `OAUTH_CLIENT_ID` = el Client ID de tu OAuth App
   - `OAUTH_CLIENT_SECRET` = el Client secret de tu OAuth App
3. Copia la URL que te da Vercel (ej. `https://mi-oauth.vercel.app`) y
   pégala en `admin/config.yml` → `backend.base_url`.
4. Haz commit y push del `config.yml` actualizado.

**Nunca pongas el Client secret dentro de este repositorio.** Vive únicamente
como variable de entorno en Vercel (o el proveedor que uses).

El administrador inicial es **Joe Fontanez**, autenticado con su propia
cuenta de GitHub (con acceso de escritura al repositorio). Se pueden invitar
más colaboradores luego desde GitHub → Settings → Collaborators.

## 4. Activar GitHub Pages

1. En el repositorio: Settings → Pages.
2. En "Build and deployment" → Source, selecciona **GitHub Actions**
   (no "Deploy from a branch").
3. Con eso basta — el workflow en `.github/workflows/deploy.yml` se encarga
   del resto la próxima vez que se haga push a `main`.

## 5. GitHub Actions (cómo funciona)

`.github/workflows/deploy.yml` corre automáticamente en cada push a `main`
(incluyendo los commits que hace Decap CMS al publicar). Pasos del workflow:

1. Descarga el repositorio.
2. Instala Node.js y las dependencias (`npm ci`).
3. Corre `npm run build`, que ejecuta `scripts/build.js`.
4. Publica el resultado (`_site/`) como artefacto de Pages.
5. Despliega ese artefacto a GitHub Pages.

No es necesario configurar ningún secret para este workflow — usa
`GITHUB_TOKEN`, que GitHub genera automáticamente.

`_site/` es una carpeta generada (no se sube al repositorio, ver
`.gitignore`); siempre se reconstruye desde `/content` en cada build, tanto
en GitHub Actions como localmente.

## 6. Dominio personalizado (`joefontanez.com`)

Mientras no exista un dominio propio, el sitio funcionará en:
`https://TU-USUARIO.github.io/TU-REPO/`

Cuando tengas el dominio:

1. En tu proveedor de DNS, crea un registro `CNAME` apuntando
   `www.joefontanez.com` → `TU-USUARIO.github.io` (y/o los registros `A` de
   GitHub Pages para el dominio raíz — ver la documentación de GitHub Pages
   sobre dominios personalizados apex).
2. En GitHub: Settings → Pages → Custom domain → escribe `joefontanez.com` y
   guarda. GitHub creará automáticamente un archivo `CNAME` en el
   despliegue — **no lo agregues manualmente a este repositorio** mientras no
   tengas el dominio, para no romper el dominio `github.io` por defecto.
3. Activa "Enforce HTTPS" en esa misma pantalla (aparece unos minutos
   después de verificar el dominio).
4. Actualiza `siteUrl` en el CMS (Configuración → Configuración general) a la
   URL final. El build usa ese valor para las etiquetas SEO/Open Graph y el
   sitemap.

## 7. Formulario de contacto (sin backend propio)

El formulario usa [Formspree](https://formspree.io) (gratis para uso básico),
compatible con sitios 100% estáticos:

1. Crea una cuenta gratuita en Formspree y un formulario nuevo.
2. Copia el endpoint (`https://formspree.io/f/xxxxxxxx`).
3. Pégalo en el CMS: Configuración → Configuración general →
   "Endpoint de Formspree".

Si ese campo queda vacío, el formulario funciona igual: se abre el programa
de correo del visitante con un `mailto:` prellenado hacia el email de Joe.

## 8. WhatsApp

El número de WhatsApp se configura desde el CMS (Configuración →
Configuración general → "Número de WhatsApp"), en formato internacional solo
números (ej. `17871234567`). Si se deja vacío, el botón de WhatsApp se oculta
automáticamente en todo el sitio. Al escribir desde una propiedad específica,
el mensaje incluye automáticamente el nombre, el Property ID y la URL de esa
propiedad.

## 9. Estructura del proyecto

```
/
├── index.html, properties.html, property.html,
│   about.html, services.html, contact.html,
│   privacy.html, terms.html, 404.html      ← páginas públicas
├── admin/                                   ← Decap CMS (config.yml, dashboard)
├── content/                                 ← contenido editado por el CMS
│   ├── properties/   *.es.md / *.en.md
│   ├── testimonials/ *.es.md / *.en.md
│   └── settings/     general.yml, areas.yml
├── assets/            imágenes, iconos, fotos de propiedades
├── css/, js/                                ← estilos y comportamiento del sitio
├── scripts/build.js                         ← genera el sitio final (_site/)
├── scripts/dev-server.js                    ← servidor local para previsualizar
├── .github/workflows/deploy.yml             ← build + deploy automático
└── _site/            (generado, no se sube a git)
```

`property.html` en la raíz es un visor de **desarrollo** (lee `?slug=...` y
carga los datos por JavaScript); las páginas reales que Google indexa y que
se comparten son las generadas en `/properties/<slug>/`.

## 10. Previsualizar localmente

```bash
npm install
npm run build
npm run serve
```

Abre `http://localhost:5050`. Cada vez que cambies contenido en `/content`
manualmente (o el CMS haga un commit que jales con `git pull`), corre
`npm run build` de nuevo para regenerar la previsualización.

## 11. Crear la primera propiedad real / Editar información de Joe

Ver **[JOE-CMS-GUIDE.md](JOE-CMS-GUIDE.md)** — guía paso a paso sin lenguaje
técnico, escrita para Joe.

## 12. Multi-idioma (Español / English)

- El contenido editorial (propiedades, testimonios, biografía de Joe) se
  traduce campo por campo dentro del mismo formulario del CMS (pestañas
  ES/EN), gracias al soporte de i18n de Decap CMS
  (`content/properties/<slug>.es.md` y `<slug>.en.md`).
- El texto de la interfaz (menú, botones, etiquetas) está en
  `js/language.js` y se traduce con el selector **ES | EN** del sitio.

## 13. SEO incluido

- `<title>`, meta description, canonical, Open Graph, Twitter Cards y
  Schema.org (`RealEstateAgent` en Home/Sobre Joe, `RealEstateListing` en
  cada propiedad) en todas las páginas.
- `sitemap.xml` y `robots.txt` se generan automáticamente en cada build a
  partir de las propiedades publicadas y de `siteUrl`.
- URLs amigables para propiedades: `/properties/<slug>/` (sin `?id=`).

## 14. Qué NO se inventó (y dónde completarlo)

Siguiendo instrucciones explícitas, este proyecto **no inventa** teléfono,
brokerage, años de experiencia, premios, certificaciones, testimonios ni
fotos reales de Joe o de propiedades. Donde falta esa información verás
`[AGREGAR INFORMACIÓN]` o un campo vacío editable desde el CMS
(Configuración → Configuración general, y Sobre Joe → biografía).

---

## Notas técnicas para quien mantenga el código

- Dependencias de build: `gray-matter`, `js-yaml`, `marked`, `sharp`
  (optimización de imágenes a WebP; si `sharp` no puede instalarse en algún
  entorno, el build continúa sin optimizar imágenes — no es un paso crítico).
- No hay framework de frontend; HTML/CSS/JS planos a propósito, para que
  cualquier desarrollador futuro pueda entender el proyecto sin herramientas
  adicionales.
- `content/properties/demo-001.*.md` es una propiedad de ejemplo,
  **publicada en `false`** por defecto — sirve como plantilla y para probar
  el CMS, no aparece en el sitio público hasta que se publique o se elimine.
