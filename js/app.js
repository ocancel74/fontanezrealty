/**
 * app.js — shared site behavior: header scroll state, mobile nav,
 * config-driven contact links (WhatsApp/email), footer year.
 * Config comes from config/site.json, generated at build time from
 * content/settings/general.yml so Joe can edit it in the CMS without
 * touching code.
 */
(function () {
  "use strict";

  function rootPath() {
    var depth = document.body.getAttribute("data-root") || "";
    return depth; // e.g. "" for root pages, "../" for generated property pages
  }

  function whatsappLink(number, message) {
    var digits = (number || "").replace(/[^0-9]/g, "");
    var text = encodeURIComponent(message || "");
    return digits ? "https://wa.me/" + digits + (text ? "?text=" + text : "") : "#";
  }

  function formatPhone(number) {
    var digits = (number || "").replace(/[^0-9]/g, "");
    // Expect country code 1 + 10-digit US/PR number; fall back to raw digits.
    if (digits.length === 11 && digits.charAt(0) === "1") {
      var d = digits.slice(1);
      return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    }
    return number || "";
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.style.overflow = isOpen ? "hidden" : "";
      });
      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileNav.classList.remove("is-open");
          document.body.style.overflow = "";
        });
      });
    }

    var current = header.querySelectorAll('a[href="' + location.pathname + '"]');
    current.forEach(function (a) { a.classList.add("is-active"); });
  }

  function initYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function applyConfig(config) {
    var lang = (window.JFLang && window.JFLang.getLang()) || "es";
    var defaultMsg = (window.JFLang && window.JFLang.t("whatsapp.defaultmessage", lang)) ||
      "Hola Joe, estoy interesado en una propiedad y quisiera obtener más información.";

    document.querySelectorAll('[data-config-href="whatsapp"]').forEach(function (el) {
      el.href = whatsappLink(config.whatsappNumber, defaultMsg);
      el.classList.toggle("is-hidden", !config.whatsappNumber);
    });
    document.querySelectorAll('[data-config-href="email"]').forEach(function (el) {
      el.href = "mailto:" + (config.email || "");
    });
    document.querySelectorAll('[data-config="email"]').forEach(function (el) {
      el.textContent = config.email || "[AGREGAR INFORMACIÓN]";
    });
    document.querySelectorAll('[data-config-href="phone"]').forEach(function (el) {
      var digits = (config.phone || "").replace(/[^0-9]/g, "");
      el.href = digits ? "tel:+" + digits : "#";
      el.classList.toggle("is-hidden", !config.phone);
    });
    document.querySelectorAll('[data-config="phone"]').forEach(function (el) {
      el.textContent = formatPhone(config.phone) || "[AGREGAR INFORMACIÓN]";
    });
    document.querySelectorAll('[data-config="agentName"]').forEach(function (el) {
      el.textContent = config.agentName || "Joe Fontanez";
    });
    document.querySelectorAll('[data-config="license"]').forEach(function (el) {
      el.textContent = config.license || "Lic. 12114";
    });
    document.querySelectorAll('[data-config="agentTitle"]').forEach(function (el) {
      el.textContent = config.agentTitle || "Real Estate Broker";
    });
    document.querySelectorAll('[data-config="agentPhoto"]').forEach(function (el) {
      if (config.agentPhoto) {
        el.innerHTML = '<img src="' + config.agentPhoto + '" alt="' + (config.agentName || "Joe Fontanez") + '">';
      }
    });
    document.querySelectorAll('[data-config-bg="heroImage"]').forEach(function (el) {
      if (config.heroImage) {
        el.style.backgroundImage =
          "linear-gradient(180deg, rgba(15,15,15,0.5), rgba(15,15,15,0.78)), url('" + config.heroImage + "')";
      }
    });

    window.JFConfig = config;
    document.dispatchEvent(new CustomEvent("configready", { detail: config }));
  }

  function loadConfig() {
    var url = rootPath() + "config/site.json";
    fetch(url)
      .then(function (res) { if (!res.ok) throw new Error("config not found"); return res.json(); })
      .then(applyConfig)
      .catch(function () {
        applyConfig({
          whatsappNumber: "",
          email: "Joefontanez0707@gmail.com",
          agentName: "Joe Fontanez",
          agentTitle: "Real Estate Broker",
          license: "Lic. 12114"
        });
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initYear();
    loadConfig();
  });

  window.JFApp = { whatsappLink: whatsappLink, rootPath: rootPath };
})();
