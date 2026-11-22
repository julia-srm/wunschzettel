(function () {
  "use strict";

  const data = typeof WISHLIST !== "undefined" ? WISHLIST : null;
  if (!data) {
    document.body.textContent = "wishlist.js konnte nicht geladen werden.";
    return;
  }

  const OWNER = data.owner || "mir";
  const $ = (id) => document.getElementById(id);

  // ---------- Helpers ----------
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key === "role" || key.startsWith("aria-") || key.startsWith("data-")) node.setAttribute(key, value);
      else node[key] = value;
    }
    for (const child of children) {
      if (child != null && child !== false) node.append(child);
    }
    return node;
  }

  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch {
      return null;
    }
  }

  const SHOP_NAMES = { asos: "ASOS", zara: "Zara", oysho: "Oysho", amazon: "Amazon", thalia: "Thalia" };
  function shopName(url) {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const key = host.split(".")[0];
    return SHOP_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  function readStore(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode etc. – ignore */
    }
  }

  // ---------- Header ----------
  $("title").textContent = data.title || `${OWNER}s Wunschzettel`;
  document.title = `🎀 ${data.title || "Wunschzettel"}`;
  $("message").textContent = data.message || "";
  $("year").textContent = new Date().getFullYear();

  // ---------- Countdown ----------
  function tick() {
    const now = new Date();
    const afterXmas = now.getMonth() === 11 && now.getDate() > 26;
    const eve = new Date(now.getFullYear() + (afterXmas ? 1 : 0), 11, 24, 18, 0, 0);
    const diff = eve - now;
    const box = $("countdown");

    if (diff <= 0) {
      box.replaceChildren(el("span", { className: "merry", textContent: "🎄 Frohe Weihnachten! 🎄" }));
      return;
    }
    const parts = [
      ["Tage", Math.floor(diff / 864e5)],
      ["Std", Math.floor(diff / 36e5) % 24],
      ["Min", Math.floor(diff / 6e4) % 60],
      ["Sek", Math.floor(diff / 1e3) % 60],
    ];
    box.replaceChildren(
      ...parts.map(([label, n]) =>
        el("div", { className: "unit" },
          el("span", { className: "num", textContent: String(n).padStart(2, "0") }),
          el("span", { className: "label", textContent: label }),
        ),
      ),
    );
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Night sky: twinkling stars ----------
  (function stars() {
    const sky = $("sky");
    const count = Math.min(160, Math.floor((innerWidth * innerHeight) / 9000));
    for (let i = 0; i < count; i++) {
      const s = Math.random() < 0.85 ? 1 + Math.random() * 1.5 : 2.5 + Math.random();
      const star = el("span", { className: "star" });
      star.style.cssText =
        `width:${s}px;height:${s}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
        `--d:${2 + Math.random() * 4}s;--delay:${-Math.random() * 6}s`;
      sky.append(star);
    }
    for (let i = 0; i < 14; i++) {
      const sp = el("span", { className: "sparkle", textContent: "✦" });
      sp.style.cssText =
        `font-size:${8 + Math.random() * 12}px;left:${Math.random() * 100}%;top:${Math.random() * 75}%;` +
        `--d:${3 + Math.random() * 4}s;--delay:${-Math.random() * 6}s`;
      sky.append(sp);
    }
  })();

  // ---------- Realistic Christmas trees (procedurally drawn) ----------
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawTree(wrap, seed) {
    const canvas = wrap.querySelector("canvas");
    const box = wrap.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (canvas.width = Math.round(box.width * dpr));
    const H = (canvas.height = Math.round(box.height * dpr));
    const ctx = canvas.getContext("2d");
    const rand = mulberry32(seed);
    const r = (a, b) => a + rand() * (b - a);

    wrap.querySelectorAll(".light, .tree-star-glow").forEach((n) => n.remove());

    const cx = W / 2;
    const ground = H * 0.93;
    const bottom = H * 0.84;
    const treeH = Math.min(bottom * 0.9, (W * 0.95) / 0.62);
    const top = bottom - treeH;
    const baseW = treeH * 0.62;
    const s0 = treeH / 700; // scale factor

    const TIERS = 7;
    const halfW = (t) => {
      const f = (t * TIERS) % 1;
      return (baseW / 2) * (0.06 + 0.94 * t) * (0.74 + 0.26 * Math.pow(f, 0.7));
    };

    // Trunk
    const trunkW = baseW * 0.075;
    const tg = ctx.createLinearGradient(cx - trunkW, 0, cx + trunkW, 0);
    tg.addColorStop(0, "#2b1709");
    tg.addColorStop(0.5, "#5a3518");
    tg.addColorStop(1, "#21110a");
    ctx.fillStyle = tg;
    ctx.fillRect(cx - trunkW / 2, bottom - treeH * 0.15, trunkW, ground - bottom + treeH * 0.15);

    // Dark silhouette so no gaps show through
    ctx.fillStyle = "#06190f";
    ctx.beginPath();
    ctx.moveTo(cx, top + treeH * 0.02);
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      ctx.lineTo(cx + halfW(t) * 0.82, top + t * treeH);
    }
    for (let i = 60; i >= 0; i--) {
      const t = i / 60;
      ctx.lineTo(cx - halfW(t) * 0.82, top + t * treeH);
    }
    ctx.fill();

    // Needles, grouped into colour buckets per layer
    const BUCKETS = 14;
    const bucketColor = (b, alpha = 1) => {
      const k = b / (BUCKETS - 1);
      const hue = 150 - k * 22;
      const sat = 38 + k * 22;
      const light = 9 + k * 30;
      return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
    };

    ctx.lineCap = "round";
    const LAYERS = 110;
    for (let i = 0; i <= LAYERS; i++) {
      const t = i / LAYERS;
      const y0 = top + t * treeH;
      const w = halfW(t);
      const paths = Array.from({ length: BUCKETS }, () => new Path2D());
      const frost = new Path2D();
      const twigs = new Path2D();
      const sprays = 3 + Math.round((w / (baseW / 2)) * 16);

      for (let k = 0; k < sprays; k++) {
        // Edge branches reach outward, inner ones fill the front of the tree
        const edge = k < 2;
        const dir = edge ? (k === 0 ? -1 : 1) : rand() < 0.5 ? -1 : 1;
        const startX = edge ? cx + dir * w * r(0.2, 0.45) : cx + r(-0.85, 0.85) * w;
        const reach = edge ? w * r(0.6, 0.8) : w * r(0.18, 0.4) + 8 * s0;
        const endX = Math.max(cx - w * 1.05, Math.min(cx + w * 1.05, startX + dir * reach));
        const len = Math.abs(endX - startX);
        const droop = len * r(0.18, 0.42);
        const sy = y0 + r(-4, 4) * s0;
        const ey = sy + droop;
        const ctrlX = (startX + endX) / 2;
        const ctrlY = sy - droop * 0.15;

        twigs.moveTo(startX, sy);
        twigs.quadraticCurveTo(ctrlX, ctrlY, endX, ey);

        const outward = Math.abs(endX - cx) / (w + 1); // 0 = trunk, 1 = edge
        const needles = Math.max(6, Math.round(len / (2.1 * s0)));
        for (let n = 0; n < needles; n++) {
          const u = n / needles;
          const px = (1 - u) * (1 - u) * startX + 2 * (1 - u) * u * ctrlX + u * u * endX;
          const py = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * ctrlY + u * u * ey;
          const ang = Math.atan2(ey - sy, endX - startX);
          // light from upper left, lighter at tips and edges, darker deep inside & low
          let shade = 0.25 + 0.45 * u * outward + 0.25 * rand() - 0.2 * t + (dir < 0 ? 0.08 : -0.04);
          if (!edge) shade -= 0.12;
          const b = Math.max(0, Math.min(BUCKETS - 1, Math.round(shade * (BUCKETS - 1))));
          for (const side of [-1, 1]) {
            const a = ang + side * r(0.55, 1.05) + 0.25;
            const nl = r(5, 10) * s0 * (0.7 + 0.5 * (1 - u));
            paths[b].moveTo(px, py);
            paths[b].lineTo(px + Math.cos(a) * nl, py + Math.sin(a) * nl);
          }
          if (u > 0.4 && rand() < 0.07 * outward) {
            frost.moveTo(px - 3 * s0, py - 1 * s0);
            frost.lineTo(px + 3 * s0, py - 2 * s0);
          }
        }
      }

      ctx.strokeStyle = "#1a0f08";
      ctx.lineWidth = 1.6 * s0 * dpr;
      ctx.stroke(twigs);
      ctx.lineWidth = Math.max(1, 1.25 * s0 * dpr);
      paths.forEach((p, b) => {
        ctx.strokeStyle = bucketColor(b);
        ctx.stroke(p);
      });
      ctx.strokeStyle = "rgba(235, 245, 255, 0.55)";
      ctx.lineWidth = Math.max(1, 1.8 * s0 * dpr);
      ctx.stroke(frost);
    }

    // Helper: random point inside the cone
    const pointIn = (tMin, tMax, spread) => {
      const t = r(tMin, tMax);
      return { t, x: cx + r(-spread, spread) * halfW(t), y: top + t * treeH };
    };

    // Gold beaded garlands
    ctx.fillStyle = "#f3cf6b";
    for (let g = 1; g <= 5; g++) {
      const t0 = 0.12 + g * 0.16;
      const t1 = t0 + 0.1;
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const t = t0 + (t1 - t0) * u + Math.sin(u * Math.PI) * 0.05;
        const x = cx + (u * 2 - 1) * halfW(t) * 0.85;
        const y = top + t * treeH;
        ctx.beginPath();
        ctx.arc(x, y, 1.6 * s0 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Baubles
    const COLORS = [
      ["#ff9ec4", "#c2376e"],
      ["#ffe39a", "#b07d16"],
      ["#ff7d86", "#9c1527"],
      ["#f3f6ff", "#8a93ad"],
      ["#ffc9de", "#d0638f"],
    ];
    for (let i = 0; i < 22; i++) {
      const p = pointIn(0.12, 0.97, 0.82);
      const rad = r(8, 13) * s0 * (0.7 + p.t * 0.5);
      const [c1, c2] = COLORS[i % COLORS.length];
      ctx.strokeStyle = "rgba(240, 220, 160, 0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - rad * 2);
      ctx.lineTo(p.x, p.y - rad);
      ctx.stroke();
      const g = ctx.createRadialGradient(p.x - rad * 0.35, p.y - rad * 0.4, rad * 0.1, p.x, p.y, rad);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.18, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a54a";
      ctx.fillRect(p.x - rad * 0.3, p.y - rad * 1.15, rad * 0.6, rad * 0.3);
    }

    // Star on top
    const starR = 26 * s0;
    const sy = top - starR * 0.35;
    ctx.save();
    ctx.shadowColor = "rgba(255, 230, 140, 0.9)";
    ctx.shadowBlur = 25 * s0;
    const sg = ctx.createRadialGradient(cx - starR * 0.2, sy - starR * 0.3, 1, cx, sy, starR);
    sg.addColorStop(0, "#fffbe0");
    sg.addColorStop(0.5, "#f7d264");
    sg.addColorStop(1, "#c8901e");
    ctx.fillStyle = sg;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? starR * 0.42 : starR;
      ctx.lineTo(cx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Snow on the ground (soft elliptical mound)
    const rx = W * 0.47;
    const ry = H * 0.075;
    ctx.save();
    ctx.translate(cx, ground + ry * 0.55);
    ctx.scale(1, ry / rx);
    const snowG = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    snowG.addColorStop(0, "rgba(255,255,255,0.97)");
    snowG.addColorStop(0.65, "rgba(232,240,255,0.9)");
    snowG.addColorStop(1, "rgba(232,240,255,0)");
    ctx.fillStyle = snowG;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Presents under the tree
    const PRESENTS = [
      { dx: -0.32, w: 0.24, h: 0.13, box: ["#ff9ec4", "#d0517f"], rib: "#fff" },
      { dx: 0.02, w: 0.17, h: 0.09, box: ["#fff2c4", "#d9a93a"], rib: "#c2376e" },
      { dx: 0.27, w: 0.22, h: 0.16, box: ["#ffffff", "#c9cde0"], rib: "#e27a9f" },
      { dx: -0.1, w: 0.13, h: 0.07, box: ["#a8324f", "#5e1328"], rib: "#f6d77f" },
    ];
    for (const p of PRESENTS) {
      const pw = baseW * p.w;
      const ph = baseW * p.h;
      const x = cx + baseW * p.dx - pw / 2;
      const y = ground - ph + r(0, 4) * s0;
      const g = ctx.createLinearGradient(x, y, x + pw, y + ph);
      g.addColorStop(0, p.box[0]);
      g.addColorStop(1, p.box[1]);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, pw, ph);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(x + pw * 0.7, y, pw * 0.3, ph); // side shading
      ctx.fillStyle = p.rib;
      ctx.fillRect(x + pw * 0.44, y, pw * 0.12, ph);
      ctx.fillRect(x, y + ph * 0.42, pw, ph * 0.14);
      // bow
      ctx.beginPath();
      ctx.ellipse(x + pw * 0.5 - pw * 0.1, y - ph * 0.06, pw * 0.12, ph * 0.12, -0.5, 0, Math.PI * 2);
      ctx.ellipse(x + pw * 0.5 + pw * 0.1, y - ph * 0.06, pw * 0.12, ph * 0.12, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Twinkling fairy lights (DOM so they can glow & animate)
    const toPct = (x, y) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;`;
    for (let i = 0; i < 46; i++) {
      const p = pointIn(0.06, 0.97, 0.9);
      const warm = rand() < 0.75;
      const light = el("span", { className: "light" });
      light.style.cssText =
        toPct(p.x, p.y) +
        (warm ? "" : "--c:#ffc2dc;--g:rgba(255,150,200,.5);") +
        `--d:${1.4 + rand() * 2}s;--delay:${-rand() * 3}s`;
      wrap.append(light);
    }
    const glow = el("span", { className: "tree-star-glow" });
    glow.style.cssText = toPct(cx, sy);
    wrap.append(glow);
  }

  const trees = [...document.querySelectorAll(".tree-wrap")];
  const paintTrees = () => trees.forEach((t, i) => drawTree(t, 1225 + i * 77));
  let treeTimer;
  addEventListener("resize", () => {
    clearTimeout(treeTimer);
    treeTimer = setTimeout(paintTrees, 200);
  });
  paintTrees();

  // ---------- Snow ----------
  (function snow() {
    const canvas = $("snow");
    const ctx = canvas.getContext("2d");
    if (!ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let flakes = [];
    let dpr = 1;
    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      const count = Math.min(140, Math.floor(innerWidth / 9));
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 2.4 + 1.2) * dpr,
        s: (Math.random() * 0.7 + 0.35) * dpr,
        d: Math.random() * Math.PI * 2,
        star: Math.random() < 0.15,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#fff";
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 4 * dpr;
      ctx.lineWidth = 1.2 * dpr;
      ctx.lineCap = "round";

      const dots = new Path2D();
      const stars = new Path2D();
      for (const f of flakes) {
        f.d += 0.01;
        f.y += f.s;
        f.x += Math.sin(f.d) * 0.4 * dpr;
        if (f.y > canvas.height + 10) {
          f.y = -10;
          f.x = Math.random() * canvas.width;
        }
        if (f.star) {
          const R = f.r * 2.6;
          for (let k = 0; k < 3; k++) {
            const a = f.d + (k * Math.PI) / 3;
            stars.moveTo(f.x - Math.cos(a) * R, f.y - Math.sin(a) * R);
            stars.lineTo(f.x + Math.cos(a) * R, f.y + Math.sin(a) * R);
          }
        } else {
          dots.moveTo(f.x + f.r, f.y);
          dots.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        }
      }
      ctx.fill(dots);
      ctx.stroke(stars);
      requestAnimationFrame(draw);
    }

    addEventListener("resize", resize);
    resize();
    draw();
  })();

  // ---------- Quiz ----------
  const BUDGETS = {
    klein: { max: 20, label: "bis 20 €" },
    mittel: { max: 40, label: "20–40 €" },
    gross: { max: 70, label: "40–70 €" },
    santa: { max: Infinity, label: "70 € +" },
  };

  const RELATIONS = {
    familie: { label: "Familie", greeting: "Hallo liebste Familie! 🥹" },
    freundin: { label: "Freund:in", greeting: "Hey Bestie! 💅" },
    partner: { label: "Partner:in", greeting: "Hallo Schatz! 😘" },
    santa: { label: "Weihnachtsmann", greeting: "Lieber Weihnachtsmann! 🎅" },
  };

  const STEPS = [
    {
      id: "relation",
      kicker: "Frage 1 von 3",
      q: "Erstmal: Wer bist du eigentlich?",
      sub: "Rein für die Statistik. Und aus purer Neugier. 👀",
      options: [
        { value: "familie", emoji: "👨‍👩‍👧", label: "Familie", reaction: "Ahh, die Lieblingsverwandtschaft! 🥹" },
        { value: "freundin", emoji: "👯", label: "Freund:in", reaction: "Bestie-Alarm! Du kennst meinen Geschmack eh. 💅" },
        { value: "partner", emoji: "💘", label: "Partner:in", reaction: "Oh là là. Kein Druck. (Doch, ein bisschen.) 😘" },
        { value: "santa", emoji: "🎅", label: "Der Weihnachtsmann persönlich", reaction: "Endlich! Ich war dieses Jahr SEHR brav. Fast. 😇" },
      ],
    },
    {
      id: "budget",
      kicker: "Frage 2 von 3",
      q: "Wie tief greifst du in die Tasche?",
      sub: "Keine Sorge, ich verrate es niemandem. Vielleicht. 🤫",
      options: [
        { value: "klein", emoji: "🪙", label: "Bis 20 €", hint: "Kleine Freude", reaction: "Kleine Geschenke, große Liebe. 💗" },
        { value: "mittel", emoji: "💸", label: "20–40 €", hint: "Der Sweet Spot", reaction: "Der Sweet Spot! Wie ein Croissant: perfekt. 🥐" },
        { value: "gross", emoji: "💰", label: "40–70 €", hint: "Großzügig", reaction: "Wow, jetzt wird's spannend! 🤩" },
        { value: "santa", emoji: "👑", label: "Mehr als 70 €", hint: "Weihnachtsmann-Modus", reaction: "Ich … brauche kurz einen Moment. 🥲✨" },
      ],
    },
    {
      id: "area",
      kicker: "Frage 3 von 3",
      q: "Wofür schlägt dein Geschenk-Herz?",
      sub: "Such dir einen Bereich aus – oder lass dich überraschen.",
      options: [
        ...(data.bereiche || []).map((b) => ({ value: b.id, emoji: b.emoji, label: b.label, reaction: b.reaction })),
        { value: "alles", emoji: "🎲", label: "Überrasch mich!", hint: "Zeig mir alles", reaction: "Mutig. Ich mag das. 🎲" },
      ],
    },
  ];

  const SASS = {
    backdrop: [
      "Erste Frage geschafft! Weiter geht's. 💅",
      "Weiter gehts! Ich bin gespannt. 👀",
      "Fast geschafft! Nur noch zwei Fragen. 🥹",
      "Finale oho! Nur noch eine Frage. 😌",
      "Yippie! Du hast es fast geschafft. 🎀",
    ],
    escape: [
      "Escape? Hier gibt's kein Entkommen. Nur Weihnachten. 🎄",
      "Die Esc-Taste ist über die Feiertage im Urlaub. 🏝️",
    ],
    close: [
      "Schließen? Süß. Nein. 😌",
      "Der Knopf ist nur Deko. Wie Lametta. ✨",
      "Ha! Der war nur da, um deine Geduld zu testen. 🫠",
    ],
    noAnswer: [
      "Erst antworten, dann weiter. So läuft das hier. 💅",
      "Ohne Antwort kein Wunschzettel. Regeln sind Regeln. 📜",
      "Ich warte. Ich hab Kekse. Ich hab Zeit. 🍪",
    ],
    angry: [
      "Okay, langsam wird's peinlich. Einfach antworten! 😤",
      `Soll ich ${OWNER} anrufen? Ich ruf ${OWNER} an. 📞`,
      "Glückwunsch, du stehst jetzt auf der Unartig-Liste. 📝😈",
    ],
  };

  const quiz = $("quiz");
  const card = $("quiz-card");
  const body = $("quiz-body");
  const sassBox = $("sass");
  let step = -1;
  let answers = {};
  let attempts = 0;
  let quizActive = false;
  const sassIndex = {};
  let sassTimer;

  function sass(kind) {
    attempts++;
    const pool = attempts >= 6 ? SASS.angry : SASS[kind];
    const key = attempts >= 6 ? "angry" : kind;
    sassIndex[key] = ((sassIndex[key] ?? -1) + 1) % pool.length;
    sassBox.textContent = pool[sassIndex[key]];
    sassBox.classList.add("show");
    card.classList.remove("shake");
    void card.offsetWidth; // restart animation
    card.classList.add("shake");
    clearTimeout(sassTimer);
    sassTimer = setTimeout(() => sassBox.classList.remove("show"), 2600);
  }

  function progress(current) {
    return el("div", { className: "quiz-progress", "aria-hidden": "true" },
      ...STEPS.map((_, i) => el("span", { className: i <= current ? "done" : "" })),
    );
  }

  function renderStep() {
    if (step === -1) {
      body.replaceChildren(
        el("div", { className: "quiz-step" },
          el("span", { className: "big-emoji", textContent: "✋" }),
          el("h2", { id: "quiz-title", textContent: "Stop! Geschenk-Quiz!" }),
          el("p", {
            className: "quiz-sub",
            textContent: `Bevor du ${OWNER}'s Wunschzettel sehen darfst, musst du drei kurze Fragen beantworten. Keine Ausreden, keine Abkürzungen. 💅`,
          }),
          el("div", { className: "quiz-nav" },
            el("button", { className: "btn btn-primary", type: "button", textContent: "Na gut, los geht's 🎀", onclick: () => go(0) }),
          ),
        ),
      );
      body.querySelector("button").focus({ preventScroll: true });
      return;
    }

    const s = STEPS[step];
    const reaction = el("p", { className: "reaction", "aria-live": "polite" });
    const current = s.options.find((o) => o.value === answers[s.id]);
    if (current) reaction.textContent = current.reaction;

    const options = s.options.map((o) =>
      el("button",
        {
          type: "button",
          className: "option",
          "aria-pressed": String(answers[s.id] === o.value),
          onclick: (e) => {
            answers[s.id] = o.value;
            options.forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
            reaction.textContent = o.reaction;
          },
        },
        el("span", { className: "o-emoji", textContent: o.emoji }),
        el("span", {},
          el("span", { className: "o-label", textContent: o.label }),
          o.hint && el("span", { className: "o-hint", textContent: o.hint }),
        ),
      ),
    );

    body.replaceChildren(
      el("div", { className: "quiz-step" },
        progress(step),
        el("p", { className: "quiz-kicker", textContent: s.kicker }),
        el("h2", { id: "quiz-title", textContent: s.q }),
        el("p", { className: "quiz-sub", textContent: s.sub }),
        el("div", { className: "options", role: "group" }, ...options),
        reaction,
        el("div", { className: "quiz-nav" },
          step > 0 && el("button", { className: "btn btn-ghost", type: "button", textContent: "← Zurück", onclick: () => go(step - 1) }),
          el("button", {
            className: "btn btn-primary",
            type: "button",
            textContent: step === STEPS.length - 1 ? "Zeig mir die Wünsche! 🎁" : "Weiter →",
            onclick: () => (answers[s.id] ? go(step + 1) : sass("noAnswer")),
          }),
        ),
      ),
    );
    options[0].focus({ preventScroll: true });
  }

  function go(next) {
    step = next;
    if (step >= STEPS.length) loading();
    else renderStep();
  }

  function loading() {
    const lines = [
      "Croissants zählen … 🥐",
      "Coke Zero kalt stellen … 🥤",
      "Schleifen binden … 🎀",
      "Geschenk-Kompatibilität: 100 % 💗",
    ];
    const list = el("ul", { className: "loading-list" });
    const fill = el("span");
    body.replaceChildren(
      el("div", { className: "quiz-step" },
        el("span", { className: "big-emoji", textContent: "🔮" }),
        el("h2", { id: "quiz-title", textContent: "Ich analysiere …" }),
        list,
        el("div", { className: "bar" }, fill),
      ),
    );
    requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = "100%")));
    lines.forEach((text, i) => setTimeout(() => list.append(el("li", { textContent: text })), i * 650));
    setTimeout(finishQuiz, lines.length * 650 + 500);
  }

  function finishQuiz() {
    writeStore("wz-quiz", answers);
    quizActive = false;
    quiz.classList.add("leaving");
    setTimeout(() => {
      quiz.hidden = true;
      quiz.classList.remove("leaving");
      showList();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 450);
  }

  function startQuiz() {
    answers = {};
    attempts = 0;
    step = -1;
    writeStore("wz-quiz", null);
    $("main").hidden = true;
    $("footer").hidden = true;
    quiz.hidden = false;
    window.scrollTo({ top: 0 });
    renderStep();
    // activate after the current click has finished bubbling
    setTimeout(() => (quizActive = true));
  }

  // No escaping the quiz 💅 – clicking anywhere outside the card gets a sassy reply
  document.addEventListener("click", (e) => {
    if (quizActive && !card.contains(e.target)) sass("backdrop");
  });
  $("fake-close").addEventListener("click", () => sass("close"));
  document.addEventListener("keydown", (e) => {
    if (quizActive && e.key === "Escape") {
      e.preventDefault();
      sass("escape");
    }
  });

  // ---------- Wishlist ----------
  function matches(w) {
    const budget = BUDGETS[answers.budget] || BUDGETS.santa;
    const areaOk = !answers.area || answers.area === "alles" || w.bereich === answers.area;
    const min = Array.isArray(w.preis) ? w.preis[0] : 0;
    return areaOk && min <= budget.max;
  }

  function priceLabel(p) {
    if (!Array.isArray(p)) return p ? String(p) : "";
    return p[0] === p[1] || p[1] == null ? `ca. ${p[0]} €` : `ca. ${p[0]}–${p[1]} €`;
  }

  const areaLabel = (id) => (data.bereiche || []).find((b) => b.id === id)?.label;

  function wishCard(w) {
    const links = (w.links || []).map(safeUrl).filter(Boolean);

    return el("li", { className: "wish card" },
      el("div", { className: "wish-top", style: `--tint:${w.farbe || "var(--blush)"}` },
        el("span", { className: "wish-emoji", textContent: w.emoji || "🎁", "aria-hidden": "true" }),
        w.preis && el("span", { className: "price", textContent: priceLabel(w.preis) }),
      ),
      el("div", { className: "wish-body" },
        areaLabel(w.bereich) && el("span", { className: "tag", textContent: areaLabel(w.bereich) }),
        el("h3", { textContent: w.name }),
        w.beschreibung && el("p", { textContent: w.beschreibung }),
        links.length > 0 &&
          el("div", { className: "links" },
            el("span", { textContent: "Inspiration:" }),
            ...links.map((url, i) =>
              el("a", {
                href: url,
                target: "_blank",
                rel: "noopener noreferrer",
                textContent: `${shopName(url)}${links.length > 1 ? ` ${i + 1}` : ""} ↗`,
              }),
            ),
          ),
      ),
    );
  }

  function renderList() {
    const wishes = data.wishes || [];
    const matched = wishes.filter(matches);
    const rest = wishes.filter((w) => !matches(w));

    $("match-sub").textContent = matched.length
      ? `${matched.length} ${matched.length === 1 ? "Wunsch passt" : "Wünsche passen"} zu deinem Budget und deinem Bereich.`
      : "";

    $("wishes-match").replaceChildren(
      ...(matched.length
        ? matched.map(wishCard)
        : [el("li", { className: "card empty-note", textContent: "Hmm, in diesem Bereich und Budget ist gerade nichts dabei. 🥲 Aber weiter unten gibt's noch mehr – oder tut euch zu zweit zusammen! 👯" })]),
    );

    $("rest-section").hidden = rest.length === 0;
    const pricier = rest.some((w) => Array.isArray(w.preis) && w.preis[0] > (BUDGETS[answers.budget]?.max ?? Infinity));
    $("rest-sub").textContent = pricier ? "Für die größeren Wünsche könnt ihr auch zusammenlegen. 👯" : "";
    $("wishes-rest").replaceChildren(...rest.map(wishCard));
  }

  function renderResultsBar() {
    const rel = RELATIONS[answers.relation] || { label: "Gast", greeting: "Hallo du! 👋" };
    const budget = BUDGETS[answers.budget];
    const area = answers.area === "alles" ? "Überrasch mich" : areaLabel(answers.area);

    $("results-bar").replaceChildren(
      el("div", {},
        el("h2", { textContent: rel.greeting }),
        el("div", { className: "chips" },
          el("span", { className: "chip", textContent: rel.label }),
          budget && el("span", { className: "chip", textContent: budget.label }),
          area && el("span", { className: "chip", textContent: area }),
        ),
      ),
      el("button", { className: "btn btn-light", type: "button", textContent: "Quiz nochmal ↺", onclick: startQuiz }),
    );
  }

  function showList() {
    renderResultsBar();
    renderList();
    $("main").hidden = false;
    $("footer").hidden = false;
  }

  // ---------- Start ----------
  const saved = readStore("wz-quiz", null);
  if (saved && saved.relation && saved.budget && saved.area) {
    answers = saved;
    quiz.hidden = true;
    showList();
  } else {
    startQuiz();
  }
})();
