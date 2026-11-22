(function () {
  "use strict";

  const data = window.WISHLIST || (typeof WISHLIST !== "undefined" ? WISHLIST : null);
  if (!data) {
    document.getElementById("wishes").textContent = "Could not load wishlist.js";
    return;
  }

  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const PRIORITY_LABEL = { high: "★ Top wish", medium: "Would love", low: "Nice to have" };

  // ---------- Header ----------
  const title = data.title || (data.owner ? `${data.owner}'s Christmas Wishlist` : "Christmas Wishlist");
  document.getElementById("title").textContent = title;
  document.title = `🎄 ${title}`;
  document.getElementById("message").textContent = data.message || "";

  // ---------- Helpers ----------
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const child of children) {
      if (child != null && child !== false) node.append(child);
    }
    return node;
  }

  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return ["http:", "https:"].includes(u.protocol) || u.origin === location.origin ? u.href : null;
    } catch {
      return null;
    }
  }

  // ---------- Wishes ----------
  const wishes = (data.wishes || [])
    .map((w, i) => ({ ...w, priority: PRIORITY_ORDER[w.priority] != null ? w.priority : "medium", _i: i }))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a._i - b._i);

  const list = document.getElementById("wishes");
  const empty = document.getElementById("empty");

  function card(w) {
    const link = w.link && safeUrl(w.link);
    const img = w.image && safeUrl(w.image);

    return el("li", { className: "wish" },
      img && el("img", { src: img, alt: w.name, loading: "lazy" }),
      el("div", { className: "body" },
        el("div", { className: "meta" },
          el("span", { className: `tag ${w.priority}`, textContent: PRIORITY_LABEL[w.priority] }),
          w.category && el("span", { className: "tag", textContent: w.category }),
        ),
        el("h2", { textContent: w.name }),
        w.description && el("p", { textContent: w.description }),
        el("div", { className: "footer" },
          el("span", { className: "price", textContent: w.price || "" }),
          link && el("a", { className: "buy", href: link, target: "_blank", rel: "noopener noreferrer", textContent: "View 🎁" }),
        ),
      ),
    );
  }

  function render(filter) {
    const shown = filter === "All" ? wishes : wishes.filter((w) => w.category === filter);
    list.replaceChildren(...shown.map(card));
    empty.hidden = shown.length > 0;
  }

  // ---------- Filters ----------
  const categories = [...new Set(wishes.map((w) => w.category).filter(Boolean))];
  const filters = document.getElementById("filters");
  if (categories.length > 1) {
    for (const cat of ["All", ...categories]) {
      const btn = el("button", { type: "button", textContent: cat });
      btn.setAttribute("aria-pressed", cat === "All");
      btn.addEventListener("click", () => {
        filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
        render(cat);
      });
      filters.append(btn);
    }
  }
  render("All");

  // ---------- Countdown ----------
  const countdown = document.getElementById("countdown");

  function tick() {
    const now = new Date();
    const year = now.getMonth() === 11 && now.getDate() > 26 ? now.getFullYear() + 1 : now.getFullYear();
    const eve = new Date(year, 11, 24, 18, 0, 0); // Christmas Eve, 6 pm
    const diff = eve - now;

    if (diff <= 0) {
      countdown.replaceChildren(el("span", { className: "merry", textContent: "🎄 Merry Christmas! 🎄" }));
      return;
    }

    const parts = [
      ["days", Math.floor(diff / 864e5)],
      ["hours", Math.floor(diff / 36e5) % 24],
      ["min", Math.floor(diff / 6e4) % 60],
      ["sec", Math.floor(diff / 1e3) % 60],
    ];
    countdown.replaceChildren(...parts.map(([label, n]) =>
      el("div", { className: "unit" },
        el("span", { className: "num", textContent: String(n).padStart(2, "0") }),
        el("span", { className: "label", textContent: label }),
      ),
    ));
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Snow ----------
  const canvas = document.getElementById("snow");
  const ctx = canvas.getContext("2d");
  if (!ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let flakes = [];
  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    const count = Math.min(160, Math.floor(innerWidth / 8));
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (Math.random() * 2 + 1) * devicePixelRatio,
      s: (Math.random() * 0.6 + 0.3) * devicePixelRatio,
      d: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    for (const f of flakes) {
      f.d += 0.01;
      f.y += f.s;
      f.x += Math.sin(f.d) * 0.4 * devicePixelRatio;
      if (f.y > canvas.height) { f.y = -f.r; f.x = Math.random() * canvas.width; }
      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    }
    ctx.fill();
    requestAnimationFrame(draw);
  }

  addEventListener("resize", resize);
  resize();
  draw();
})();
