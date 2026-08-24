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
export const TAROT_CARDS = [...majorCards, ...minorCards];

const options = {
  sky: ["new moon", "crescent moon", "full moon", "eclipse", "golden sun", "seven stars", "storm cloud", "aurora"],
  guide: ["owl", "raven", "moth", "fox", "wolf", "serpent", "deer", "crane"],
  object: ["key", "lantern", "mirror", "compass", "cup", "thread", "book", "coin"],
  landscape: ["forest path", "mountain pass", "stone gate", "river crossing", "tower", "garden", "shoreline", "bridge"],
  energy: ["wind", "rain", "flame", "water", "roots", "lightning", "mist", "starlight"]
};
const usedKey = "symbol-tarot-used-cards";
const choose = (items) => items[Math.floor(Math.random() * items.length)];
const titleCase = (text) => text.replace(/\b\w/g, (letter) => letter.toUpperCase());
const getUsed = () => new Set(JSON.parse(localStorage.getItem(usedKey) || "[]"));
const saveUsed = (used) => localStorage.setItem(usedKey, JSON.stringify([...used]));

function makeCard(topic) {
  const inspiration = choose(TAROT_CARDS);
  const symbols = Object.fromEntries(Object.entries(options).map(([name, values]) => [name, choose(values)]));
  const id = [inspiration.id, ...Object.values(symbols)].join("|");
  const theme = choose(inspiration.themes);
  return {
    id,
    title: `The ${titleCase(symbols.object)} of the ${titleCase(symbols.landscape)}`,
    inspiration: inspiration.name,
    theme,
    symbols,
    prompt: `For ${topic}, notice the ${symbols.object} beside the ${symbols.landscape}. The ${symbols.guide} beneath the ${symbols.sky} suggests ${theme}. What is one grounded next step you can take?`
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

function renderCard(card) {
  const symbolList = Object.values(card.symbols).map((symbol) => `<li>${symbol}</li>`).join("");
  document.querySelector("#card").classList.remove("empty");
  document.querySelector("#card").innerHTML = `
    <p class="card-label">Your one-of-a-kind card</p>
    <h2>${card.title}</h2>
    <p class="inspiration">Inspired by the theme of ${card.inspiration}</p>
    <ul class="symbols">${symbolList}</ul>
    <p class="reflection">${card.prompt}</p>
  `;
}

document.querySelector("#draw-button").addEventListener("click", () => {
  try {
    renderCard(drawNeverRepeated(document.querySelector("#topic").value));
  } catch (error) {
    alert(error.message);
  }
});

document.querySelector("#reset-button").addEventListener("click", () => {
  localStorage.removeItem(usedKey);
  document.querySelector("#card").className = "card empty";
  document.querySelector("#card").innerHTML = '<p class="placeholder">Your journey has been reset. Draw a new card whenever you are ready.</p>';
});
