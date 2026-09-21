/**
 * language.js — ES/EN toggle for interface copy (not editorial content).
 * Editorial content (property titles, descriptions, testimonials) is
 * translated by Joe in the CMS and lives in content/*.<lang>.md instead.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "jf-lang";

  var DICT = {
    es: {
      "nav.home": "Inicio",
      "nav.properties": "Propiedades",
      "nav.about": "Sobre Joe",
      "nav.services": "Servicios",
      "nav.areas": "Áreas",
      "nav.contact": "Contacto",
      "nav.cta": "Contactar a Joe",

      "hero.eyebrow": "Bienes Raíces en Puerto Rico",
      "hero.title": "Encuentra tu próximo hogar en Puerto Rico",
      "hero.subtitle": "Compra, venta e inversión inmobiliaria con acompañamiento personalizado en cada paso del proceso.",
      "hero.cta.properties": "Ver propiedades",
      "hero.cta.contact": "Contactar a Joe",

      "home.featured.eyebrow": "Selección",
      "home.featured.title": "Propiedades destacadas",
      "home.featured.empty": "Pronto agregaremos propiedades destacadas.",
      "home.featured.viewall": "Ver todas las propiedades",

      "home.services.eyebrow": "Cómo puedo ayudarte",
      "home.services.title": "Servicios inmobiliarios",

      "home.areas.eyebrow": "Cobertura",
      "home.areas.title": "Áreas de servicio",

      "home.about.eyebrow": "Tu agente",
      "home.about.title": "Trabajemos juntos en tu próximo paso inmobiliario",
      "home.about.cta": "Conocer más",

      "home.testimonials.eyebrow": "Clientes",
      "home.testimonials.title": "Testimonios",

      "home.cta.title": "¿Listo para encontrar tu próxima propiedad?",
      "home.cta.subtitle": "Escríbele a Joe y da el siguiente paso hoy mismo.",
      "home.cta.button": "Contactar a Joe",

      "properties.hero.title": "Propiedades",
      "properties.hero.subtitle": "Explora el inventario disponible y filtra según lo que buscas.",
      "properties.filters.location": "Ubicación",
      "properties.filters.location.any": "Todas las ubicaciones",
      "properties.filters.minprice": "Precio mínimo",
      "properties.filters.maxprice": "Precio máximo",
      "properties.filters.type": "Tipo",
      "properties.filters.type.any": "Todos los tipos",
      "properties.filters.bedrooms": "Habitaciones",
      "properties.filters.bedrooms.any": "Cualquiera",
      "properties.filters.bathrooms": "Baños",
      "properties.filters.bathrooms.any": "Cualquiera",
      "properties.filters.status": "Status",
      "properties.filters.status.any": "Todos",
      "properties.filters.search": "Buscar",
      "properties.filters.clear": "Limpiar filtros",
      "properties.results.count": "propiedades encontradas",
      "properties.results.sort": "Ordenar por",
      "properties.sort.newest": "Más recientes",
      "properties.sort.price_asc": "Precio: menor a mayor",
      "properties.sort.price_desc": "Precio: mayor a menor",
      "properties.empty": "No se encontraron propiedades con esos filtros.",
      "properties.card.viewdetails": "Ver detalles",

      "type.house": "Casa",
      "type.condo": "Condominio",
      "type.apartment": "Apartamento",
      "type.land": "Terreno",
      "type.commercial": "Comercial",
      "type.multi_family": "Multifamiliar",

      "status.for_sale": "En venta",
      "status.pending": "Pendiente",
      "status.sold": "Vendida",
      "status.for_rent": "En alquiler",
      "status.rented": "Alquilada",

      "feature.view": "Vista",
      "feature.pool": "Piscina",
      "feature.terrace": "Terraza",
      "feature.balcony": "Balcón",
      "feature.security": "Seguridad",
      "feature.generator": "Generador",
      "feature.cistern": "Cisterna",
      "feature.gym": "Gimnasio",
      "feature.marina": "Muelle / Marina",
      "feature.furnished": "Amueblado",

      "detail.beds": "Habs.",
      "detail.baths": "Baños",
      "detail.area": "Área",
      "detail.lot": "Terreno",
      "detail.year": "Año",
      "detail.parking": "Parking",
      "detail.description": "Descripción",
      "detail.features": "Características",
      "detail.additional": "Información adicional",
      "detail.mls": "MLS ID",
      "detail.propertyid": "Property ID",
      "detail.hoa": "HOA / Mantenimiento",
      "detail.municipality": "Municipio",
      "detail.zip": "Código postal",
      "detail.country": "País",
      "detail.address": "Dirección",
      "detail.sidebar.title": "¿Interesado en esta propiedad?",
      "detail.sidebar.subtitle": "Escríbele a Joe para más información o para agendar una visita.",
      "detail.requestinfo": "Solicitar información",
      "detail.contact": "Contactar a Joe",
      "detail.whatsapp": "WhatsApp",
      "detail.back": "Volver a propiedades",
      "detail.notfound.title": "Propiedad no encontrada",
      "detail.notfound.text": "Es posible que esta propiedad ya no esté disponible.",

      "about.eyebrow": "Sobre el agente",
      "about.title": "Joe Fontanez",
      "about.subtitle": "Real Estate Broker · Lic. 12114",

      "services.hero.title": "Servicios",
      "services.hero.subtitle": "Acompañamiento en cada etapa del proceso inmobiliario.",
      "services.buy.title": "Comprar",
      "services.buy.text": "Asistencia durante el proceso de búsqueda y compra.",
      "services.sell.title": "Vender",
      "services.sell.text": "Presentación y promoción profesional de propiedades.",
      "services.invest.title": "Inversión",
      "services.invest.text": "Orientación para compradores interesados en inversión inmobiliaria.",
      "services.advice.title": "Asesoría",
      "services.advice.text": "Atención personalizada.",

      "areas.hero.title": "Áreas de servicio",
      "areas.hero.subtitle": "Estas áreas son ejemplos iniciales y pueden ser modificadas por el agente.",

      "testimonials.empty": "Testimonios próximamente.",

      "contact.hero.title": "¿Listo para encontrar tu próxima propiedad?",
      "contact.hero.subtitle": "Completa el formulario y Joe se comunicará contigo lo antes posible.",
      "contact.form.name": "Nombre",
      "contact.form.email": "Email",
      "contact.form.phone": "Teléfono",
      "contact.form.interest": "Interés",
      "contact.form.interest.buy": "Comprar",
      "contact.form.interest.sell": "Vender",
      "contact.form.interest.rent": "Alquilar",
      "contact.form.interest.invest": "Invertir",
      "contact.form.interest.other": "Otro",
      "contact.form.message": "Mensaje",
      "contact.form.submit": "Enviar mensaje",
      "contact.form.success": "Gracias. Tu mensaje fue enviado; Joe se comunicará contigo pronto.",
      "contact.form.error": "No se pudo enviar el mensaje. Intenta de nuevo o escribe directamente por email.",
      "contact.info.title": "Información de contacto",
      "contact.info.subtitle": "También puedes escribir directamente por email o WhatsApp.",

      "footer.nav": "Navegación",
      "footer.contact": "Contacto",
      "footer.legal": "Legal",
      "footer.privacy": "Política de privacidad",
      "footer.terms": "Términos de uso",
      "footer.rights": "Todos los derechos reservados.",
      "footer.tagline": "Real Estate Broker · Lic. 12114",

      "error.title": "Página no encontrada",
      "error.text": "La página que buscas no existe o fue movida.",
      "error.cta": "Volver al inicio",

      "whatsapp.defaultmessage": "Hola Joe, estoy interesado en una propiedad y quisiera obtener más información."
    },
    en: {
      "nav.home": "Home",
      "nav.properties": "Properties",
      "nav.about": "About Joe",
      "nav.services": "Services",
      "nav.areas": "Areas",
      "nav.contact": "Contact",
      "nav.cta": "Contact Joe",

      "hero.eyebrow": "Real Estate in Puerto Rico",
      "hero.title": "Find your next home in Puerto Rico",
      "hero.subtitle": "Buying, selling, and real estate investment with personalized guidance at every step.",
      "hero.cta.properties": "View properties",
      "hero.cta.contact": "Contact Joe",

      "home.featured.eyebrow": "Selection",
      "home.featured.title": "Featured properties",
      "home.featured.empty": "Featured properties will be added soon.",
      "home.featured.viewall": "View all properties",

      "home.services.eyebrow": "How I can help",
      "home.services.title": "Real estate services",

      "home.areas.eyebrow": "Coverage",
      "home.areas.title": "Service areas",

      "home.about.eyebrow": "Your agent",
      "home.about.title": "Let's work together on your next real estate move",
      "home.about.cta": "Learn more",

      "home.testimonials.eyebrow": "Clients",
      "home.testimonials.title": "Testimonials",

      "home.cta.title": "Ready to find your next property?",
      "home.cta.subtitle": "Reach out to Joe and take the next step today.",
      "home.cta.button": "Contact Joe",

      "properties.hero.title": "Properties",
      "properties.hero.subtitle": "Browse the available inventory and filter by what you're looking for.",
      "properties.filters.location": "Location",
      "properties.filters.location.any": "All locations",
      "properties.filters.minprice": "Min price",
      "properties.filters.maxprice": "Max price",
      "properties.filters.type": "Type",
      "properties.filters.type.any": "All types",
      "properties.filters.bedrooms": "Bedrooms",
      "properties.filters.bedrooms.any": "Any",
      "properties.filters.bathrooms": "Bathrooms",
      "properties.filters.bathrooms.any": "Any",
      "properties.filters.status": "Status",
      "properties.filters.status.any": "All",
      "properties.filters.search": "Search",
      "properties.filters.clear": "Clear filters",
      "properties.results.count": "properties found",
      "properties.results.sort": "Sort by",
      "properties.sort.newest": "Newest",
      "properties.sort.price_asc": "Price: low to high",
      "properties.sort.price_desc": "Price: high to low",
      "properties.empty": "No properties matched those filters.",
      "properties.card.viewdetails": "View details",

      "type.house": "House",
      "type.condo": "Condo",
      "type.apartment": "Apartment",
      "type.land": "Land",
      "type.commercial": "Commercial",
      "type.multi_family": "Multi-family",

      "status.for_sale": "For sale",
      "status.pending": "Pending",
      "status.sold": "Sold",
      "status.for_rent": "For rent",
      "status.rented": "Rented",

      "feature.view": "View",
      "feature.pool": "Pool",
      "feature.terrace": "Terrace",
      "feature.balcony": "Balcony",
      "feature.security": "Security",
      "feature.generator": "Generator",
      "feature.cistern": "Cistern",
      "feature.gym": "Gym",
      "feature.marina": "Marina / Dock",
      "feature.furnished": "Furnished",

      "detail.beds": "Beds",
      "detail.baths": "Baths",
      "detail.area": "Interior area",
      "detail.lot": "Lot area",
      "detail.year": "Year built",
      "detail.parking": "Parking",
      "detail.description": "Description",
      "detail.features": "Features",
      "detail.additional": "Additional information",
      "detail.mls": "MLS ID",
      "detail.propertyid": "Property ID",
      "detail.hoa": "HOA / Maintenance",
      "detail.municipality": "Municipality",
      "detail.zip": "Zip code",
      "detail.country": "Country",
      "detail.address": "Address",
      "detail.sidebar.title": "Interested in this property?",
      "detail.sidebar.subtitle": "Reach out to Joe for more information or to schedule a visit.",
      "detail.requestinfo": "Request information",
      "detail.contact": "Contact Joe",
      "detail.whatsapp": "WhatsApp",
      "detail.back": "Back to properties",
      "detail.notfound.title": "Property not found",
      "detail.notfound.text": "This property may no longer be available.",

      "about.eyebrow": "About the agent",
      "about.title": "Joe Fontanez",
      "about.subtitle": "Real Estate Broker · Lic. 12114",

      "services.hero.title": "Services",
      "services.hero.subtitle": "Guidance at every stage of the real estate process.",
      "services.buy.title": "Buy",
      "services.buy.text": "Assistance throughout the search and purchase process.",
      "services.sell.title": "Sell",
      "services.sell.text": "Professional presentation and promotion of properties.",
      "services.invest.title": "Invest",
      "services.invest.text": "Guidance for buyers interested in real estate investment.",
      "services.advice.title": "Advisory",
      "services.advice.text": "Personalized attention.",

      "areas.hero.title": "Service areas",
      "areas.hero.subtitle": "These areas are initial examples and can be modified by the agent.",

      "testimonials.empty": "Testimonials coming soon.",

      "contact.hero.title": "Ready to find your next property?",
      "contact.hero.subtitle": "Fill out the form and Joe will get back to you as soon as possible.",
      "contact.form.name": "Name",
      "contact.form.email": "Email",
      "contact.form.phone": "Phone",
      "contact.form.interest": "Interest",
      "contact.form.interest.buy": "Buy",
      "contact.form.interest.sell": "Sell",
      "contact.form.interest.rent": "Rent",
      "contact.form.interest.invest": "Invest",
      "contact.form.interest.other": "Other",
      "contact.form.message": "Message",
      "contact.form.submit": "Send message",
      "contact.form.success": "Thank you. Your message was sent; Joe will contact you soon.",
      "contact.form.error": "The message could not be sent. Please try again or email directly.",
      "contact.info.title": "Contact information",
      "contact.info.subtitle": "You can also reach out directly by email or WhatsApp.",

      "footer.nav": "Navigation",
      "footer.contact": "Contact",
      "footer.legal": "Legal",
      "footer.privacy": "Privacy policy",
      "footer.terms": "Terms of use",
      "footer.rights": "All rights reserved.",
      "footer.tagline": "Real Estate Broker · Lic. 12114",

      "error.title": "Page not found",
      "error.text": "The page you're looking for doesn't exist or was moved.",
      "error.cta": "Back to home",

      "whatsapp.defaultmessage": "Hi Joe, I'm interested in a property and would like more information."
    }
  };

  function getLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "es" || stored === "en") return stored;
    } catch (e) {}
    var nav = (navigator.language || "es").toLowerCase();
    return nav.indexOf("en") === 0 ? "en" : "es";
  }

  function setLang(lang) {
    if (lang !== "es" && lang !== "en") return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute("lang", lang);
    applyTranslations(lang);
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: lang } }));
  }

  function t(key, lang) {
    lang = lang || getLang();
    var dict = DICT[lang] || DICT.es;
    return dict[key] || DICT.es[key] || key;
  }

  function applyTranslations(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = t(key, lang);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder"), lang));
    });
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
  }

  function initLangSwitches() {
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var lang = getLang();
    document.documentElement.setAttribute("lang", lang);
    applyTranslations(lang);
    initLangSwitches();
  });

  window.JFLang = { getLang: getLang, setLang: setLang, t: t };
})();
