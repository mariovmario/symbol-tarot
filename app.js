const majorCards = [
  ["The Fool", ["beginnings", "curiosity", "possibility"]], ["The Magician", ["agency", "skill", "focus"]],
  ["The High Priestess", ["intuition", "mystery", "inner knowledge"]], ["The Empress", ["nurturing", "abundance", "creativity"]],
  ["The Emperor", ["structure", "leadership", "boundaries"]], ["The Hierophant", ["tradition", "learning", "shared values"]],
  ["The Lovers", ["connection", "choice", "alignment"]], ["The Chariot", ["direction", "willpower", "momentum"]],
  ["Strength", ["courage", "compassion", "self-control"]], ["The Hermit", ["reflection", "guidance", "solitude"]],
  ["Wheel of Fortune", ["change", "cycles", "turning point"]], ["Justice", ["fairness", "truth", "accountability"]],
  ["The Hanged Man", ["perspective", "pause", "surrender"]], ["Death", ["transition", "release", "renewal"]],
  ["Temperance", ["balance", "integration", "patience"]], ["The Devil", ["attachment", "shadow", "freedom"]],
  ["The Tower", ["disruption", "revelation", "rebuilding"]], ["The Star", ["hope", "healing", "renewal"]],
  ["The Moon", ["uncertainty", "intuition", "dreams"]], ["The Sun", ["clarity", "joy", "vitality"]],
  ["Judgement", ["awakening", "reckoning", "calling"]], ["The World", ["completion", "wholeness", "integration"]]
].map(([name, themes], number) => ({ id: `major-${number}`, name, arcana: "major", themes }));

const suits = {
  Wands: { element: "fire", themes: ["action", "energy", "creative drive"] },
  Cups: { element: "water", themes: ["emotion", "connection", "intuition"] },
  Swords: { element: "air", themes: ["thought", "truth", "decision"] },
  Pentacles: { element: "earth", themes: ["resources", "work", "security"] }
};
const ranks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const rankThemes = [["beginning", "potential"], ["choice", "balance"], ["growth", "collaboration"], ["stability", "foundation"], ["challenge", "change"], ["exchange", "movement"], ["assessment", "strategy"], ["practice", "progress"], ["maturity", "resilience"], ["completion", "responsibility"], ["message", "discovery"], ["pursuit", "motion"], ["mastery", "nurturing"], ["leadership", "command"]];
const minorCards = Object.entries(suits).flatMap(([suit, data]) => ranks.map((rank, index) => ({ id: `${rank.toLowerCase()}-${suit.toLowerCase()}`, name: `${rank} of ${suit}`, arcana: "minor", suit, element: data.element, themes: [...data.themes, ...rankThemes[index]] })));
const tarotCards = [...majorCards, ...minorCards];

const choices = {
  sky: [["new moon", "🌑"], ["crescent moon", "☾"], ["full moon", "🌕"], ["eclipse", "◉"], ["golden sun", "☀"], ["seven stars", "✦"], ["storm cloud", "☁"], ["aurora", "〰"]],
  guide: [["owl", "🦉"], ["raven", "🐦‍⬛"], ["moth", "🦋"], ["fox", "🦊"], ["wolf", "🐺"], ["serpent", "🐍"], ["deer", "🦌"], ["crane", "🕊️"]],
  object: [["key", "🗝️"], ["lantern", "🏮"], ["mirror", "🪞"], ["compass", "🧭"], ["cup", "🏆"], ["thread", "🧵"], ["book", "📖"], ["coin", "🪙"]],
  landscape: [["forest path", "Forest Path"], ["mountain pass", "Mountain Pass"], ["stone gate", "Stone Gate"], ["river crossing", "River Crossing"], ["tower", "Tower"], ["garden", "Garden"], ["shoreline", "Shoreline"], ["bridge", "Bridge"]],
  energy: [["wind", "≈"], ["rain", "❈"], ["flame", "♨"], ["water", "≋"], ["roots", "⌇"], ["lightning", "ϟ"], ["mist", "☁"], ["starlight", "✧"]]
};
const usedKey = "symbol-tarot-used-cards";
let currentCard = null;
const choose = (items) => items[Math.floor(Math.random() * items.length)];
const titleCase = (text) => text.replace(/\b\w/g, (letter) => letter.toUpperCase());
const getUsed = () => new Set(JSON.parse(localStorage.getItem(usedKey) || "[]"));
const saveUsed = (used) => localStorage.setItem(usedKey, JSON.stringify([...used]));

function makeCard(topic) {
  const inspiration = choose(tarotCards);
  const symbols = Object.fromEntries(Object.entries(choices).map(([name, values]) => [name, choose(values)]));
  const id = [inspiration.id, ...Object.values(symbols).map(([name]) => name)].join("|");
  const theme = choose(inspiration.themes);
  return {
    id,
    title: `The ${titleCase(symbols.object[0])} of the ${titleCase(symbols.landscape[0])}`,
    inspiration: inspiration.name,
    theme,
    symbols,
    prompt: `For ${topic}, notice the ${symbols.object[0]} beside the ${symbols.landscape[0]}. The ${symbols.guide[0]} beneath the ${symbols.sky[0]} suggests ${theme}. What is one grounded next step you can take?`
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
  throw new Error("All currently available combinations have been used. Start a new journey to reset.");
}

function showCardFace(card) {
  const { sky, guide, object, landscape, energy } = card.symbols;
  document.querySelector("#physical-card").className = "physical-card card-front";
  document.querySelector("#physical-card").innerHTML = `
    <span class="card-number">One-of-a-kind symbol card</span>
    <h2 class="card-title">${card.title}</h2>
    <span class="card-sky" aria-label="${sky[0]}">${sky[1]}</span>
    <span class="card-guide" aria-label="${guide[0]}">${guide[1]}</span>
    <span class="card-object-row"><span aria-label="${object[0]}">${object[1]}</span><span aria-label="${energy[0]}">${energy[1]}</span></span>
    <p class="card-landscape">${landscape[1]}</p>
  `;
}

function revealReading() {
  if (!currentCard) return;
  const labels = Object.values(currentCard.symbols).map(([name]) => `<li>${name}</li>`).join("");
  document.querySelector("#reading-text").hidden = false;
  document.querySelector("#reading-text").innerHTML = `
    <h2>Your Reading</h2>
    <ul class="symbols">${labels}</ul>
    <p><strong>Theme:</strong> ${currentCard.theme}. ${currentCard.prompt}</p>
  `;
  document.querySelector("#reveal-button").hidden = true;
  document.querySelector("#instruction").textContent = "Read the symbols, then reflect on what feels meaningful to you.";
}

function drawCard() {
  try {
    currentCard = drawNeverRepeated(document.querySelector("#topic").value);
    document.querySelector("#physical-card").className = "physical-card card-back";
    document.querySelector("#physical-card").innerHTML = '<span class="card-back-stars">✦ ✧ ✦</span><span class="card-back-moon">☾</span><span class="card-back-stars">✦ ✧ ✦</span>';
    document.querySelector("#reading-text").hidden = true;
    document.querySelector("#reveal-button").hidden = false;
    document.querySelector("#instruction").textContent = "Your card is drawn. Tap the card or choose Reveal My Reading.";
    document.querySelector("#card-stage").setAttribute("aria-label", "Reveal your drawn card");
  } catch (error) { alert(error.message); }
}

document.querySelector("#draw-button").addEventListener("click", drawCard);
document.querySelector("#reveal-button").addEventListener("click", () => { showCardFace(currentCard); revealReading(); });
document.querySelector("#card-stage").addEventListener("click", () => { if (currentCard) { showCardFace(currentCard); revealReading(); } });
document.querySelector("#reset-button").addEventListener("click", () => {
  localStorage.removeItem(usedKey);
  currentCard = null;
  document.querySelector("#physical-card").className = "physical-card card-back";
  document.querySelector("#physical-card").innerHTML = '<span class="card-back-stars">✦ ✧ ✦</span><span class="card-back-moon">☾</span><span class="card-back-stars">✦ ✧ ✦</span>';
  document.querySelector("#reading-text").hidden = true;
  document.querySelector("#reveal-button").hidden = true;
  document.querySelector("#instruction").textContent = "Your journey has been reset. Choose a focus, then draw a new card.";
});
