/**
 * properties.js — loads generated property data (config/properties.<lang>.json,
 * produced at build time by scripts/build.js from content/properties/*.md)
 * and renders property cards. Used by index.html (featured grid) and
 * properties.html (full listing, in combination with filters.js).
 */
(function () {
  "use strict";

  function rootPath() {
    return (window.JFApp && window.JFApp.rootPath()) || "";
  }

  function fmtPrice(price, currency, status) {
    if (price == null || price === "") return "[AGREGAR INFORMACIÓN]";
    var n = Number(price);
    var formatted = "$" + n.toLocaleString("en-US");
    if (status === "for_rent" || status === "rented") formatted += "/mo";
    return formatted;
  }

  function t(key, lang) {
    return (window.JFLang && window.JFLang.t(key, lang)) || key;
  }

  function propertyUrl(p) {
    return p.url || (rootPath() + "properties/" + p.slug + "/" + (p.lang === "en" ? "en/" : ""));
  }

  function cardHtml(p, lang) {
    var img = p.mainImage || "";
    var badges = '<span class="badge badge-status-' + p.status + '">' + t("status." + p.status, lang) + "</span>";
    var featured = p.featured ? '<span class="property-card-featured">' + (lang === "en" ? "Featured" : "Destacada") + "</span>" : "";
    return (
      '<article class="property-card">' +
      '<a href="' + propertyUrl(p) + '" class="property-card-media">' +
      (img ? '<img src="' + img + '" alt="' + escapeHtml(p.title) + '" loading="lazy">' : '<div class="skeleton" style="width:100%;height:100%"></div>') +
      '<span class="property-card-badges">' + badges + "</span>" +
      featured +
      "</a>" +
      '<div class="property-card-body">' +
      '<div class="property-card-price">' + fmtPrice(p.price, p.currency, p.status) +
      (p.propertyType ? ' <small>· ' + t("type." + p.propertyType, lang) + "</small>" : "") + "</div>" +
      '<h3 class="property-card-title"><a href="' + propertyUrl(p) + '">' + escapeHtml(p.title) + "</a></h3>" +
      '<div class="property-card-location">' + escapeHtml([p.city, p.municipality].filter(Boolean).join(", ")) + "</div>" +
      '<div class="property-card-meta">' +
      (p.bedrooms != null ? "<span>" + p.bedrooms + " " + t("detail.beds", lang) + "</span>" : "") +
      (p.bathrooms != null ? "<span>" + p.bathrooms + " " + t("detail.baths", lang) + "</span>" : "") +
      (p.interiorArea ? "<span>" + Number(p.interiorArea).toLocaleString() + " ft²</span>" : "") +
      "</div>" +
      '<a href="' + propertyUrl(p) + '" class="btn btn-outline btn-sm btn-block">' + t("properties.card.viewdetails", lang) + "</a>" +
      "</div>" +
      "</article>"
    );
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function loadProperties(lang) {
    var url = rootPath() + "config/properties." + lang + ".json";
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("properties not found");
      return res.json();
    }).catch(function () { return []; });
  }

  function renderInto(container, list, lang, emptyKey) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = '<p class="state-message">' + t(emptyKey || "properties.empty", lang) + "</p>";
      return;
    }
    container.innerHTML = list.map(function (p) { return cardHtml(p, lang); }).join("");
  }

  function initFeatured() {
    var grid = document.querySelector("[data-featured-grid]");
    if (!grid) return;
    function render() {
      var lang = window.JFLang.getLang();
      loadProperties(lang).then(function (list) {
        var featured = list.filter(function (p) { return p.published && p.featured; }).slice(0, 6);
        renderInto(grid, featured, lang, "home.featured.empty");
      });
    }
    render();
    document.addEventListener("languagechange", render);
  }

  document.addEventListener("DOMContentLoaded", initFeatured);

  window.JFProperties = {
    load: loadProperties,
    cardHtml: cardHtml,
    renderInto: renderInto,
    fmtPrice: fmtPrice,
    propertyUrl: propertyUrl,
    escapeHtml: escapeHtml
  };
})();
