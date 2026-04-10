(function () {
  "use strict";

  var nav = document.querySelector(".navbar");
  var navLinks = document.querySelectorAll('.navbar a[href^="#"]');
  var sections = [];

  navLinks.forEach(function (a) {
    var id = a.getAttribute("href");
    if (!id || id === "#") return;
    var el = document.getElementById(id.slice(1));
    if (el) sections.push({ link: a, el: el });
  });

  function offset() {
    return (nav ? nav.getBoundingClientRect().height : 0) + 12;
  }

  function setActive() {
    var y = window.scrollY + offset();
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.offsetTop <= y) current = sections[i];
    }
    sections.forEach(function (s) {
      s.link.classList.toggle("active", s === current);
    });
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        setActive();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", setActive);
  setActive();

  /* --- Scroll reveal --- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setStaggerDelays(selector, stepMs) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.style.setProperty("--delay", i * stepMs + "ms");
    });
  }

  setStaggerDelays(".lang-stagger", 55);
  setStaggerDelays(".cert-stagger", 90);

  var revealEls = document.querySelectorAll(".fade-up");

  function revealNow(el) {
    el.classList.add("in-view");
  }

  /** True if any part of the element is inside the viewport (mobile-safe). */
  function isInViewport(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var vw = window.innerWidth || document.documentElement.clientWidth;
    return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  }

  function revealAllPending() {
    document.querySelectorAll(".fade-up:not(.in-view)").forEach(revealNow);
  }

  if (!reduceMotion) {
    if (revealEls.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealNow(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          /* Expand bottom so short phone viewports still fire; threshold 0 = any pixel */
          rootMargin: "0px 0px 18% 0px",
          threshold: 0
        }
      );
      revealEls.forEach(function (el) {
        if (isInViewport(el)) {
          revealNow(el);
        } else {
          io.observe(el);
        }
      });
      /* iOS / slow paint: second pass after layout */
      requestAnimationFrame(function () {
        revealEls.forEach(function (el) {
          if (!el.classList.contains("in-view") && isInViewport(el)) {
            revealNow(el);
            io.unobserve(el);
          }
        });
      });
    } else {
      revealEls.forEach(revealNow);
    }
    /* Last resort: never leave content invisible if IO missed */
    window.setTimeout(function () {
      revealAllPending();
    }, 2400);
  } else {
    revealEls.forEach(revealNow);
  }

  /* --- Subtle 3D tilt on project cards (pointer devices only) --- */
  if (
    !reduceMotion &&
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches
  ) {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      card.addEventListener(
        "mousemove",
        function (e) {
          var r = card.getBoundingClientRect();
          var x = e.clientX - r.left;
          var y = e.clientY - r.top;
          var mx = (x / r.width - 0.5) * 2;
          var my = (y / r.height - 0.5) * 2;
          var rx = my * -7;
          var ry = mx * 7;
          card.style.transform =
            "perspective(960px) rotateX(" +
            rx +
            "deg) rotateY(" +
            ry +
            "deg) translateY(-6px)";
        },
        { passive: true }
      );
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }
})();
