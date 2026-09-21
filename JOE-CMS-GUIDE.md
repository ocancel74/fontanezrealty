# Guía para Joe — Cómo administrar el sitio web

Esta guía no usa lenguaje técnico. Todo lo que necesitas hacer día a día se
hace desde el panel de administración, en tu navegador.

**Panel de administración:** `https://TU-SITIO/admin/`
(pídele a tu desarrollador el enlace exacto la primera vez).

Cada vez que guardas y publicas algo, el sitio web se actualiza solo, en
unos 1-3 minutos. No necesitas tocar código ni pedirle ayuda a nadie para
los cambios del día a día.

---

## Cómo entrar

1. Abre el enlace del panel administrativo.
2. Presiona "Iniciar sesión con GitHub".
3. Inicia sesión con tu cuenta de GitHub (la que se configuró para ti).

---

## Cómo agregar una propiedad

1. Entra al panel administrativo.
2. Selecciona **Properties**.
3. Selecciona **New Property**.
4. Completa la información: título, precio, tipo, dirección, ciudad,
   habitaciones, baños, área, etc.
5. Sube las fotografías (ver sección "Fotografías" abajo).
6. Selecciona la fotografía principal.
7. Marca **Featured** si quieres que aparezca en la página de inicio.
8. Arriba a la derecha, presiona **Publish** (o guarda como borrador con
   **Save** si aún no quieres publicarla).
9. Espera 1-3 minutos a que el sitio se actualice solo.

Recuerda completar la propiedad **en los dos idiomas** (hay pestañas o
secciones para Español e Inglés en el mismo formulario) para que se vea bien
en ambos.

## Cómo editar una propiedad

1. **Properties** → selecciona la propiedad de la lista.
2. Cambia lo que necesites.
3. Presiona **Publish** otra vez para que el cambio salga al sitio.

## Cómo eliminar una propiedad

1. **Properties** → abre la propiedad.
2. Busca el menú de opciones (usualmente arriba, junto a "Publish") y
   selecciona **Delete entry**.

## Cómo duplicar una propiedad

Útil cuando una propiedad nueva se parece mucho a otra que ya tienes.

1. **Properties** → abre la propiedad que quieres copiar.
2. Busca el menú de opciones y selecciona **Duplicate**.
3. Se abrirá una copia nueva — cambia lo que sea diferente (dirección,
   precio, fotos) y publica.

## Cómo publicar o despublicar una propiedad

- Para ocultarla del sitio sin borrarla: abre la propiedad y desmarca la
  casilla **Publicada**, luego presiona **Publish** para guardar ese cambio.
- Para que vuelva a aparecer: marca **Publicada** otra vez y publica.

## Cómo marcar (o quitar) Featured

Abre la propiedad → marca o desmarca la casilla **Featured (destacada en
Home)** → **Publish**. Las propiedades "Featured" y publicadas aparecen en
la página de inicio, hasta un máximo de 6.

## Cómo cambiar el precio

**Properties** → abre la propiedad → cambia el campo **Precio (USD)** →
**Publish**.

## Cómo cambiar el status

**Properties** → abre la propiedad → cambia **Status** a una de estas
opciones → **Publish**:

- For Sale (En venta)
- Pending (Pendiente)
- Sold (Vendida)
- For Rent (En alquiler)
- Rented (Alquilada)

## Fotografías

Cada propiedad admite:

- Una **fotografía principal** (la que se ve en las tarjetas de propiedades).
- Una **galería** de hasta 30 fotos.

Para subir fotos: en el campo correspondiente, presiona "Choose an image" (o
arrastra el archivo), selecciona el archivo desde tu computadora o teléfono,
y espera a que termine de subir.

- Para **eliminar** una foto de la galería: pasa el cursor sobre ella y
  presiona la "X" o el ícono de basura que aparece.
- Para **reordenar**: arrastra las fotos dentro de la lista de la galería.
- Para cambiar la **foto principal**: reemplaza el campo "Fotografía
  principal" por la que quieras usar.

Recomendación: sube fotos de buena calidad pero no extremadamente pesadas
(idealmente menos de 5 MB cada una) para que el sitio cargue rápido.

## Cómo agregar un testimonio

1. **Testimonios** → **New Testimonial**.
2. Escribe el nombre y el texto del cliente (en ambos idiomas).
3. Agrega la fecha y una foto si quieres (ambas son opcionales).
4. Marca **Publicado** si ya quieres que se vea en el sitio.
5. **Publish**.

Si no marcas "Publicado", el testimonio queda guardado pero no se muestra.

## Cómo agregar, editar o eliminar un área de servicio

1. **Configuración** → **Áreas de servicio**.
2. Verás una lista (San Juan, Guaynabo, Carolina, etc.).
3. Para agregar: presiona "Add" debajo de la lista y escribe el nombre.
4. Para editar: haz clic en el nombre y cámbialo.
5. Para eliminar: presiona el ícono de basura junto al área.
6. **Save** (o **Publish**, según cómo esté configurado).

## Cómo cambiar tu información (Sobre Joe, email, WhatsApp, foto)

1. **Configuración** → **Configuración general**.
2. Ahí puedes cambiar:
   - Nombre, título profesional y número de licencia.
   - Email de contacto.
   - Número de WhatsApp (déjalo vacío si todavía no quieres mostrar el
     botón de WhatsApp).
   - Tu fotografía profesional.
   - La fotografía del Hero (la imagen grande de la página de inicio).
   - Tu biografía ("Sobre Joe"), en español e inglés.
3. **Publish**.

**Importante:** no se debe inventar experiencia, premios, certificaciones ni
brokerage. Si no tienes esa información lista todavía, dejar el campo vacío
es correcto — el sitio mostrará un espacio en blanco o un aviso, nunca
información falsa.

## El Dashboard

Dentro del panel administrativo hay un enlace **Dashboard** (arriba) que te
muestra números rápidos: total de propiedades, cuántas están en venta,
pendientes, vendidas, en alquiler, alquiladas, destacadas y publicadas. Es
de solo lectura — para cambiar algo, usa siempre la sección **Properties**.

## ¿Cuánto tarda en verse el cambio en el sitio?

Normalmente entre 1 y 3 minutos después de presionar **Publish**. Si después
de 10 minutos no ves el cambio, avísale a tu desarrollador — puede haber un
error en la publicación automática (GitHub Actions) que hay que revisar.

## ¿Qué hago si me equivoco?

Nada se pierde. Cada cambio que publicas queda guardado en el historial del
repositorio de GitHub, así que siempre se puede volver a una versión
anterior si es necesario — pídele ayuda a tu desarrollador para eso.
