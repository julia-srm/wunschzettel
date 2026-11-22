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

  // ---------- Floating decorations ----------
  const COKE_ZERO =
    '<svg viewBox="0 0 40 70" aria-hidden="true"><rect x="6" y="2" width="28" height="7" rx="3" fill="#cfcfcf"/>' +
    '<rect x="4" y="6" width="32" height="58" rx="7" fill="#151515"/><rect x="6" y="61" width="28" height="7" rx="3" fill="#bdbdbd"/>' +
    '<path d="M4 28 Q20 21 36 28 V37 Q20 30 4 37Z" fill="#e4002b"/>' +
    '<text x="20" y="52" font-family="Arial,sans-serif" font-weight="900" font-size="9" fill="#fff" text-anchor="middle">ZERO</text>' +
    '<rect x="9" y="10" width="3" height="48" rx="1.5" fill="#fff" opacity=".18"/></svg>';

  const DECOS = [
    { e: "☕", top: 8, left: 3, size: 46, r: -10 },
    { e: "🎀", top: 6, left: 91, size: 44, r: 12 },
    { e: "🥐", top: 30, left: 94, size: 42, r: 8 },
    { svg: COKE_ZERO, top: 40, left: 2, size: 34, r: -14 },
    { e: "🕯️", top: 58, left: 95, size: 40, r: 0 },
    { e: "📚", top: 70, left: 3, size: 42, r: 6 },
    { e: "🎨", top: 85, left: 92, size: 42, r: -8 },
    { e: "💍", top: 90, left: 6, size: 36, r: 10 },
    { e: "🏺", top: 18, left: 47, size: 30, r: -6 },
    { e: "🎀", top: 52, left: 5, size: 30, r: -20 },
    { svg: COKE_ZERO, top: 76, left: 96, size: 28, r: 14 },
    { e: "☕", top: 96, left: 50, size: 30, r: 10 },
  ];

  const deco = $("deco");
  DECOS.forEach((d, i) => {
    const node = el("span");
    if (d.svg) node.innerHTML = d.svg;
    else node.textContent = d.e;
    node.style.cssText = `top:${d.top}%;left:${d.left}%;font-size:${d.size}px;--r:${d.r}deg;animation-delay:${-i * 0.7}s`;
    deco.append(node);
  });
  for (let i = 0; i < 9; i++) {
    const s = 12 + Math.random() * 26;
    const b = el("span", { className: "bubble" });
    b.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;top:${100 + Math.random() * 10}%;animation-delay:${-Math.random() * 14}s;animation-duration:${12 + Math.random() * 8}s`;
    deco.append(b);
  }

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
      ctx.shadowColor = "rgba(224, 51, 127, 0.45)";
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
    familie: { label: "Familie", greeting: "Hallo liebe Familie! 🥹" },
    freundin: { label: "Freund:in", greeting: "Hey Bestie! 💅" },
    partner: { label: "Partner:in", greeting: "Hallo Schatz! 😘" },
    kolleg: { label: "Kolleg:in", greeting: "Hallo liebe:r Kolleg:in! 📎" },
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
        { value: "kolleg", emoji: "💼", label: "Kolleg:in", reaction: "Wie aufmerksam! Das gibt Bonuspunkte im Büro. 📎" },
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
      "Daneben ist auch vorbei. 🙃",
      "Da draußen gibt's nichts zu sehen. Hier drin schon. 👀",
      "Netter Versuch, Schätzchen. 💅",
      "Der Weihnachtsmann sieht alles. Auch DAS. 🎅",
      "Keine Abkürzungen! Selbst Rentiere fliegen die ganze Strecke. 🦌",
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
      "Ich hab den ganzen Abend Zeit. Und Coke Zero. 🥤",
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
          el("h2", { id: "quiz-title", textContent: "Halt! Geschenk-Kontrolle!" }),
          el("p", {
            className: "quiz-sub",
            textContent: `Bevor du ${OWNER}s Wunschzettel sehen darfst, musst du drei kurze Fragen beantworten. Keine Ausreden, keine Abkürzungen. 💅`,
          }),
          el("div", { className: "quiz-nav" },
            el("button", { className: "btn btn-primary", type: "button", textContent: "Na gut, los geht's 🎀", onclick: () => go(0) }),
          ),
        ),
      );
      body.querySelector("button").focus();
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
    options[0].focus();
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
    }, 500);
    document.body.classList.remove("quiz-open");
    showList();
  }

  function startQuiz() {
    answers = {};
    attempts = 0;
    step = -1;
    quizActive = true;
    writeStore("wz-quiz", null);
    $("main").hidden = true;
    $("footer").hidden = true;
    quiz.hidden = false;
    document.body.classList.add("quiz-open");
    window.scrollTo({ top: 0 });
    renderStep();
  }

  // No escaping the quiz 💅
  quiz.addEventListener("click", (e) => {
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

    return el("li", { className: "wish" },
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
        : [el("li", { className: "empty-note", textContent: "Hmm, in diesem Bereich und Budget ist gerade nichts dabei. 🥲 Aber weiter unten gibt's noch mehr – oder tut euch zu zweit zusammen! 👯" })]),
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
    document.body.classList.remove("quiz-open");
    showList();
  } else {
    startQuiz();
  }
})();
