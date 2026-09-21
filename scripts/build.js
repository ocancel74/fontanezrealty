#!/usr/bin/env node
/**
 * scripts/build.js
 *
 * Turns the CMS content in /content into the static site that gets deployed
 * to GitHub Pages. Run by .github/workflows/deploy.yml on every push to main
 * (i.e. every time Decap CMS commits a change), and can also be run locally
 * with `npm run build` to preview changes before they are published.
 *
 * What it does, in order:
 *   1. Copies the public site files (html/css/js/assets/admin) into ./_site,
 *      the build output directory. Nothing under /content, /scripts or
 *      node_modules ships to production.
 *   2. Replaces the placeholder domain used in <link rel="canonical">/OG tags
 *      with the real site URL configured in content/settings/general.yml, so
 *      Joe never has to hand-edit HTML for SEO tags.
 *   3. Reads content/properties/*.<lang>.md and content/testimonials/*.<lang>.md
 *      (front matter parsed with gray-matter) and writes them out as
 *      _site/config/properties.<lang>.json and testimonials.<lang>.json for
 *      the client-side listing/filter pages to fetch.
 *   4. Generates a real static HTML page per PUBLISHED property at
 *      _site/properties/<slug>/index.html (Spanish) and
 *      _site/properties/<slug>/en/index.html (English), each with resolved
 *      <title>/meta description/canonical/Open Graph/Twitter/JSON-LD tags —
 *      this is what gives properties clean, crawlable, shareable URLs
 *      without query strings on plain GitHub Pages hosting.
 *   5. Generates _site/sitemap.xml and _site/robots.txt.
 *   6. Best-effort image optimization (WebP copies) via sharp; failures here
 *      never fail the build, they just skip optimization for that image.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");
const { marked } = require("marked");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_DIR = path.join(ROOT, "_site");
const PLACEHOLDER_DOMAIN = "https://REEMPLAZAR-CON-TU-DOMINIO.example.com";

const COPY_EXCLUDE = new Set([
  "content", "scripts", "node_modules", ".git", ".github",
  "package.json", "package-lock.json", "README.md", "JOE-CMS-GUIDE.md",
  "_site", ".gitignore", "_redirects"
]);

const FEATURE_LABELS = {
  es: { view: "Vista", pool: "Piscina", terrace: "Terraza", balcony: "Balcón", security: "Seguridad", generator: "Generador", cistern: "Cisterna", gym: "Gimnasio", marina: "Muelle / Marina", furnished: "Amueblado" },
  en: { view: "View", pool: "Pool", terrace: "Terrace", balcony: "Balcony", security: "Security", generator: "Generator", cistern: "Cistern", gym: "Gym", marina: "Marina / Dock", furnished: "Furnished" }
};

const TYPE_TO_SCHEMA = {
  house: "SingleFamilyResidence",
  condo: "Apartment",
  apartment: "Apartment",
  land: "LandForm",
  commercial: "Place",
  multi_family: "ApartmentComplex"
};

function log(msg) { console.log("[build] " + msg); }

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyRecursive(src, dest, isRoot) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (isRoot && COPY_EXCLUDE.has(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry), false);
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function readYaml(relPath) {
  const full = path.join(CONTENT_DIR, relPath);
  if (!fs.existsSync(full)) return null;
  return yaml.load(fs.readFileSync(full, "utf8"));
}

function readMarkdownCollection(folderName, lang) {
  const dir = path.join(CONTENT_DIR, folderName);
  if (!fs.existsSync(dir)) return [];
  const suffix = "." + lang + ".md";
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(suffix))
    .map((f) => {
      const slug = f.slice(0, -suffix.length);
      const full = path.join(dir, f);
      const { data, content } = matter(fs.readFileSync(full, "utf8"));
      const body = (data.description !== undefined ? data.description : content || "").toString();
      return Object.assign({ slug, lang }, data, {
        mtime: fs.statSync(full).mtime.toISOString(),
        _body: body
      });
    });
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) return [];
  return gallery.map((g) => (typeof g === "string" ? g : g && g.image)).filter(Boolean);
}

function buildProperties(lang) {
  return readMarkdownCollection("properties", lang).map((raw) => {
    const gallery = normalizeGallery(raw.gallery);
    const mainImage = raw.mainImage || gallery[0] || "";
    const descriptionHtml = raw._body ? marked.parse(raw._body) : "";
    const relUrl = "properties/" + raw.slug + "/" + (lang === "en" ? "en/" : "");
    return {
      slug: raw.slug,
      lang: lang,
      title: raw.title || "",
      published: !!raw.published,
      featured: !!raw.featured,
      status: raw.status || "for_sale",
      propertyType: raw.propertyType || "house",
      price: raw.price != null ? raw.price : null,
      currency: "USD",
      address: raw.address || "",
      city: raw.city || "",
      municipality: raw.municipality || "",
      zip: raw.zip || "",
      country: raw.country || "",
      bedrooms: raw.bedrooms != null ? raw.bedrooms : null,
      bathrooms: raw.bathrooms != null ? raw.bathrooms : null,
      interiorArea: raw.interiorArea != null ? raw.interiorArea : null,
      lotArea: raw.lotArea != null ? raw.lotArea : null,
      yearBuilt: raw.yearBuilt != null ? raw.yearBuilt : null,
      parking: raw.parking != null ? raw.parking : null,
      hoa: raw.hoa != null ? raw.hoa : null,
      mlsId: raw.mlsId || "",
      propertyId: raw.propertyId || "",
      features: Array.isArray(raw.features) ? raw.features : [],
      mainImage: mainImage,
      gallery: gallery,
      description: raw._body || "",
      descriptionHtml: descriptionHtml,
      date: raw.mtime,
      url: relUrl
    };
  });
}

function buildTestimonials(lang) {
  return readMarkdownCollection("testimonials", lang).map((raw) => ({
    slug: raw.slug,
    lang: lang,
    name: raw.name || "",
    text: raw.text || "",
    date: raw.date || "",
    photo: raw.photo || "",
    published: !!raw.published
  }));
}

function buildSiteConfig(general) {
  const es = (general && general.es) || {};
  const en = (general && general.en) || {};
  return {
    siteUrl: (es.siteUrl || "").replace(/\/+$/, ""),
    agentName: es.agentName || "Joe Fontanez",
    agentTitle: es.agentTitle || "Real Estate Broker",
    license: es.license || "Lic. 12114",
    email: es.email || "Joefontanez0707@gmail.com",
    whatsappNumber: es.whatsappNumber || "",
    formspreeEndpoint: es.formspreeEndpoint || "",
    agentPhoto: es.agentPhoto || "",
    heroImage: es.heroImage || "",
    agentBio: {
      es: es.agentBio ? marked.parse(es.agentBio) : "",
      en: en.agentBio ? marked.parse(en.agentBio) : ""
    }
  };
}

function safeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeXml(str) {
  return String(str || "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function absoluteUrl(siteUrl, relPath) {
  if (!siteUrl) return relPath;
  if (/^https?:\/\//.test(relPath)) return relPath;
  return siteUrl.replace(/\/+$/, "") + "/" + String(relPath).replace(/^\/+/, "");
}

function propertyPageHtml(p, siteConfig, otherLangHref) {
  const lang = p.lang;
  const t = lang === "en"
    ? {
        beds: "Beds", baths: "Baths", area: "Interior area", year: "Year built",
        desc: "Description", features: "Features", additional: "Additional information",
        back: "Back to properties", sidebarTitle: "Interested in this property?",
        sidebarText: "Reach out to Joe for more information or to schedule a visit.",
        requestInfo: "Request information", contact: "Contact Joe", whatsapp: "WhatsApp",
        address: "Address", municipality: "Municipality", zip: "Zip code", country: "Country", hoa: "HOA / Maintenance",
        mls: "MLS ID", propertyId: "Property ID"
      }
    : {
        beds: "Habs.", baths: "Baños", area: "Área", year: "Año",
        desc: "Descripción", features: "Características", additional: "Información adicional",
        back: "Volver a propiedades", sidebarTitle: "¿Interesado en esta propiedad?",
        sidebarText: "Escríbele a Joe para más información o para agendar una visita.",
        requestInfo: "Solicitar información", contact: "Contactar a Joe", whatsapp: "WhatsApp",
        address: "Dirección", municipality: "Municipio", zip: "Código postal", country: "País", hoa: "HOA / Mantenimiento",
        mls: "MLS ID", propertyId: "Property ID"
      };

  const statusLabels = lang === "en"
    ? { for_sale: "For sale", pending: "Pending", sold: "Sold", for_rent: "For rent", rented: "Rented" }
    : { for_sale: "En venta", pending: "Pendiente", sold: "Vendida", for_rent: "En alquiler", rented: "Alquilada" };
  const typeLabels = lang === "en"
    ? { house: "House", condo: "Condo", apartment: "Apartment", land: "Land", commercial: "Commercial", multi_family: "Multi-family" }
    : { house: "Casa", condo: "Condominio", apartment: "Apartamento", land: "Terreno", commercial: "Comercial", multi_family: "Multifamiliar" };

  const root = lang === "en" ? "../../../" : "../../";
  const canonical = absoluteUrl(siteConfig.siteUrl, p.url);
  const ogImage = p.mainImage ? absoluteUrl(siteConfig.siteUrl, p.mainImage) : "";
  const metaDescription = (p.description || p.title).replace(/\s+/g, " ").slice(0, 160);
  const priceLabel = p.price != null ? "$" + Number(p.price).toLocaleString("en-US") : "";

  const images = (p.gallery.length ? p.gallery : [p.mainImage]).filter(Boolean);
  const galleryHtml = images.slice(0, 5).map((src, i) => {
    const extra = i === 4 && images.length > 5 ? ` class="gallery-more" data-count="+${images.length - 5}"` : "";
    const href = root + src;
    return `<a href="${href}" data-index="${i}"${extra}><img src="${href}" alt="${escapeXml(p.title)} ${i + 1}" loading="lazy"></a>`;
  }).join("");

  const featureLabels = FEATURE_LABELS[lang] || FEATURE_LABELS.es;
  const featuresHtml = p.features.map((f) => `<li>${escapeXml(featureLabels[f] || f)}</li>`).join("");
  const infoRows = [
    [t.address, escapeXml(p.address)],
    [t.municipality, escapeXml(p.municipality)],
    [t.zip, escapeXml(p.zip)],
    [t.country, escapeXml(p.country)],
    [t.hoa, p.hoa ? "$" + Number(p.hoa).toLocaleString() : ""],
    [t.mls, escapeXml(p.mlsId)],
    [t.propertyId, escapeXml(p.propertyId)]
  ].filter(([, v]) => v).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");

  const schemaType = TYPE_TO_SCHEMA[p.propertyType] || "Residence";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: metaDescription,
    url: canonical,
    image: images.map((i) => absoluteUrl(siteConfig.siteUrl, i)),
    datePosted: p.date,
    about: {
      "@type": schemaType,
      name: p.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: p.address || undefined,
        addressLocality: p.city || undefined,
        addressRegion: p.municipality || undefined,
        postalCode: p.zip || undefined,
        addressCountry: "PR"
      },
      numberOfRooms: p.bedrooms || undefined,
      floorSize: p.interiorArea ? { "@type": "QuantitativeValue", value: p.interiorArea, unitCode: "FTK" } : undefined
    },
    offers: p.price != null ? { "@type": "Offer", price: p.price, priceCurrency: "USD" } : undefined
  };

  const navLinks = [
    ["index.html", lang === "en" ? "Home" : "Inicio"],
    ["properties.html", lang === "en" ? "Properties" : "Propiedades"],
    ["about.html", lang === "en" ? "About Joe" : "Sobre Joe"],
    ["services.html", lang === "en" ? "Services" : "Servicios"],
    ["contact.html", lang === "en" ? "Contact" : "Contacto"]
  ];
  const navHtml = navLinks.map(([href, label]) => `<a href="${root}${href}">${label}</a>`).join("\n        ");
  const mobileNavHtml = navLinks.map(([href, label]) => `<a href="${root}${href}">${label}</a>`).join("\n      ");

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeXml(p.title)} | Joe Fontanez Real Estate</title>
  <meta name="description" content="${escapeXml(metaDescription)}">
  <link rel="canonical" href="${canonical}">
  ${otherLangHref ? `<link rel="alternate" hreflang="${lang === "en" ? "es" : "en"}" href="${otherLangHref}">` : ""}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeXml(p.title)}">
  <meta property="og:description" content="${escapeXml(metaDescription)}">
  <meta property="og:url" content="${canonical}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeXml(p.title)}">
  <meta name="twitter:description" content="${escapeXml(metaDescription)}">
  <link rel="icon" href="${root}assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${root}css/style.css">
  <link rel="stylesheet" href="${root}css/components.css">
  <link rel="stylesheet" href="${root}css/responsive.css">
  <script type="application/ld+json">${safeJsonForScript(jsonLd)}</script>
</head>
<body data-root="${root}">

  <header class="site-header is-solid">
    <div class="container">
      <a href="${root}index.html" class="brand">
        <span class="brand-name">Joe Fontanez</span>
        <span class="brand-tagline">Real Estate Broker</span>
      </a>
      <nav class="main-nav">
        ${navHtml}
      </nav>
      <div class="header-actions">
        <div class="lang-switch">
          <button type="button" data-lang="es">ES</button><span>|</span><button type="button" data-lang="en">EN</button>
        </div>
        <a href="${root}contact.html" class="btn btn-primary btn-sm">${t.contact}</a>
        <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
    <nav class="mobile-nav">
      ${mobileNavHtml}
      <div class="lang-switch">
        <button type="button" data-lang="es">ES</button><span>|</span><button type="button" data-lang="en">EN</button>
      </div>
      <a href="${root}contact.html" class="btn btn-primary btn-block">${t.contact}</a>
    </nav>
  </header>

  <section class="property-detail-header">
    <div class="container">
      <div class="breadcrumbs" style="color:var(--color-gray-500)">
        <a href="${root}properties.html">${t.back}</a>
      </div>
      <div class="property-title-row">
        <div>
          <div class="badges">
            <span class="badge badge-status-${p.status}">${statusLabels[p.status] || p.status}</span>
          </div>
          <h1>${escapeXml(p.title)}</h1>
          <p style="color:var(--color-gray-500)">${escapeXml([p.address, p.city, p.country].filter(Boolean).join(", "))}</p>
        </div>
        <div class="property-price-block">
          <div class="price">${priceLabel || "[AGREGAR INFORMACIÓN]"}</div>
          <div class="price-note">${typeLabels[p.propertyType] || p.propertyType}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="section--tight">
    <div class="container">
      <div class="gallery">${galleryHtml}</div>

      <div class="property-body-grid">
        <div>
          <div class="spec-grid">
            <div class="spec-item"><strong>${p.bedrooms != null ? p.bedrooms : "—"}</strong><span>${t.beds}</span></div>
            <div class="spec-item"><strong>${p.bathrooms != null ? p.bathrooms : "—"}</strong><span>${t.baths}</span></div>
            <div class="spec-item"><strong>${p.interiorArea ? Number(p.interiorArea).toLocaleString() + " Sq.Ft." : "—"}</strong><span>${t.area}</span></div>
            <div class="spec-item"><strong>${p.yearBuilt || "—"}</strong><span>${t.year}</span></div>
          </div>

          <h2>${t.desc}</h2>
          <div>${p.descriptionHtml || ""}</div>

          ${p.features.length ? `<h2>${t.features}</h2><ul class="feature-list">${featuresHtml}</ul>` : ""}

          ${infoRows ? `<h2>${t.additional}</h2><table class="info-table">${infoRows}</table>` : ""}
        </div>

        <aside>
          <div class="sidebar-card">
            <h3>${t.sidebarTitle}</h3>
            <p>${t.sidebarText}</p>
            <div class="sidebar-actions">
              <a href="#" class="btn btn-primary" data-field="email-link">${t.requestInfo}</a>
              <a href="${root}contact.html" class="btn btn-outline">${t.contact}</a>
              <a href="#" class="btn btn-whatsapp is-hidden" data-field="whatsapp-link" target="_blank" rel="noopener">${t.whatsapp}</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-bottom">
        <span>© <span data-current-year>2026</span> Joe Fontanez.</span>
      </div>
    </div>
  </footer>

  <a class="home-float" href="${root}index.html" aria-label="Home">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>
  </a>

  <a class="whatsapp-float is-hidden" data-config-href="whatsapp" href="#" target="_blank" rel="noopener" aria-label="WhatsApp">
    <svg viewBox="0 0 32 32"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9c1.8 1 3.9 1.5 6.3 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-2 0-3.9-.5-5.5-1.5l-.4-.2-4.6 1.2 1.2-4.5-.3-.4C5.2 17.7 4.6 16 4.6 15c0-5.7 4.7-10.4 10.4-10.4S26.4 9.3 26.4 15 21.7 24.8 16 24.8zm5.7-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1c-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2s0-.4.1-.6c.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.9-.8 2.1-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4z"/></svg>
  </a>

  <script id="property-data" type="application/json">${safeJsonForScript(p)}</script>
  <script src="${root}js/language.js"></script>
  <script src="${root}js/app.js"></script>
  <script src="${root}js/properties.js"></script>
  <script src="${root}js/property-detail.js"></script>
</body>
</html>
`;
}

async function optimizeImages(siteConfig) {
  let sharp;
  try {
    sharp = require("sharp");
  } catch (e) {
    log("sharp no está disponible, se omite la optimización de imágenes (no es un error fatal).");
    return;
  }
  const dir = path.join(OUT_DIR, "assets", "properties");
  if (!fs.existsSync(dir)) return;

  const files = [];
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jpe?g|png)$/i.test(entry.name)) files.push(full);
    }
  })(dir);

  for (const file of files) {
    const webpPath = file.replace(/\.(jpe?g|png)$/i, ".webp");
    if (fs.existsSync(webpPath)) continue;
    try {
      await sharp(file).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(webpPath);
    } catch (e) {
      log("No se pudo optimizar " + path.relative(OUT_DIR, file) + ": " + e.message);
    }
  }
}

function replaceDomainPlaceholder(siteUrl) {
  if (!siteUrl) return;
  const htmlFiles = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".html"));
  for (const f of htmlFiles) {
    const full = path.join(OUT_DIR, f);
    const content = fs.readFileSync(full, "utf8").split(PLACEHOLDER_DOMAIN).join(siteUrl);
    fs.writeFileSync(full, content);
  }
}

function writeJson(relPath, data) {
  const full = path.join(OUT_DIR, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

function generateSitemap(siteConfig, propertiesEs, propertiesEn) {
  const staticPages = ["", "properties.html", "about.html", "services.html", "contact.html", "privacy.html", "terms.html"];
  const urls = staticPages.map((p) => absoluteUrl(siteConfig.siteUrl, p));
  propertiesEs.filter((p) => p.published).forEach((p) => urls.push(absoluteUrl(siteConfig.siteUrl, p.url)));
  propertiesEn.filter((p) => p.published).forEach((p) => urls.push(absoluteUrl(siteConfig.siteUrl, p.url)));

  const body = urls.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), xml);
}

function generateRobots(siteConfig) {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    ""
  ];
  if (siteConfig.siteUrl) lines.splice(3, 0, `Sitemap: ${siteConfig.siteUrl}/sitemap.xml`, "");
  fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), lines.join("\n"));
}

async function main() {
  log("Limpiando " + OUT_DIR);
  rmrf(OUT_DIR);

  log("Copiando archivos públicos del sitio...");
  copyRecursive(ROOT, OUT_DIR, true);

  const general = readYaml("settings/general.yml");
  const areas = readYaml("settings/areas.yml") || { items: [] };
  const siteConfig = buildSiteConfig(general);

  log("Generando datos de propiedades...");
  const propertiesEs = buildProperties("es");
  const propertiesEn = buildProperties("en");

  log("Generando datos de testimonios...");
  const testimonialsEs = buildTestimonials("es");
  const testimonialsEn = buildTestimonials("en");

  writeJson("config/site.json", siteConfig);
  writeJson("config/areas.json", areas);
  writeJson("config/properties.es.json", propertiesEs);
  writeJson("config/properties.en.json", propertiesEn);
  writeJson("config/testimonials.es.json", testimonialsEs);
  writeJson("config/testimonials.en.json", testimonialsEn);

  log("Generando páginas estáticas de propiedades...");
  let generated = 0;
  for (const list of [propertiesEs, propertiesEn]) {
    for (const p of list) {
      if (!p.published) continue;
      const outPath = path.join(OUT_DIR, p.url, "index.html");
      const other = list === propertiesEs ? propertiesEn : propertiesEs;
      const otherMatch = other.find((x) => x.slug === p.slug);
      const otherHref = otherMatch ? absoluteUrl(siteConfig.siteUrl, otherMatch.url) : "";
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, propertyPageHtml(p, siteConfig, otherHref));
      generated++;
    }
  }
  log(generated + " páginas de propiedades generadas.");

  replaceDomainPlaceholder(siteConfig.siteUrl);
  generateSitemap(siteConfig, propertiesEs, propertiesEn);
  generateRobots(siteConfig);

  log("Optimizando imágenes (mejor esfuerzo)...");
  await optimizeImages(siteConfig);

  log("Build completo → " + OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
