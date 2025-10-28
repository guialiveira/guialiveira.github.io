(function(){
  const supported = ["pt", "en"];
  const storageKey = "site.lang";

  function resolveInitialLang(){
    const saved = localStorage.getItem(storageKey);
    if (saved && supported.includes(saved)) return saved;
    const nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (nav.startsWith("pt")) return "pt";
    return "en";
  }

  async function loadTranslations(lang){
    const res = await fetch(`/assets/i18n/${lang}.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Falha ao carregar traduções: ${lang}`);
    return res.json();
  }

  function applyTranslations(dict){
    // Ajusta atributo lang do documento
    document.documentElement.setAttribute("lang", currentLang);

    // Para cada elemento com data-i18n, aplicar texto/HTML/atributo
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const mode = el.getAttribute("data-i18n-mode") || "text"; // text|html
      const attr = el.getAttribute("data-i18n-attr"); // ex.: alt, title

      const value = key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : undefined), dict);
      if (value == null) return; // fallback: não sobrescreve

      if (attr){
        el.setAttribute(attr, value);
      } else if (mode === "html"){
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    // Estado visual do switch
    document.querySelectorAll('.lang-switch [data-lang]').forEach(btn => {
      const active = btn.getAttribute('data-lang') === currentLang;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  async function setLanguage(lang){
    if (!supported.includes(lang)) lang = "en";
    currentLang = lang;
    try {
      const dict = await loadTranslations(lang);
      await applyTranslations(dict);
      localStorage.setItem(storageKey, lang);
    } catch (e){
      console.error(e);
    }
  }

  // Inicialização
  let currentLang = resolveInitialLang();
  window.__setLang = setLanguage; // opcional, p/ debug no console

  // Listeners do switch
  function setupSwitcher(){
    const container = document.querySelector('.lang-switch');
    if (!container) return;
    container.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-lang]');
      if (!btn) return;
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupSwitcher();
    setLanguage(currentLang);
  });
})();
