// ✏️  Hier bearbeitest du deinen Wunschzettel.
//
// Jeder Wunsch hat:
//   id          (Pflicht)  Eindeutiger Kurzname, nur a-z, 0-9 und "-"
//   name        (Pflicht)  Was du dir wünschst
//   beschreibung            Details, Größe, Farbe …
//   preis                  [von, bis] in Euro, ungefähr – wird fürs Budget im Quiz benutzt
//   bereich                Eine der ids aus "bereiche" unten
//   emoji                  Bild für die Karte
//   farbe                  Hintergrundfarbe der Karte
//   links                  Beispiel-Links zur Inspiration (beliebig viele)

const WISHLIST = {
  owner: "Julia",
  title: "Julias Wunschzettel",
  message:
    "Wie schön, dass du an mich denkst! 💗 Die Links sind nur Beispiele zur Inspiration – du darfst gern kreativ werden.",

  bereiche: [
    { id: "gemuetlich", label: "Gemütlich & Zuhause", emoji: "🏡", reaction: "Kuschel-Expert:in erkannt. 🧦" },
    { id: "sport", label: "Sport & Style", emoji: "🧘‍♀️", reaction: "Sporty Spice! Oysho, here we go. 💪" },
    { id: "buecher", label: "Bücherwurm", emoji: "📚", reaction: "Ah, eine Person von Kultur. 🧐" },
  ],

  wishes: [
    {
      id: "hausschuhe",
      name: "Hausschuhe",
      beschreibung: "Flauschig, kuschelig, gern mit Plateau oder im Sneaker-Look – Hauptsache warme Füße.",
      preis: [25, 40],
      bereich: "gemuetlich",
      emoji: "🥿",
      farbe: "#ffe3ee",
      links: [
        "https://www.asos.com/de/hollister/hollister-flauschige-plateau-hausschuhe-mit-holly-print-in-wei/prd/212119342",
        "https://www.asos.com/de/asos-design/asos-design-zippy-hausschuh-mit-bundchen-und-geschlossener-spitze-in-kastanienbraun-aus-velourslederimitat/prd/210801831",
        "https://www.zara.com/de/de/sneaker-fur-zuhause-mit-stickerei-p12717830.html?v1=557829882",
      ],
    },
    {
      id: "flip-uhr",
      name: "Flip-Uhr",
      beschreibung: "Eine mechanische Klappzahlenuhr – retro, hypnotisch und perfekt fürs Regal.",
      preis: [30, 50],
      bereich: "gemuetlich",
      emoji: "🕰️",
      farbe: "#fff1d6",
      links: ["https://www.amazon.de/dp/B0GK923KJC"],
    },
    {
      id: "oysho-leggings",
      name: "Leggings von Oysho",
      beschreibung: "Gern die Comfortlux-Flarehose – in einer schönen Farbe. 🌸",
      preis: [30, 40],
      bereich: "sport",
      emoji: "🧘‍♀️",
      farbe: "#f3e6ff",
      links: ["https://www.oysho.com/de/comfortlux-flarehose-high-rise-l31796222?colorId=408&pelement=228771402"],
    },
    {
      id: "oysho-hose",
      name: "Weite Hose von Oysho",
      beschreibung: "Bequeme weite Hose aus Modal – in einer schönen Farbe. 🌸",
      preis: [25, 40],
      bereich: "sport",
      emoji: "👖",
      farbe: "#e3f0ff",
      links: ["https://www.oysho.com/de/weite-hose-aus-modal-mit-piping-l36684791?colorId=908&pelement=230161245"],
    },
    {
      id: "oysho-sport-bh",
      name: "Sport-BH von Oysho",
      beschreibung: "Comfortlux mit mittlerem Halt – in einer schönen Farbe. 🌸",
      preis: [20, 30],
      bereich: "sport",
      emoji: "🏋️‍♀️",
      farbe: "#ffe6f0",
      links: ["https://www.oysho.com/de/comfortlux-sportbh-mit-mittlerer-halt-und-korbchen-l32977901?colorId=408&pelement=223465306"],
    },
    {
      id: "oysho-jacke",
      name: "Sportjacke von Oysho",
      beschreibung: "Leichte, warme Funktionsjacke – in einer schönen Farbe. 🌸",
      preis: [45, 60],
      bereich: "sport",
      emoji: "🧥",
      farbe: "#e2f5ec",
      links: [
        "https://www.oysho.com/de/technische-jacke-lightwarm-l36524332?colorId=606&pelement=228657259",
        "https://www.oysho.com/de/funktionsjacke-light-warm-mit-rib-l31645332?colorId=408&pelement=223474788",
      ],
    },
    {
      id: "buch-the-witch",
      name: "„The Witch“ von Freida McFadden",
      beschreibung: "Der nächste Pageturner – Gänsehaut garantiert.",
      preis: [12, 20],
      bereich: "buecher",
      emoji: "🔮",
      farbe: "#ece4ff",
      links: ["https://www.thalia.de/shop/home/artikeldetails/A1079226774"],
    },
    {
      id: "buch-butter",
      name: "„Butter“ von Asako Yuzuki",
      beschreibung: "Der Kult-Roman aus Japan über Essen, Obsession und ein Verbrechen.",
      preis: [14, 25],
      bereich: "buecher",
      emoji: "🧈",
      farbe: "#fff6cc",
      links: ["https://www.thalia.de/shop/home/artikeldetails/A1071580414"],
    },
  ],
};
