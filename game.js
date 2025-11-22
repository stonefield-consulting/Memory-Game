// =======================================
// Seek-A-Boo — Stanfield Edition (JS)
// =======================================

// ---- Card definitions (IDs + colors) ----
const ALL_CARDS = [
  // Blue
  { id: 'banana',        label: 'Banana',          color: 'blue' },
  { id: 'milk',          label: 'Milk',            color: 'blue' },
  { id: 'carrot',        label: 'Carrot',          color: 'blue' },
  { id: 'cookie',        label: 'Cookie',          color: 'blue' },
  { id: 'broccoli',      label: 'Broccoli',        color: 'blue' },
  { id: 'apple',         label: 'Apple',           color: 'blue' },

  // Orange
  { id: 'jacket',        label: 'Jacket',          color: 'orange' },
  { id: 'socks',         label: 'Socks',           color: 'orange' },
  { id: 'hat',           label: 'Hat',             color: 'orange' },
  { id: 'tshirt',        label: 'T-Shirt',         color: 'orange' },
  { id: 'jeans',         label: 'Jeans',           color: 'orange' },
  { id: 'shoes',         label: 'Shoes',           color: 'orange' },

  // Purple
  { id: 'mailbox',       label: 'Mailbox',         color: 'purple' },
  { id: 'butterfly',     label: 'Butterfly',       color: 'purple' },
  { id: 'stop_sign',     label: 'Stop Sign',       color: 'purple' },
  { id: 'leaf',          label: 'Leaf',            color: 'purple' },
  { id: 'sunflower',     label: 'Sunflower',       color: 'purple' },
  { id: 'umbrella',      label: 'Umbrella',        color: 'purple' },

  // Yellow
  { id: 'purple_rectangle', label: 'Purple Rectangle', color: 'yellow' },
  { id: 'red_circle',       label: 'Red Circle',       color: 'yellow' },
  { id: 'blue_heart',       label: 'Blue Heart',       color: 'yellow' },
  { id: 'orange_triangle',  label: 'Orange Triangle',  color: 'yellow' },
  { id: 'green_square',     label: 'Green Square',     color: 'yellow' },
  { id: 'yellow_diamond',   label: 'Yellow Diamond',   color: 'yellow' },

  // Green
  { id: 'beach_ball',    label: 'Beach Ball',      color: 'green' },
  { id: 'tricycle',      label: 'Tricycle',        color: 'green' },
  { id: 'teddy_bear',    label: 'Teddy Bear',      color: 'green' },
  { id: 'wooden_blocks', label: 'Wooden Blocks',   color: 'green' },
  { id: 'drum',          label: 'Drum',            color: 'green' },
  { id: 'red_toy_car',   label: 'Red Toy Car',     color: 'green' },

  // Red
  { id: 'duck',          label: 'Duck',            color: 'red' },
  { id: 'cat',           label: 'Cat',             color: 'red' },
  { id: 'horse',         label: 'Horse',           color: 'red' },
  { id: 'dog',           label: 'Dog',             color: 'red' },
  { id: 'pig',           label: 'Pig',             color: 'red' },
  { id: 'goldfish',      label: 'Goldfish',        color: 'red' }
];

// ---- Themes (for different image sets / difficulty) ----
const THEMES = {
  classic: {
    key: "classic",
    name: "Kids - Classic",
    imageDir: "images",
    useColors: true,
    enforceColorRestriction: true
  },
  thanksgiving: {
    key: "thanksgiving",
    name: "Kids - Thanksgiving",
    imageDir: "images/thanksgiving",
    useColors: true,
    enforceColorRestriction: true
  },
  christmas: {
    key: "christmas",
    name: "Kids - Christmas",
    imageDir: "images/christmas",
    useColors: true,
    enforceColorRestriction: true
  },
  adult: {
    key: "adult",
    name: "Adult - No Colors",
    imageDir: "images",
    useColors: false,
    enforceColorRestriction: false
  }
};

let currentThemeKey = "classic";
function getCurrentTheme() {
  return THEMES[currentThemeKey] || THEMES.classic;
}

// ---- Utility: shuffle ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prettyColor(c) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

// ---- Game state ----
let boardCards = [];
let deck = [];
let players = [];
let currentPlayerIndex = 0;
let isBusy = false;
let gameOver = false;

// ---- DOM ----
const boardEl             = document.getElementById("board");
const scoreboardEl        = document.getElementById("scoreboard");
const playerCountEl       = document.getElementById("playerCount");
const startGameBtn        = document.getElementById("startGameBtn");
const restartGameBtn      = document.getElementById("restartGameBtn");
const quitGameBtn         = document.getElementById("quitGameBtn");
const setupControlsEl     = document.getElementById("setupControls");
const currentPlayerDisplayEl = document.getElementById("currentPlayerDisplay");
const seekCardDisplayEl   = document.getElementById("seekCardDisplay");
const messageEl           = document.getElementById("message");
const winnerOverlayEl     = document.getElementById("winnerOverlay");
const winnerTextEl        = document.getElementById("winnerText");
const playAgainBtn        = document.getElementById("playAgainBtn");
const modeSelectEl        = document.getElementById("modeSelect");
const bannerEl            = document.querySelector(".banner");

const playerNameInputs    = [
  document.getElementById("playerName1"),
  document.getElementById("playerName2"),
  document.getElementById("playerName3"),
  document.getElementById("playerName4")
];
const playerNamesSection  = document.querySelector(".player-name-inputs");

// ---- Player name inputs visibility ----
function updateNameInputsVisibility() {
  const numPlayers = parseInt(playerCountEl.value, 10) || 1;
  playerNameInputs.forEach((input, idx) => {
    if (idx < numPlayers) {
      input.classList.remove("hidden");
    } else {
      input.classList.add("hidden");
      input.value = "";
    }
  });
}

// ---- Hard reset back to setup ----
function resetToSetup() {
  deck = [];
  boardCards = [];
  players = [];
  currentPlayerIndex = 0;
  isBusy = false;
  gameOver = false;

  boardEl.innerHTML = "";
  scoreboardEl.innerHTML = "";
  seekCardDisplayEl.className = "seek-display";
  seekCardDisplayEl.textContent = "";
  currentPlayerDisplayEl.textContent = "";
  messageEl.textContent = "";
  winnerOverlayEl.classList.add("hidden");
  winnerTextEl.textContent = "";

  setupControlsEl.classList.remove("hidden");
  if (playerNamesSection) playerNamesSection.classList.remove("hidden");
  restartGameBtn.classList.add("hidden");
  if (quitGameBtn) quitGameBtn.classList.add("hidden");

  // Re-enable name input visibility based on current player count
  updateNameInputsVisibility();
}

// ---- Start / restart game ----
function startGame() {
  const numPlayers = parseInt(playerCountEl.value, 10) || 1;
  const theme = getCurrentTheme();

  if (!players.length) {
    // First time or after Quit: build players from inputs
    players = [];
    for (let i = 0; i < numPlayers; i++) {
      const nm = (playerNameInputs[i].value || "").trim() || `Player ${i + 1}`;
      players.push({ name: nm, score: 0 });
    }
  } else {
    // Restart / Play Again: keep names, reset scores
    players.forEach(p => p.score = 0);
  }

  // Randomize player order
  players = shuffle(players);
  currentPlayerIndex = 0;
  gameOver = false;
  isBusy = false;
  messageEl.textContent = "";
  winnerOverlayEl.classList.add("hidden");
  winnerTextEl.textContent = "";

  // Randomize board layout and deck
  boardCards = shuffle(ALL_CARDS);
  deck       = shuffle(ALL_CARDS.map(c => c.id));

  renderScoreboard();
  renderCurrentPlayer();
  renderSeekCard(theme);
  renderBoard(theme);
  runShuffleAnimation();

  // Hide setup after game start; show Restart + Quit
  setupControlsEl.classList.add("hidden");
  if (playerNamesSection) playerNamesSection.classList.add("hidden");
  restartGameBtn.classList.remove("hidden");
  if (quitGameBtn) quitGameBtn.classList.remove("hidden");
}

// ---- Scoreboard ----
function renderScoreboard() {
  scoreboardEl.innerHTML = "";
  players.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "score" + (idx === currentPlayerIndex ? " current" : "");
    div.textContent = `${p.name} — ${p.score}`;
    scoreboardEl.appendChild(div);
  });
}

function renderCurrentPlayer() {
  if (!players.length) {
    currentPlayerDisplayEl.textContent = "";
    return;
  }
  currentPlayerDisplayEl.textContent =
    `Turn: ${players[currentPlayerIndex].name}`;
  renderScoreboard();
}

// ---- Find Card / Seek card ----
function renderSeekCard(theme = getCurrentTheme()) {
  // Reset classes
  seekCardDisplayEl.className = "seek-display";

  if (!deck.length) {
    seekCardDisplayEl.textContent = "All matches found!";
    return;
  }

  const targetId = deck[0];
  const card = ALL_CARDS.find(c => c.id === targetId);
  if (!card) return;

  // Apply background color, unless Adult/no-colors mode
  if (theme.useColors) {
    seekCardDisplayEl.classList.add(`seek-${card.color}`);
  } else {
    seekCardDisplayEl.classList.add("seek-neutral");
  }

  seekCardDisplayEl.innerHTML = "";
  const img = new Image();
  img.src = `${theme.imageDir}/${card.id}.png`;
  img.className = "seek-img";
  seekCardDisplayEl.appendChild(img);
}

// ---- Render Board ----
function renderBoard(theme = getCurrentTheme()) {
  boardEl.innerHTML = "";

  const layout = shuffle(boardCards);

  layout.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.color = card.color;

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = "card-face card-front";
    if (theme.useColors) {
      front.classList.add(`color-${card.color}`);
    } else {
      front.classList.add("neutral-front");
    }

    const back = document.createElement("div");
    back.className = "card-face card-back";

    const img = new Image();
    img.src = `${theme.imageDir}/${card.id}.png`;
    img.className = "back-img";
    back.appendChild(img);

    inner.appendChild(front);
    inner.appendChild(back);
    cardEl.appendChild(inner);

    cardEl.addEventListener("click", () => onCardClicked(cardEl));

    boardEl.appendChild(cardEl);
  });
}

// ---- Startup shuffle animation ----
function runShuffleAnimation() {
  const cards = Array.from(boardEl.querySelectorAll(".card"));
  if (!cards.length) return;

  isBusy = true;
  cards.forEach(c => c.classList.add("jitter"));
  setTimeout(() => {
    cards.forEach(c => c.classList.remove("jitter"));
    isBusy = false;
  }, 450);
}

// ---- Click handling ----
function onCardClicked(cardEl) {
  if (isBusy || gameOver) return;
  if (!deck.length) return;
  if (cardEl.classList.contains("matched")) return;

  const theme = getCurrentTheme();
  const cardId   = cardEl.dataset.cardId;
  const cardColor = cardEl.dataset.color;
  const activeId = deck[0];
  const activeCard = ALL_CARDS.find(c => c.id === activeId);
  if (!activeCard) return;

  // Color restriction only in kids modes
  if (theme.enforceColorRestriction && cardColor !== activeCard.color) {
    messageEl.textContent =
      `Choose a ${prettyColor(activeCard.color)} circle.`;
    return;
  }

  isBusy = true;
  cardEl.classList.add("flipped");

  if (cardId === activeId) {
    // Correct match
    setTimeout(() => {
      cardEl.classList.add("matched");

      // Remove from deck
      deck = deck.filter(id => id !== activeId);

      // Score
      players[currentPlayerIndex].score += 1;
      messageEl.textContent = "Correct! Go again.";
      renderScoreboard();

      if (!deck.length) {
        endGame();
      } else {
        renderSeekCard(theme);
      }

      isBusy = false;
    }, 900);
  } else {
    // Incorrect match
    setTimeout(() => {
      cardEl.classList.remove("flipped");

      const first = deck.shift();
      deck.push(first);

      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      renderCurrentPlayer();
      renderSeekCard(theme);

      messageEl.textContent = "Not a match. Next player.";
      isBusy = false;
    }, 900);
  }
}

// ---- End of game ----
function endGame() {
  gameOver = true;
  isBusy = false;

  const maxScore = Math.max(...players.map(p => p.score));
  const winners = players.filter(p => p.score === maxScore);

  let text;
  if (winners.length === 1) {
    text = `${winners[0].name} WINS!`;
  } else {
    text = `It's a tie: ${winners.map(w => w.name).join(" & ")}!`;
  }

  messageEl.textContent = text;
  winnerTextEl.textContent = text;
  winnerOverlayEl.classList.remove("hidden");

  seekCardDisplayEl.className = "seek-display";
  seekCardDisplayEl.textContent = "All matches found!";
}

// ---- Event listeners ----
playerCountEl.addEventListener("change", updateNameInputsVisibility);

if (modeSelectEl) {
  modeSelectEl.addEventListener("change", (e) => {
    currentThemeKey = e.target.value || "classic";
  });
}

startGameBtn.addEventListener("click", startGame);
restartGameBtn.addEventListener("click", startGame);

if (quitGameBtn) {
  quitGameBtn.addEventListener("click", () => {
    if (isBusy) return;
    resetToSetup();
  });
}

if (playAgainBtn) {
  playAgainBtn.addEventListener("click", () => {
    if (isBusy) return;
    startGame();
  });
}

// Banner tap = Quit / full reset
if (bannerEl) {
  bannerEl.addEventListener("click", () => {
    if (isBusy) return;
    resetToSetup();
  });
}

// Init
updateNameInputsVisibility();