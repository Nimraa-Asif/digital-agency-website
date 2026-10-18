/* ============================================================
   DEVPRIME — main.js
   GSAP Animations · Theme Toggle · Firebase Contact · Canvas
   ============================================================ */

// ── Firebase SDK (Modular) ────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ┌─────────────────────────────────────────────────────────────┐
// │  FIREBASE CONFIG                                            │
// │  Replace these placeholder values with your Firebase        │
// │  project credentials from the Firebase Console.            │
// └─────────────────────────────────────────────────────────────┘
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.warn("Firebase not configured. Contact form will run in demo mode.", e);
}

// ═══════════════════════════════════════════════════════════════
// GSAP REGISTRATION
// ═══════════════════════════════════════════════════════════════
gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════════════════════════════
(function initTheme() {
  const html        = document.documentElement;
  const btn         = document.getElementById("theme-toggle");
  const icon        = document.getElementById("theme-icon");
  const saved       = localStorage.getItem("devprime-theme") || "dark";

  const applyTheme = (theme) => {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("devprime-theme", theme);
    if (theme === "dark") {
      icon.className = "fas fa-moon";
      btn.title = "Switch to Light Mode";
    } else {
      icon.className = "fas fa-sun";
      btn.title = "Switch to Dark Mode";
    }
  };

  applyTheme(saved);

  btn.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next    = current === "dark" ? "light" : "dark";
    // Animate the icon
    gsap.to(icon, { rotate: 360, duration: 0.5, ease: "back.out(1.4)", onComplete: () => {
      gsap.set(icon, { rotate: 0 });
    }});
    applyTheme(next);
  });
})();

// ═══════════════════════════════════════════════════════════════
// MOBILE NAV
// ═══════════════════════════════════════════════════════════════
(function initMobileNav() {
  const btn      = document.getElementById("hamburger-btn");
  const mobileNav = document.getElementById("mobile-nav");
  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    mobileNav.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", isOpen.toString());
    mobileNav.setAttribute("aria-hidden", (!isOpen).toString());

    const spans = btn.querySelectorAll("span");
    if (isOpen) {
      gsap.to(spans[0], { rotate: 45, y: 7, duration: 0.3 });
      gsap.to(spans[1], { opacity: 0, duration: 0.2 });
      gsap.to(spans[2], { rotate: -45, y: -7, duration: 0.3 });
    } else {
      gsap.to(spans[0], { rotate: 0, y: 0, duration: 0.3 });
      gsap.to(spans[1], { opacity: 1, duration: 0.2 });
      gsap.to(spans[2], { rotate: 0, y: 0, duration: 0.3 });
    }
  };

  btn.addEventListener("click", toggle);

  // Close on link click
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    if (isOpen) toggle();
  }));
})();

// ═══════════════════════════════════════════════════════════════
// NAVBAR SCROLL BEHAVIOUR (GSAP hide/show + shadow)
// ═══════════════════════════════════════════════════════════════
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  let lastY    = 0;
  let hidden   = false;

  ScrollTrigger.create({
    start: 80,
    onUpdate: (self) => {
      const currentY = self.scroll();
      const goingDown = currentY > lastY && currentY > 120;

      if (goingDown && !hidden) {
        gsap.to(navbar, { yPercent: -100, duration: 0.4, ease: "power2.inOut" });
        hidden = true;
      } else if (!goingDown && hidden) {
        gsap.to(navbar, { yPercent: 0, duration: 0.4, ease: "power2.out" });
        hidden = false;
      }
      lastY = currentY;

      // Add shadow when scrolled
      if (currentY > 40) {
        navbar.style.boxShadow = "0 4px 30px rgba(0,0,0,0.4)";
      } else {
        navbar.style.boxShadow = "none";
      }
    }
  });
})();

// ═══════════════════════════════════════════════════════════════
// HERO CANVAS — Particle Field
// ═══════════════════════════════════════════════════════════════
(function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, particles = [], animId;

  const isDark = () => document.documentElement.getAttribute("data-theme") !== "light";

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.5 + 0.5;
      this.a  = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      const alpha = isDark() ? this.a : this.a * 0.4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,169,110,${alpha})`;
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  };

  const connect = () => {
    const maxDist = 140;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * (isDark() ? 0.12 : 0.06);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  };

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    animId = requestAnimationFrame(loop);
  };

  init();
  loop();

  window.addEventListener("resize", () => { resize(); particles.forEach(p => p.reset()); });
})();

// ═══════════════════════════════════════════════════════════════
// HERO ENTRANCE ANIMATIONS (GSAP Timeline)
// ═══════════════════════════════════════════════════════════════
(function heroAnimations() {
  const tl = gsap.timeline({ delay: 0.2 });

  tl.fromTo("#hero-eyebrow",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
  )
  .fromTo("#hero-line-1",
    { opacity: 0, y: 60, skewY: 3 },
    { opacity: 1, y: 0, skewY: 0, duration: 0.9, ease: "power3.out" },
    "-=0.3"
  )
  .fromTo("#hero-line-2",
    { opacity: 0, y: 60, skewY: 3 },
    { opacity: 1, y: 0, skewY: 0, duration: 0.9, ease: "power3.out" },
    "-=0.6"
  )
  .fromTo("#hero-line-3",
    { opacity: 0, y: 60, skewY: 3 },
    { opacity: 1, y: 0, skewY: 0, duration: 0.9, ease: "power3.out" },
    "-=0.6"
  )
  .fromTo("#hero-desc",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
    "-=0.4"
  )
  .fromTo("#hero-cta",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    "-=0.3"
  )
  .fromTo("#hero-visual",
    { opacity: 0, scale: 0.85 },
    { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.3)" },
    "-=0.8"
  );
})();

// ═══════════════════════════════════════════════════════════════
// PARALLAX ON HERO (Mouse Move)
// ═══════════════════════════════════════════════════════════════
(function heroParallax() {
  const hero   = document.getElementById("hero");
  const visual = document.getElementById("hero-visual");
  if (!hero || !visual) return;

  hero.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;

    gsap.to(visual, {
      x: dx * 20,
      y: dy * 12,
      duration: 1,
      ease: "power1.out"
    });
  });

  hero.addEventListener("mouseleave", () => {
    gsap.to(visual, { x: 0, y: 0, duration: 1, ease: "power2.out" });
  });
})();

// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL — Generic
// ═══════════════════════════════════════════════════════════════
(function scrollReveal() {
  // Reveal up
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Reveal left
  gsap.utils.toArray(".reveal-left").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: -60 },
      {
        opacity: 1, x: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Reveal right
  gsap.utils.toArray(".reveal-right").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: 60 },
      {
        opacity: 1, x: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  });
})();

// ═══════════════════════════════════════════════════════════════
// SERVICE CARDS — Stagger entrance
// ═══════════════════════════════════════════════════════════════
(function serviceCards() {
  gsap.fromTo(".service-card",
    { opacity: 0, y: 60, scale: 0.96 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.7, ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: "#services .services-grid",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    }
  );
})();

// ═══════════════════════════════════════════════════════════════
// STATS — Animated Counter
// ═══════════════════════════════════════════════════════════════
(function statsCounter() {
  const counters = document.querySelectorAll(".stat-number[data-target]");

  ScrollTrigger.create({
    trigger: "#stats",
    start: "top 80%",
    once: true,
    onEnter: () => {
      counters.forEach((el) => {
        const target  = parseInt(el.getAttribute("data-target"), 10);
        const suffix  = el.getAttribute("data-suffix") || "";
        const obj     = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 2.2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
          onComplete: () => {
            el.textContent = target + suffix;
          }
        });
      });
    }
  });
})();

// ═══════════════════════════════════════════════════════════════
// PORTFOLIO — Tilt Effect on Mouse Move
// ═══════════════════════════════════════════════════════════════
(function portfolioTilt() {
  document.querySelectorAll(".portfolio-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect    = card.getBoundingClientRect();
      const cx      = rect.left + rect.width  / 2;
      const cy      = rect.top  + rect.height / 2;
      const dx      = (e.clientX - cx) / (rect.width  / 2);
      const dy      = (e.clientY - cy) / (rect.height / 2);
      const rotateX = -dy * 8;
      const rotateY =  dx * 8;

      gsap.to(card, {
        rotateX, rotateY,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.6, ease: "elastic.out(1, 0.5)"
      });
    });
  });
})();

// ═══════════════════════════════════════════════════════════════
// PORTFOLIO — Filter Buttons
// ═══════════════════════════════════════════════════════════════
(function portfolioFilter() {
  const btns  = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".portfolio-card");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active state
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      cards.forEach((card) => {
        const category = card.getAttribute("data-category");
        const show = filter === "all" || category === filter;

        gsap.to(card, {
          opacity: show ? 1 : 0.25,
          scale:   show ? 1 : 0.96,
          duration: 0.4,
          ease: "power2.inOut"
        });
        card.style.pointerEvents = show ? "auto" : "none";
      });
    });
  });
})();

// ═══════════════════════════════════════════════════════════════
// PORTFOLIO — Scroll Parallax on cards
// ═══════════════════════════════════════════════════════════════
(function portfolioParallax() {
  document.querySelectorAll(".portfolio-card").forEach((card, i) => {
    const dir = i % 2 === 0 ? -20 : 20;
    gsap.fromTo(card,
      { y: dir },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5
        }
      }
    );
  });
})();

// ═══════════════════════════════════════════════════════════════
// BRAND DIVIDER — Infinite Marquee (GSAP)
// ═══════════════════════════════════════════════════════════════
(function brandMarquee() {
  const track = document.getElementById("brand-track");
  if (!track) return;

  // Clone the track for seamless loop
  const clone = track.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.parentNode.appendChild(clone);

  // Wrap both in a flex container
  const wrapper = document.getElementById("brand-divider");
  const trackW = track.scrollWidth;

  // Use GSAP to animate both tracks
  const tl = gsap.timeline({ repeat: -1 });
  tl.fromTo([track, clone],
    { x: 0 },
    {
      x: () => -trackW / 2,
      duration: 22,
      ease: "none",
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % (trackW / 2))
      }
    }
  );

  // Pause on hover
  wrapper.addEventListener("mouseenter", () => tl.pause());
  wrapper.addEventListener("mouseleave", () => tl.resume());

  // ScrollTrigger scrub for extra drama
  gsap.to(track, {
    scrollTrigger: {
      trigger: "#brand-divider",
      start: "top bottom",
      end: "bottom top",
      scrub: 2
    }
  });
})();

// ═══════════════════════════════════════════════════════════════
// FLOATING SOCIAL DOCK — Entrance
// ═══════════════════════════════════════════════════════════════
(function socialDockEntrance() {
  gsap.fromTo(".social-icon-link",
    { opacity: 0, x: -30 },
    {
      opacity: 1, x: 0,
      duration: 0.6, ease: "back.out(1.4)",
      stagger: 0.15,
      delay: 1.5
    }
  );
})();

// ═══════════════════════════════════════════════════════════════
// ACTIVE NAV LINK on scroll
// ═══════════════════════════════════════════════════════════════
(function activeNavLink() {
  const sections = document.querySelectorAll("section[id], div[id='brand-divider']");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => observer.observe(sec));
})();

// ═══════════════════════════════════════════════════════════════
// TOAST HELPER
// ═══════════════════════════════════════════════════════════════
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const icon = type === "success"
    ? '<i class="fas fa-check-circle"></i>'
    : '<i class="fas fa-exclamation-circle"></i>';

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Remove after 5 seconds
  setTimeout(() => {
    gsap.to(toast, {
      opacity: 0, x: 40, duration: 0.35, ease: "power2.in",
      onComplete: () => toast.remove()
    });
  }, 5000);
}

// ═══════════════════════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════════════════════
(function initContactForm() {
  const form      = document.getElementById("contact-form");
  const submitBtn = document.getElementById("form-submit-btn");
  const btnText   = document.getElementById("btn-text");
  const btnIcon   = document.getElementById("btn-icon");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Basic validation
    const name    = document.getElementById("input-name").value.trim();
    const email   = document.getElementById("input-email").value.trim();
    const service = document.getElementById("input-service").value;
    const message = document.getElementById("input-message").value.trim();

    if (!name || !email || !service || !message) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    btnText.textContent = "Sending...";
    btnIcon.className = "fas fa-spinner fa-spin";

    const payload = { name, email, service, message, timestamp: new Date().toISOString() };

    try {
      if (db) {
        // Firebase write
        await push(ref(db, "contact-submissions"), {
          ...payload,
          serverTime: serverTimestamp()
        });
      } else {
        // Demo mode: simulate a 1s delay
        await new Promise(r => setTimeout(r, 1200));
      }

      showToast("Message sent! We'll be in touch within 24 hours. 🚀", "success");
      form.reset();
    } catch (err) {
      console.error("Submission error:", err);
      showToast("Oops! Something went wrong. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = "Send Message";
      btnIcon.className = "fas fa-paper-plane";
    }
  });
})();

// ═══════════════════════════════════════════════════════════════
// SMOOTH ANCHOR SCROLL
// ═══════════════════════════════════════════════════════════════
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--navbar-h")) || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

// ═══════════════════════════════════════════════════════════════
// SECTION ENTRANCE — About features stagger
// ═══════════════════════════════════════════════════════════════
(function aboutStagger() {
  gsap.fromTo(".about-feature-item",
    { opacity: 0, x: 30 },
    {
      opacity: 1, x: 0,
      duration: 0.6, ease: "power2.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".about-features",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    }
  );
})();

// ═══════════════════════════════════════════════════════════════
// CONTACT FORM CARD — focus highlight animation
// ═══════════════════════════════════════════════════════════════
(function formAnimations() {
  document.querySelectorAll(".form-control-custom").forEach((input) => {
    input.addEventListener("focus", () => {
      gsap.to(input, { scale: 1.01, duration: 0.2, ease: "power1.out" });
    });
    input.addEventListener("blur", () => {
      gsap.to(input, { scale: 1, duration: 0.2, ease: "power1.out" });
    });
  });
})();

// ═══════════════════════════════════════════════════════════════
// FOOTER — Fade-in columns
// ═══════════════════════════════════════════════════════════════
(function footerReveal() {
  gsap.fromTo(".footer-grid > div",
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.7, ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "#footer",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    }
  );
})();

// ═══════════════════════════════════════════════════════════════
// STATS SECTION — Card stagger entrance
// ═══════════════════════════════════════════════════════════════
(function statsEntrance() {
  gsap.fromTo(".stat-block",
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.7, ease: "back.out(1.3)",
      stagger: 0.15,
      scrollTrigger: {
        trigger: "#stats",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    }
  );
})();

console.log(
  "%c⚡ DevPrime — Elite Digital Agency",
  "background: linear-gradient(135deg, #C9A96E, #A0804A); color: #080808; padding: 8px 18px; border-radius: 6px; font-size: 14px; font-weight: 700;"
);
