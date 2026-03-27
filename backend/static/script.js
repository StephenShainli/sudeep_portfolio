/* ============================================================
   ALL JS — Cursor overlay, particles, animations, interactions
============================================================ */

/* 0. PROFILE PHOTO FALLBACK */
(() => {
  const img = document.getElementById("profile-photo");
  const fb = document.getElementById("avatar-fallback");
  if (!img || !fb) return;
  img.addEventListener("load", () => {
    img.style.display = "block";
    fb.style.display = "none";
  });
  img.addEventListener("error", () => {
    img.style.display = "none";
    fb.style.display = "inline";
  });
})();

/* 1. CUSTOM CURSOR */
const ring = document.getElementById("cursor-ring");
const dot = document.getElementById("cursor-dot");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  if (dot) {
    dot.style.left = mx + "px";
    dot.style.top = my + "px";
  }
  const side = e.clientX < window.innerWidth / 2 ? "fire" : "water";
  document.body.classList.toggle("cursor-fire", side === "fire");
  document.body.classList.toggle("cursor-water", side === "water");
});

(function loop() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  if (ring) {
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
  }
  requestAnimationFrame(loop);
})();

document.querySelectorAll("a,button,.project-link,.social-link,.btn").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    if (!ring) return;
    ring.style.width = ring.style.height = "56px";
  });
  el.addEventListener("mouseleave", () => {
    if (!ring) return;
    ring.style.width = ring.style.height = "38px";
  });
});

/* 2. PARTICLE CANVAS */
const cv = document.getElementById("particle-canvas"),
  cx2 = cv?.getContext?.("2d");
function sz() {
  if (!cv) return;
  cv.width = innerWidth;
  cv.height = innerHeight;
}
sz();
window.addEventListener("resize", sz);

class P {
  constructor() {
    this.init(true);
  }
  init(scatter) {
    this.f = Math.random() < 0.5;
    if (this.f) {
      this.x = Math.random() * cv.width * 0.5;
      this.y = scatter ? Math.random() * cv.height : cv.height + 20;
      this.vy = -(Math.random() * 1.4 + 0.4);
      this.col = `hsl(${Math.random() * 40 + 10},100%,${Math.random() * 30 + 50}%)`;
    } else {
      this.x = cv.width * 0.5 + Math.random() * cv.width * 0.5;
      this.y = scatter ? Math.random() * cv.height : -20;
      this.vy = Math.random() * 1.4 + 0.4;
      this.col = `hsl(${Math.random() * 30 + 190},90%,${Math.random() * 30 + 55}%)`;
    }
    this.vx = (Math.random() - 0.5) * 0.6;
    this.s = Math.random() * 2.5 + 0.8;
    this.l = 1;
    this.d = Math.random() * 0.007 + 0.004;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.l -= this.d;
    if (this.l <= 0) this.init(false);
  }
  draw() {
    cx2.save();
    cx2.globalAlpha = Math.max(0, this.l) * 0.65;
    cx2.fillStyle = cx2.shadowColor = this.col;
    cx2.shadowBlur = 7;
    cx2.beginPath();
    cx2.arc(this.x, this.y, this.s, 0, Math.PI * 2);
    cx2.fill();
    cx2.restore();
  }
}
const ps = cx2 ? Array.from({ length: 120 }, () => new P()) : [];
(function loopParticles() {
  if (cx2 && cv) {
    cx2.clearRect(0, 0, cv.width, cv.height);
    ps.forEach((p) => {
      p.update();
      p.draw();
    });
  }
  requestAnimationFrame(loopParticles);
})();

/* 3. LAVA BUBBLES */
(() => {
  const c = document.getElementById("lava-container");
  if (!c) return;
  for (let i = 0; i < 12; i++) {
    const b = document.createElement("div");
    b.className = "lava-bubble";
    const s = Math.random() * 40 + 15;
    b.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 90}%;--dur:${(
      Math.random() * 6 +
      5
    ).toFixed(1)}s;--delay:${(Math.random() * 8).toFixed(1)}s;`;
    c.appendChild(b);
  }
})();

/* 4. WATER STREAMS */
(() => {
  const c = document.getElementById("water-container");
  if (!c) return;
  for (let i = 0; i < 15; i++) {
    const s = document.createElement("div");
    s.className = "water-stream";
    s.style.cssText = `left:${Math.random() * 100}%;height:${Math.random() * 200 + 100}px;--dur:${(
      Math.random() * 3 +
      3
    ).toFixed(1)}s;--delay:${(Math.random() * 5).toFixed(1)}s;`;
    c.appendChild(s);
  }
})();

/* 5. SCROLL REVEAL */
const ro = new IntersectionObserver(
  (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal,.reveal-left,.reveal-right").forEach((el) => ro.observe(el));

/* 6. SKILL BARS */
const bo = new IntersectionObserver(
  (es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".bar-fill[data-pct]").forEach((f) => setTimeout(() => (f.style.width = f.dataset.pct + "%"), 300));
      bo.unobserve(e.target);
    });
  },
  { threshold: 0.3 }
);
const bars = document.querySelector(".about-bars");
if (bars) bo.observe(bars);

/* 7. CIRCULAR SKILL RINGS */
const co = new IntersectionObserver(
  (es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const pct = parseInt(e.target.dataset.skill, 10);
      const circ = e.target.querySelector(".circle-prog");
      if (circ) {
        const C = 2 * Math.PI * 34;
        setTimeout(() => {
          circ.style.strokeDasharray = C;
          circ.style.strokeDashoffset = C * (1 - pct / 100);
        }, 200);
      }
      co.unobserve(e.target);
    });
  },
  { threshold: 0.35 }
);
document.querySelectorAll(".skill-card[data-skill]").forEach((c) => co.observe(c));

/* 8. 3D TILT */
document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transition = "transform .08s";
    card.style.transform = `perspective(800px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) translateY(-6px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transition = "transform .5s";
    card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
  });
});

/* 9. THEME TOGGLE */
document.getElementById("theme-toggle")?.addEventListener("click", () => {
  const h = document.documentElement;
  h.setAttribute("data-theme", h.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* 10. HAMBURGER */
const ham = document.getElementById("hamburger"),
  nav = document.getElementById("nav-links");
ham?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  const sp = ham.querySelectorAll("span");
  sp[0].style.transform = open ? "rotate(45deg) translate(5px,5px)" : "";
  sp[1].style.opacity = open ? "0" : "";
  sp[2].style.transform = open ? "rotate(-45deg) translate(5px,-5px)" : "";
});
nav?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    ham?.querySelectorAll("span").forEach((s) => {
      s.style.transform = "";
      s.style.opacity = "";
    });
  })
);

/* 11. STICKY NAV */
window.addEventListener("scroll", () => {
  const n = document.querySelector("nav");
  if (!n) return;
  n.style.background = scrollY > 50 ? "rgba(5,8,16,.96)" : "rgba(5,8,16,.6)";
});

/* 12. TYPEWRITER */
(() => {
  const spans = document.querySelectorAll(".hero-tagline span:not(.sep)");
  spans.forEach((span, i) => {
    const txt = span.textContent;
    span.textContent = "";
    span.style.opacity = "0";
    setTimeout(() => {
      span.style.cssText += "opacity:1;transition:opacity .4s;";
      let j = 0;
      const iv = setInterval(() => {
        span.textContent += txt[j++];
        if (j >= txt.length) clearInterval(iv);
      }, 50);
    }, 900 + i * 600);
  });
})();

/* 13. CONTACT FORM (POST -> backend -> SQLite) */
document.getElementById("contact-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = document.getElementById("contact-submit");
  const status = document.getElementById("contact-status");
  const orig = btn.textContent;

  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
  };

  try {
    btn.disabled = true;
    btn.textContent = "Sending…";
    if (status) status.textContent = "";

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      const msg = data?.error || "Failed to send. Try again.";
      if (status) status.textContent = msg;
      btn.textContent = orig;
      btn.disabled = false;
      return;
    }

    btn.textContent = "Sent! ✓";
    btn.style.background = "linear-gradient(135deg,#00c851,#007e33)";
    if (status) status.textContent = "Saved to database.";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
      btn.disabled = false;
      this.reset();
      if (status) status.textContent = "";
    }, 2200);
  } catch (err) {
    if (status) status.textContent = "Network error. Try again.";
    btn.textContent = orig;
    btn.disabled = false;
  }
});

/* 14. ACTIVE NAV */
const sObs = new IntersectionObserver(
  (es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      document.querySelectorAll(".nav-links a").forEach((a) => (a.style.color = ""));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.style.color = ["about", "projects", "contact"].includes(e.target.id) ? "var(--fire-3)" : "var(--water-3)";
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll("section[id]").forEach((s) => sObs.observe(s));

/* 15. RIPPLE */
document.querySelectorAll(".btn,.project-link").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const r = this.getBoundingClientRect(),
      sz = Math.max(r.width, r.height);
    const rpl = document.createElement("span");
    rpl.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,255,255,.28);pointer-events:none;top:${e.clientY - r.top - sz / 2}px;left:${e.clientX - r.left - sz / 2}px;transform:scale(0);animation:ripple-anim .6s linear forwards;`;
    this.appendChild(rpl);
    setTimeout(() => rpl.remove(), 620);
  });
});

/* 16. AVATAR PARALLAX */
const av = document.querySelector(".avatar-wrap");
if (av) {
  document.addEventListener("mousemove", (e) => {
    av.style.transform = `translate(${((e.clientX - innerWidth / 2) / innerWidth) * 10}px,${((e.clientY - innerHeight / 2) / innerHeight) * 6}px)`;
  });
}

/* 17. VISITOR COUNT */
async function recordVisit() {
  const el = document.getElementById("visitor-count");
  try {
    const res = await fetch("/api/visit", { method: "POST" });
    const data = await res.json();
    if (data?.success && el) el.textContent = String(data.count);
  } catch {}
}
recordVisit();

