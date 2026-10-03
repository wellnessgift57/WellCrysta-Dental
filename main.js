/* Wellcrysta Dental — site behaviour + tracking events (dataLayer) */
(function () {
  var C = window.SITE_CONFIG || {};
  /* 0. GTM — loaded after page load so it does not slow first paint (PageSpeed) */
  window.dataLayer = window.dataLayer || [];
  function loadGTM() {
    var id = C.gtmId; if (!id || id === "GTM-XXXXXXX" || window.__gtm) return; window.__gtm = 1;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtm.js?id=" + id; document.head.appendChild(s);
  }
  if (document.readyState === "complete") setTimeout(loadGTM, 1500);
  else window.addEventListener("load", function () { setTimeout(loadGTM, 1500); });
  ["scroll", "touchstart", "mousemove", "keydown"].forEach(function (ev) { window.addEventListener(ev, loadGTM, { once: true, passive: true }); });
  window.dataLayer = window.dataLayer || [];
  function track(event, params) { var o = { event: event }; for (var k in params || {}) o[k] = params[k]; window.dataLayer.push(o); }

  /* 1. Capture UTM / click IDs (first touch, kept 90 days) */
  var KEYS = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid","gbraid","wbraid"];
  var qs = new URLSearchParams(location.search), store = {};
  try { store = JSON.parse(localStorage.getItem("wd_attr") || "{}"); } catch (e) {}
  if (KEYS.some(function (k) { return qs.get(k); })) {
    store = { landing_page: location.pathname, ts: Date.now() };
    KEYS.forEach(function (k) { if (qs.get(k)) store[k] = qs.get(k); });
    localStorage.setItem("wd_attr", JSON.stringify(store));
  } else if (store.ts && Date.now() - store.ts > 90 * 864e5) { store = {}; localStorage.removeItem("wd_attr"); }

  /* 2. Phone / WhatsApp links from config */
  var waUrl = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(C.whatsappText || "");
  document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waUrl; a.target = "_blank"; a.rel = "noopener"; });
  document.querySelectorAll("[data-call]").forEach(function (a) { a.href = "tel:+" + C.phone; });
  document.querySelectorAll("[data-phone-text]").forEach(function (el) { el.textContent = C.phoneDisplay; });

  /* 3. Click events */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a"); if (!a) return;
    var loc = a.getAttribute("data-loc") || "unknown";
    if (a.hasAttribute("data-wa")) track("whatsapp_click", { click_location: loc });
    else if (a.hasAttribute("data-call")) track("call_click", { click_location: loc });
    else if (a.hasAttribute("data-costsheet")) track("cost_sheet_download", { click_location: loc });
    else if (a.hasAttribute("data-book")) track("book_cta_click", { click_location: loc });
  });

  /* 4. Mobile menu */
  var btn = document.querySelector(".menu-btn"), menu = document.querySelector(".nav ul");
  if (btn && menu) btn.addEventListener("click", function () { var o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", o ? "true" : "false"); });
  document.querySelectorAll("[data-print]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); window.print(); }); });

  /* 5. Lead forms */
  var t = qs.get("treatment");
  if (t) document.querySelectorAll("select[name=treatment_field]").forEach(function (sel) {
    for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === t) sel.selectedIndex = i;
  });
  document.querySelectorAll("form.lead-form").forEach(function (f) {
    var started = false;
    f.addEventListener("focusin", function () { if (!started) { started = true; track("form_start", { form_id: f.id }); } });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = f.querySelector(".form-error");
      var name = f.name_field.value.trim(), phone = f.phone_field.value.replace(/\D/g, ""), treat = f.treatment_field.value;
      if (!(name.length > 1 && /^[6-9]\d{9}$/.test(phone.slice(-10)) && treat && f.consent_field.checked)) {
        err.textContent = "Please enter your name, a valid 10-digit mobile number, choose a treatment and tick the consent box.";
        err.style.display = "block"; return;
      }
      err.style.display = "none";
      var b = f.querySelector("button[type=submit]"); b.disabled = true; b.textContent = "Sending…";
      var data = { name: name, phone: phone.slice(-10), treatment: treat, page: location.pathname };
      for (var k in store) data[k] = store[k];
      sessionStorage.setItem("wd_lead", JSON.stringify({ treatment: treat, form_id: f.id }));
      function done() { location.href = "thank-you.html"; }
      if (!C.web3formsKey || C.web3formsKey === "YOUR_WEB3FORMS_ACCESS_KEY") { done(); return; }
      data.access_key = C.web3formsKey; data.subject = "New website enquiry — " + treat;
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) }).then(done).catch(done);
    });
  });

  /* 6. Thank-you page = conversion (fires once) */
  if (document.body.getAttribute("data-page") === "thank-you") {
    var lead = null; try { lead = JSON.parse(sessionStorage.getItem("wd_lead")); } catch (e) {}
    if (lead) {
      track("generate_lead", { treatment: lead.treatment, form_id: lead.form_id, utm_source: store.utm_source || "(direct)", utm_campaign: store.utm_campaign || "(none)" });
      sessionStorage.removeItem("wd_lead");
    }
  }
})();
