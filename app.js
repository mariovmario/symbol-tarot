const majorCards = [
  ["The Fool", ["beginnings", "curiosity", "possibility"]],
  ["The Magician", ["agency", "skill", "focus"]],
  ["The High Priestess", ["intuition", "mystery", "inner knowledge"]],
  ["The Empress", ["nurturing", "abundance", "creativity"]],
  ["The Emperor", ["structure", "leadership", "boundaries"]],
  ["The Hierophant", ["tradition", "learning", "shared values"]],
  ["The Lovers", ["connection", "choice", "alignment"]],
  ["The Chariot", ["direction", "willpower", "momentum"]],
  ["Strength", ["courage", "compassion", "self-control"]],
  ["The Hermit", ["reflection", "guidance", "solitude"]],
  ["Wheel of Fortune", ["change", "cycles", "turning point"]],
  ["Justice", ["fairness", "truth", "accountability"]],
  ["The Hanged Man", ["perspective", "pause", "surrender"]],
  ["Death", ["transition", "release", "renewal"]],
  ["Temperance", ["balance", "integration", "patience"]],
  ["The Devil", ["attachment", "shadow", "freedom"]],
  ["The Tower", ["disruption", "revelation", "rebuilding"]],
  ["The Star", ["hope", "healing", "renewal"]],
  ["The Moon", ["uncertainty", "intuition", "dreams"]],
  ["The Sun", ["clarity", "joy", "vitality"]],
  ["Judgement", ["awakening", "reckoning", "calling"]],
  ["The World", ["completion", "wholeness", "integration"]]
];

const suits = {
  Wands: { element: "fire", themes: ["action", "energy", "creative drive"] },
  Cups: { element: "water", themes: ["emotion", "connection", "intuition"] },
  Swords: { element: "air", themes: ["thought", "truth", "decision"] },
  Pentacles: { element: "earth", themes: ["resources", "work", "security"] }
};

const ranks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const rankThemes = [
  ["beginning", "potential"], ["choice", "balance"], ["growth", "collaboration"], ["stability", "foundation"],
  ["challenge", "change"], ["exchange", "movement"], ["assessment", "strategy"], ["practice", "progress"],
  ["maturity", "resilience"], ["completion", "responsibility"], ["message", "discovery"], ["pursuit", "motion"],
  ["mastery", "nurturing"], ["leadership", "command"]
];

const tarotCards = majorCards.map(function (card, index) {
  return { id: "major-" + index, name: card[0], themes: card[1] };
});

Object.keys(suits).forEach(function (suit) {
  ranks.forEach(function (rank, index) {
    tarotCards.push({
      id: rank.toLowerCase() + "-" + suit.toLowerCase(),
      name: rank + " of " + suit,
      themes: suits[suit].themes.concat(rankThemes[index])
    });
  });
});

const choices = {
  sky: [["new moon", "🌑"], ["crescent moon", "☾"], ["full moon", "🌕"], ["eclipse", "◉"], ["golden sun", "☀"], ["seven stars", "✦"], ["storm cloud", "☁"], ["aurora", "〰"]],
  guide: [["owl", "🦉"], ["raven", "🐦"], ["moth", "🦋"], ["fox", "🦊"], ["wolf", "🐺"], ["serpent", "🐍"], ["deer", "🦌"], ["crane", "🕊"]],
  object: [["key", "🗝"], ["lantern", "🏮"], ["mirror", "🪞"], ["compass", "🧭"], ["cup", "🏆"], ["thread", "🧵"], ["book", "📖"], ["coin", "🪙"]],
  landscape: [["forest path", "Forest Path"], ["mountain pass", "Mountain Pass"], ["stone gate", "Stone Gate"], ["river crossing", "River Crossing"], ["tower", "Tower"], ["garden", "Garden"], ["shoreline", "Shoreline"], ["bridge", "Bridge"]],
  energy: [["wind", "≈"], ["rain", "❈"], ["flame", "♨"], ["water", "≋"], ["roots", "⌇"], ["lightning", "ϟ"], ["mist", "☁"], ["starlight", "✧"]]
};

const usedKey = "symbol-tarot-used-cards";
let currentCard = null;

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function titleCase(text) {
  return text.replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
}

function getUsed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(usedKey) || "[]"));
  } catch (error) {
    return new Set();
  }
}

function saveUsed(used) {
  try {
    localStorage.setItem(usedKey, JSON.stringify(Array.from(used)));
  } catch (error) {
    // The card still works if browser storage is unavailable.
  }
}

function makeCard(topic) {
  const inspiration = choose(tarotCards);
  const symbols = {
    sky: choose(choices.sky),
    guide: choose(choices.guide),
    object: choose(choices.object),
    landscape: choose(choices.landscape),
    energy: choose(choices.energy)
  };
  const id = [inspiration.id, symbols.sky[0], symbols.guide[0], symbols.object[0], symbols.landscape[0], symbols.energy[0]].join("|");
  const theme = choose(inspiration.themes);

  return {
    id: id,
    title: "The " + titleCase(symbols.object[0]) + " of the " + titleCase(symbols.landscape[0]),
    inspiration: inspiration.name,
    theme: theme,
    symbols: symbols,
    prompt: "For " + topic + ", notice the " + symbols.object[0] + " beside the " + symbols.landscape[0] + ". The " + symbols.guide[0] + " beneath the " + symbols.sky[0] + " suggests " + theme + ". What is one grounded next step you can take?"
  };
}

function drawNeverRepeated(topic) {
  const used = getUsed();
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const card = makeCard(topic);
    if (!used.has(card.id)) {
      used.add(card.id);
      saveUsed(used);
      return card;
    }
  }
  return makeCard(topic);
}

function cardBack() {
  const card = document.getElementById("physical-card");
  card.className = "physical-card card-back";
  card.innerHTML = '<span class="card-back-stars">✦ ✧ ✦</span><span class="card-back-moon">☾</span><span class="card-back-stars">✦ ✧ ✦</span>';
}

function showCardFace(cardData) {
  const card = document.getElementById("physical-card");
  const symbols = cardData.symbols;
  card.className = "physical-card card-front";
  card.innerHTML =
    '<span class="card-number">One-of-a-kind symbol card</span>' +
    '<h2 class="card-title">' + cardData.title + '</h2>' +
    '<span class="card-sky" aria-label="' + symbols.sky[0] + '">' + symbols.sky[1] + '</span>' +
    '<span class="card-guide" aria-label="' + symbols.guide[0] + '">' + symbols.guide[1] + '</span>' +
    '<span class="card-object-row"><span aria-label="' + symbols.object[0] + '">' + symbols.object[1] + '</span><span class="card-energy" aria-label="' + symbols.energy[0] + '">' + symbols.energy[1] + '</span></span>' +
    '<p class="card-landscape">' + symbols.landscape[1] + '</p>';
}

function revealReading() {
  if (!currentCard) return;
  const labels = [currentCard.symbols.sky[0], currentCard.symbols.guide[0], currentCard.symbols.object[0], currentCard.symbols.landscape[0], currentCard.symbols.energy[0]];
  const list = labels.map(function (label) { return "<li>" + label + "</li>"; }).join("");
  const reading = document.getElementById("reading-text");
  reading.hidden = false;
  reading.innerHTML = "<h2>Your Reading</h2><ul class=\"symbols\">" + list + "</ul><p><strong>Theme:</strong> " + currentCard.theme + ". " + currentCard.prompt + "</p>";
  document.getElementById("reveal-button").hidden = true;
  document.getElementById("instruction").textContent = "Read the symbols, then reflect on what feels meaningful to you.";
}

function drawCard() {
  currentCard = drawNeverRepeated(document.getElementById("topic").value);
  cardBack();
  document.getElementById("reading-text").hidden = true;
  document.getElementById("reveal-button").hidden = false;
  document.getElementById("instruction").textContent = "Your card is drawn. Tap the card or choose Reveal My Reading.";
  document.getElementById("card-stage").setAttribute("aria-label", "Reveal your drawn card");
}

function revealCard() {
  if (!currentCard) return;
  showCardFace(currentCard);
  revealReading();
}

document.getElementById("draw-button").addEventListener("click", drawCard);
document.getElementById("reveal-button").addEventListener("click", revealCard);
document.getElementById("card-stage").addEventListener("click", revealCard);
document.getElementById("reset-button").addEventListener("click", function () {
  try { localStorage.removeItem(usedKey); } catch (error) {}
  currentCard = null;
  cardBack();
  document.getElementById("reading-text").hidden = true;
  document.getElementById("reveal-button").hidden = true;
  document.getElementById("instruction").textContent = "Your journey has been reset. Choose a focus, then draw a new card.";
  document.getElementById("card-stage").setAttribute("aria-label", "Draw a card first");
});
