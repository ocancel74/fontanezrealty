/**
 * property-detail.js — renders a single property's detail view.
 *
 * Two modes:
 *  1. Generated static pages (properties/<slug>/index.html) embed the
 *     property's data as JSON in <script id="property-data">; this script
 *     just hydrates the DOM from it. SEO meta/OG/JSON-LD are already baked
 *     into the HTML by scripts/build.js at build time.
 *  2. The root property.html is a local-dev fallback: it reads ?slug= from
 *     the URL and fetches config/properties.<lang>.json client-side, useful
 *     for previewing content before running the build script.
 */
(function () {
  "use strict";

  function rootPath() {
    return (window.JFApp && window.JFApp.rootPath()) || "";
  }

  function t(key, lang) {
    return (window.JFLang && window.JFLang.t(key, lang)) || key;
  }

  function escapeHtml(str) {
    return (window.JFProperties && window.JFProperties.escapeHtml(str)) || String(str || "");
  }

  function getEmbeddedData() {
    var el = document.getElementById("property-data");
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  function getSlugFromQuery() {
    return new URLSearchParams(location.search).get("slug");
  }

  function galleryHtml(p) {
    var images = (p.gallery && p.gallery.length ? p.gallery : [p.mainImage]).filter(Boolean);
    if (!images.length) return "";
    var visible = images.slice(0, 5);
    return visible.map(function (src, i) {
      var extra = i === 4 && images.length > 5 ? ' class="gallery-more" data-count="+' + (images.length - 5) + '"' : "";
      return '<a href="' + src + '" data-index="' + i + '"' + extra + '><img src="' + src + '" alt="' + escapeHtml(p.title) + " " + (i + 1) + '" loading="lazy"></a>';
    }).join("");
  }

  function featuresHtml(p, lang) {
    if (!p.features || !p.features.length) return "";
    return p.features.map(function (f) {
      return "<li>" + (t("feature." + f, lang) !== "feature." + f ? t("feature." + f, lang) : f) + "</li>";
    }).join("");
  }

  function infoRow(label, value) {
    if (!value) return "";
    return "<tr><td>" + label + "</td><td>" + value + "</td></tr>";
  }

  function render(p, lang) {
    document.querySelectorAll("[data-field='title']").forEach(function (el) { el.textContent = p.title; });
    document.querySelectorAll("[data-field='price']").forEach(function (el) {
      el.textContent = window.JFProperties.fmtPrice(p.price, p.currency, p.status);
    });
    document.querySelectorAll("[data-field='location']").forEach(function (el) {
      el.textContent = [p.address, p.city, p.municipality].filter(Boolean).join(", ");
    });
    document.querySelectorAll("[data-field='status-badge']").forEach(function (el) {
      el.textContent = t("status." + p.status, lang);
      el.className = "badge badge-status-" + p.status;
    });
    document.querySelectorAll("[data-field='type-badge']").forEach(function (el) {
      el.textContent = t("type." + p.propertyType, lang);
    });
    document.querySelectorAll("[data-field='gallery']").forEach(function (el) { el.innerHTML = galleryHtml(p); });
    document.querySelectorAll("[data-field='description']").forEach(function (el) {
      el.innerHTML = p.descriptionHtml || "<p>" + escapeHtml(p.description || "") + "</p>";
    });
    document.querySelectorAll("[data-field='features']").forEach(function (el) {
      var html = featuresHtml(p, lang);
      el.innerHTML = html;
      var wrap = el.closest("[data-block='features']");
      if (wrap) wrap.style.display = html ? "" : "none";
    });

    document.querySelectorAll("[data-field='beds']").forEach(function (el) { el.textContent = p.bedrooms != null ? p.bedrooms : "—"; });
    document.querySelectorAll("[data-field='baths']").forEach(function (el) { el.textContent = p.bathrooms != null ? p.bathrooms : "—"; });
    document.querySelectorAll("[data-field='area']").forEach(function (el) { el.textContent = p.interiorArea ? Number(p.interiorArea).toLocaleString() + " Sq.Ft." : "—"; });
    document.querySelectorAll("[data-field='lot']").forEach(function (el) { el.textContent = p.lotArea ? Number(p.lotArea).toLocaleString() + " Sq.Ft." : "—"; });
    document.querySelectorAll("[data-field='year']").forEach(function (el) { el.textContent = p.yearBuilt || "—"; });
    document.querySelectorAll("[data-field='parking']").forEach(function (el) { el.textContent = p.parking != null ? p.parking : "—"; });

    document.querySelectorAll("[data-field='info-table']").forEach(function (el) {
      el.innerHTML =
        infoRow(t("detail.address", lang), escapeHtml(p.address)) +
        infoRow(t("detail.municipality", lang), escapeHtml(p.municipality)) +
        infoRow(t("detail.zip", lang), escapeHtml(p.zip)) +
        infoRow(t("detail.country", lang), escapeHtml(p.country)) +
        infoRow(t("detail.hoa", lang), p.hoa ? "$" + Number(p.hoa).toLocaleString() : "") +
        infoRow(t("detail.mls", lang), escapeHtml(p.mlsId)) +
        infoRow(t("detail.propertyid", lang), escapeHtml(p.propertyId));
    });

    var pageUrl = location.href.split("?")[0];
    var whatsappMsg = (lang === "en"
      ? "Hi Joe, I'm interested in this property: "
      : "Hola Joe, estoy interesado en esta propiedad: ") + p.title +
      (p.propertyId ? " (ID: " + p.propertyId + ")" : "") + " — " + pageUrl;

    document.querySelectorAll("[data-field='whatsapp-link']").forEach(function (el) {
      el.href = window.JFApp.whatsappLink((window.JFConfig || {}).whatsappNumber, whatsappMsg);
      el.classList.toggle("is-hidden", !(window.JFConfig || {}).whatsappNumber);
    });
    document.querySelectorAll("[data-field='email-link']").forEach(function (el) {
      var subject = encodeURIComponent((lang === "en" ? "Inquiry about " : "Consulta sobre ") + p.title);
      var body = encodeURIComponent(whatsappMsg);
      el.href = "mailto:" + ((window.JFConfig || {}).email || "") + "?subject=" + subject + "&body=" + body;
    });

    document.title = p.title + " | Joe Fontanez Real Estate";
    initLightbox(p);
  }

  function initLightbox(p) {
    var raw = (p.gallery && p.gallery.length ? p.gallery : [p.mainImage]).filter(Boolean);
    if (!raw.length) return;
    var images = raw.map(function (src) {
      return /^https?:\/\//.test(src) ? src : rootPath() + src;
    });

    var overlay = document.querySelector(".lightbox-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="Close"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<button type="button" class="lightbox-prev" aria-label="Previous"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<img alt="">' +
        '<button type="button" class="lightbox-next" aria-label="Next"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '<span class="lightbox-counter"></span>';
      document.body.appendChild(overlay);
    }

    var imgEl = overlay.querySelector("img");
    var counterEl = overlay.querySelector(".lightbox-counter");
    var current = 0;

    function show(index) {
      current = (index + images.length) % images.length;
      imgEl.src = images[current];
      imgEl.alt = p.title + " " + (current + 1);
      counterEl.textContent = (current + 1) + " / " + images.length;
    }

    function open(index) {
      show(index);
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    overlay.querySelector(".lightbox-close").onclick = close;
    overlay.querySelector(".lightbox-prev").onclick = function () { show(current - 1); };
    overlay.querySelector(".lightbox-next").onclick = function () { show(current + 1); };
    overlay.onclick = function (e) { if (e.target === overlay) close(); };

    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });

    document.querySelectorAll(".gallery a[data-index]").forEach(function (link) {
      if (link.dataset.lightboxBound) return;
      link.dataset.lightboxBound = "1";
      link.addEventListener("click", function (e) {
        e.preventDefault();
        open(parseInt(link.getAttribute("data-index"), 10) || 0);
      });
    });
  }

  function showNotFound(lang) {
    var wrap = document.querySelector("[data-property-root]");
    if (wrap) {
      wrap.innerHTML =
        '<div class="state-message"><h2>' + t("detail.notfound.title", lang) + "</h2><p>" +
        t("detail.notfound.text", lang) + '</p><a class="btn btn-outline" href="' + rootPath() + 'properties.html">' +
        t("detail.back", lang) + "</a></div>";
    }
  }

  function init() {
    var embedded = getEmbeddedData();
    var lang = window.JFLang.getLang();

    if (embedded) {
      render(embedded, embedded.lang || lang);
      document.addEventListener("configready", function () { render(embedded, embedded.lang || lang); });
      return;
    }

    var slug = getSlugFromQuery();
    if (!slug) { showNotFound(lang); return; }

    function loadAndRender() {
      var currentLang = window.JFLang.getLang();
      window.JFProperties.load(currentLang).then(function (list) {
        var p = list.find(function (item) { return item.slug === slug; });
        if (!p) { showNotFound(currentLang); return; }
        render(p, currentLang);
        document.addEventListener("configready", function () { render(p, currentLang); }, { once: true });
      });
    }
    loadAndRender();
    document.addEventListener("languagechange", loadAndRender);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
