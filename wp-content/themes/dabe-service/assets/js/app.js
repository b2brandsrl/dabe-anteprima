/* DABE SERVICE — interazioni tema (vanilla, performance-first, zero dipendenze) */
(function () {
  "use strict";
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header scrolled */
  var header = document.getElementById("header");
  if (header) {
    var hs = function () { header.classList.toggle("scrolled", scrollY > 24); };
    hs(); addEventListener("scroll", hs, { passive: true });
  }

  /* Mobile nav */
  var burger = document.getElementById("burger"),
      panel = document.getElementById("mobilePanel"),
      mpClose = document.getElementById("mpClose");
  function setMenu(o) {
    if (!panel) return;
    panel.classList.toggle("open", o);
    if (burger) burger.setAttribute("aria-expanded", o ? "true" : "false");
    document.body.style.overflow = o ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(true); });
  if (mpClose) mpClose.addEventListener("click", function () { setMenu(false); });
  if (panel) panel.addEventListener("click", function (e) { if (e.target === panel || e.target.tagName === "A") setMenu(false); });
  addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    setMenu(false);
    // chiude la lightbox certificati (CSS :target) togliendo l'hash
    if (document.querySelector(".certlb:target")) history.replaceState(null, "", location.pathname + location.search);
  });

  /* Reveal + hub + pillars (una sola IO) */
  var io;
  if (!rm && "IntersectionObserver" in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px 8% 0px" });
    document.querySelectorAll(".reveal,.hub,.pillar").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal,.hub,.pillar").forEach(function (el) { el.classList.add("in"); });
  }
  /* Rete di sicurezza: se l'IO non scatta (JS lento, tab in background, cattura statica),
     rivela comunque tutto poco dopo il load — nessun contenuto resta mai invisibile. */
  addEventListener("load", function () {
    setTimeout(function () {
      document.querySelectorAll(".reveal,.hub,.pillar").forEach(function (el) { el.classList.add("in"); });
      document.querySelectorAll("[data-count]").forEach(function (el) { count(el); });
    }, 1500);
  });

  /* Counter animati */
  function fmt(n) { return n >= 1000 ? n.toLocaleString("it-IT") : String(n); }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var to = parseFloat(el.dataset.count), suf = el.dataset.suffix || "";
    if (rm) { el.textContent = fmt(to) + suf; return; }
    var t0 = performance.now(), dur = 1400;
    (function tick(now) {
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e)) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var cs = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    cs.forEach(function (el) { cio.observe(el); });
  } else { cs.forEach(count); }

  /* Timeline fill on scroll */
  var tl = document.querySelector(".timeline"), fill = document.querySelector(".timeline__fill");
  if (tl && fill && !rm) {
    var onTl = function () {
      var r = tl.getBoundingClientRect(), vh = innerHeight;
      var total = r.height, seen = Math.min(Math.max(vh * 0.6 - r.top, 0), total);
      fill.style.height = (total ? (seen / total) * 100 : 0) + "%";
    };
    onTl(); addEventListener("scroll", onTl, { passive: true });
  } else if (fill) { fill.style.height = "100%"; }

  /* IL MOMENTO-FIRMA: l'hub "un solo interlocutore" si costruisce sullo scroll */
  var hub = document.querySelector(".hub__diagram");
  if (hub && !rm) {
    var hScrub = function () {
      var r = hub.getBoundingClientRect(), vh = innerHeight;
      hub.style.setProperty("--p", Math.min(Math.max((vh * 0.85 - r.top) / (vh * 0.6), 0), 1));
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { addEventListener("scroll", hScrub, { passive: true }); hScrub(); }
          else removeEventListener("scroll", hScrub);
        });
      }, { threshold: 0 }).observe(hub);
    } else { hub.style.setProperty("--p", 1); }
  }

  /* Filtro lavori */
  var fb = document.getElementById("filterbar");
  if (fb) {
    fb.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      fb.querySelectorAll("button").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      var f = b.dataset.f;
      document.querySelectorAll("#works .work").forEach(function (w) {
        w.classList.toggle("is-hidden", !(f === "all" || w.dataset.cat === f));
      });
    });
  }

  /* Magnetic CTA (un solo elemento signature, off su touch/reduced-motion) */
  if (!rm && !matchMedia("(hover: none)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.18 + "px," + (e.clientY - r.top - r.height / 2) * 0.25 + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* Hero Mr Dabe parallax leggero */
  if (!rm) {
    var dabe = document.querySelector(".hero__dabe"), hero = document.querySelector(".hero");
    if (dabe && hero) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        dabe.style.transform = "translate(" + ((e.clientX - r.left) / r.width - .5) * 14 + "px," + ((e.clientY - r.top) / r.height - .5) * 12 + "px)";
      });
      hero.addEventListener("pointerleave", function () { dabe.style.transform = ""; });
    }
  }

  /* Parallax foto .ph--px (GPU-only, throttled rAF, off su reduced-motion) */
  if (!rm) {
    var pxEls = [].slice.call(document.querySelectorAll(".ph--px"));
    if (pxEls.length) {
      var ticking = false;
      var updPx = function () {
        var vh = innerHeight;
        pxEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var p = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.setProperty("--py", (p * -26).toFixed(1));
        });
        ticking = false;
      };
      addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(updPx); } }, { passive: true });
      updPx();
    }
  }

  /* Form demo (se non gestito da plugin) */
  var form = document.getElementById("contactForm");
  if (form) form.addEventListener("submit", function (e) {
    if (form.dataset.demo !== "1") return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var ok = document.getElementById("formOk"); if (ok) ok.style.display = "block";
    form.reset();
  });
})();
