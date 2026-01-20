// AMENSIS — lightweight JS (mobile menu, smooth scroll, form validation, topbar on scroll)
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Topbar background on scroll
  const topbar = document.getElementById("topbar");
  const onScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle("is-solid", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    const setExpanded = (v) => {
      toggle.setAttribute("aria-expanded", String(v));
      nav.classList.toggle("is-open", v);
    };
    toggle.addEventListener("click", () => {
      const open = nav.classList.contains("is-open");
      setExpanded(!open);
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setExpanded(false)));
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("is-open")) return;
      const target = e.target;
      if (target instanceof Node && (nav.contains(target) || toggle.contains(target))) return;
      setExpanded(false);
    });
  }

  // Smooth scroll anchors
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Form validation (mock)
  const form = document.getElementById("contactForm");
  const msg = document.getElementById("formMsg");
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  if (form && msg) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "";

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();

      const errors = [];
      if (name.length < 2) errors.push("Please enter a valid name.");
      if (!isEmail(email)) errors.push("Please enter a valid email.");
      if (message.length < 8) errors.push("Message must be at least 8 characters.");

      if (errors.length) {
        msg.textContent = "⚠️ " + errors[0];
        msg.style.color = "rgba(255,31,58,.95)";
        return;
      }

      // Connect to a backend later (Formspree, Netlify Forms, etc.)
      msg.textContent = "✅ Message ready! (mock only — connect a backend when you want)";
      msg.style.color = "rgba(240,240,246,.85)";
      form.reset();
    });
  }
})();
