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
  if (!reduceMotion) {
    if (revealEls.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("in-view");
      });
    }
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
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
