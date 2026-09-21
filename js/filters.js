/**
 * filters.js — client-side filtering for properties.html. Reads the
 * generated properties.<lang>.json (via properties.js) and filters/sorts
 * entirely in the browser, no server round-trip required.
 */
(function () {
  "use strict";

  var form = document.querySelector("[data-filters-form]");
  var grid = document.querySelector("[data-results-grid]");
  var countEl = document.querySelector("[data-results-count]");
  var sortSelect = document.querySelector("[data-sort-select]");
  var clearBtn = document.querySelector("[data-filters-clear]");

  if (!form || !grid) return;

  var allProperties = [];

  function t(key, lang) {
    return (window.JFLang && window.JFLang.t(key, lang)) || key;
  }

  function populateLocationOptions(lang) {
    var select = form.querySelector('[name="location"]');
    if (!select) return;
    var current = select.value;
    var cities = Array.from(new Set(allProperties.map(function (p) { return p.city; }).filter(Boolean))).sort();
    select.innerHTML = '<option value="">' + t("properties.filters.location.any", lang) + "</option>" +
      cities.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("");
    if (cities.indexOf(current) !== -1) select.value = current;
  }

  function getFilters() {
    var data = new FormData(form);
    return {
      location: data.get("location") || "",
      minPrice: parseFloat(data.get("minPrice")) || null,
      maxPrice: parseFloat(data.get("maxPrice")) || null,
      type: data.get("type") || "",
      bedrooms: data.get("bedrooms") || "",
      bathrooms: data.get("bathrooms") || "",
      status: data.get("status") || ""
    };
  }

  function applyFilters(list, f) {
    return list.filter(function (p) {
      if (!p.published) return false;
      if (f.location && p.city !== f.location) return false;
      if (f.type && p.propertyType !== f.type) return false;
      if (f.status && p.status !== f.status) return false;
      if (f.minPrice != null && Number(p.price) < f.minPrice) return false;
      if (f.maxPrice != null && Number(p.price) > f.maxPrice) return false;
      if (f.bedrooms && Number(p.bedrooms) < Number(f.bedrooms)) return false;
      if (f.bathrooms && Number(p.bathrooms) < Number(f.bathrooms)) return false;
      return true;
    });
  }

  function applySort(list, sortValue) {
    var sorted = list.slice();
    if (sortValue === "price_asc") sorted.sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
    else if (sortValue === "price_desc") sorted.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
    else sorted.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    return sorted;
  }

  function render() {
    var lang = window.JFLang.getLang();
    var f = getFilters();
    var filtered = applyFilters(allProperties, f);
    filtered = applySort(filtered, sortSelect ? sortSelect.value : "newest");

    window.JFProperties.renderInto(grid, filtered, lang, "properties.empty");
    if (countEl) {
      countEl.textContent = filtered.length + " " + t("properties.results.count", lang);
    }

    var params = new URLSearchParams();
    Object.keys(f).forEach(function (k) { if (f[k]) params.set(k, f[k]); });
    var newUrl = location.pathname + (params.toString() ? "?" + params.toString() : "");
    history.replaceState(null, "", newUrl);
  }

  function applyFromQueryString() {
    var params = new URLSearchParams(location.search);
    ["location", "minPrice", "maxPrice", "type", "bedrooms", "bathrooms", "status"].forEach(function (key) {
      var field = form.querySelector('[name="' + key + '"]');
      if (field && params.has(key)) field.value = params.get(key);
    });
  }

  function loadAndRender() {
    var lang = window.JFLang.getLang();
    window.JFProperties.load(lang).then(function (list) {
      allProperties = list;
      populateLocationOptions(lang);
      applyFromQueryString();
      render();
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    render();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      form.reset();
      render();
    });
  }

  if (sortSelect) sortSelect.addEventListener("change", render);

  document.addEventListener("languagechange", loadAndRender);
  document.addEventListener("DOMContentLoaded", loadAndRender);
})();
