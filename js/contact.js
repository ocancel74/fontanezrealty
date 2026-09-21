/**
 * contact.js — submits the contact form to Formspree (a static-friendly
 * form backend; no server code of our own). The endpoint comes from
 * content/settings/general.yml -> config/site.json (formspreeEndpoint),
 * so Joe can set it without editing code. Falls back to a mailto link
 * if no endpoint has been configured yet.
 */
(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var successBox = form.querySelector(".form-success");
  var errorBox = form.querySelector(".form-error");
  var submitBtn = form.querySelector('[type="submit"]');

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
  }

  function hideMessages() {
    if (successBox) successBox.style.display = "none";
    if (errorBox) errorBox.style.display = "none";
  }

  function mailtoFallback(data) {
    var lang = window.JFLang.getLang();
    var email = (window.JFConfig || {}).email || "Joefontanez0707@gmail.com";
    var subject = encodeURIComponent((lang === "en" ? "Website inquiry from " : "Consulta desde el sitio web de ") + data.name);
    var lines = [
      (lang === "en" ? "Name" : "Nombre") + ": " + data.name,
      "Email: " + data.email,
      (lang === "en" ? "Phone" : "Teléfono") + ": " + data.phone,
      (lang === "en" ? "Interest" : "Interés") + ": " + data.interest,
      "", data.message
    ];
    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + encodeURIComponent(lines.join("\n"));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideMessages();

    var formData = new FormData(form);
    var data = Object.fromEntries(formData.entries());
    var endpoint = (window.JFConfig || {}).formspreeEndpoint;

    if (!endpoint) {
      mailtoFallback(data);
      return;
    }

    setLoading(true);
    fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    })
      .then(function (res) {
        setLoading(false);
        if (res.ok) {
          if (successBox) successBox.style.display = "block";
          form.reset();
        } else {
          if (errorBox) errorBox.style.display = "block";
        }
      })
      .catch(function () {
        setLoading(false);
        if (errorBox) errorBox.style.display = "block";
      });
  });
})();
