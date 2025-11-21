// =======================================
// Seek-A-Boo — Stanfield Edition (JS)
// =======================================

// ---- Card definitions ----
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

// ---- Utility: Fisher–Yates shuffle ----
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
let boardCards = [];          // randomized layout of 36 cards
let deck = [];                // randomized list of card ids for Find Card
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
const setupControlsEl     = document.getElementById("setupControls");
const currentPlayerDisplayEl = document.getElementById("currentPlayerDisplay");
const seekCardDisplayEl   = document.getElementById("seekCardDisplay");
const messageEl           = document.getElementById("message");
const winnerOverlayEl     = document.getElementById("winnerOverlay");
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

// ---- Start / restart game ----
function startGame() {
  const numPlayers = parseInt(playerCountEl.value, 10) || 1;

  if (!players.length) {
    // First time: build players from inputs
    players = [];
    for (let i = 0; i < numPlayers; i++) {
      const nm = (playerNameInputs[i].value || "").trim() || `Player ${i + 1}`;
      players.push({ name: nm, score: 0 });
    }
  } else {
    // Restart: keep names, reset scores
    players.forEach(p => p.score = 0);
  }

  // Randomize player order
  players = shuffle(players);
  currentPlayerIndex = 0;
  gameOver = false;
  isBusy = false;
  messageEl.textContent = "";
  winnerOverlayEl.classList.add("hidden");
  winnerOverlayEl.textContent = "";

  // A: Randomize both board layout and deck
  boardCards = shuffle(ALL_CARDS);               // board placement
  deck       = shuffle(ALL_CARDS.map(c => c.id)); // Find Card order

  renderScoreboard();
  renderCurrentPlayer();
  renderSeekCard();
  renderBoard();
  runShuffleAnimation(); // D: cosmetic shuffle

  // Hide setup after first start, show restart
  setupControlsEl.classList.add("hidden");
  if (playerNamesSection) playerNamesSection.classList.add("hidden");
  restartGameBtn.classList.remove("hidden");
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
function renderSeekCard() {
  // Clear color classes
  seekCardDisplayEl.className = "seek-display";

  if (!deck.length) {
    seekCardDisplayEl.textContent = "All matches found!";
    return;
  }

  const targetId = deck[0];
  const card = ALL_CARDS.find(c => c.id === targetId);
  if (!card) return;

  // Apply color background
  seekCardDisplayEl.classList.add(`seek-${card.color}`);

  // Show only the image (physical Seek-A-Boo style)
  seekCardDisplayEl.innerHTML = "";
  const img = new Image();
  img.src = `images/${card.id}.png`;
  img.className = "seek-img";
  seekCardDisplayEl.appendChild(img);
}

// --------------------------------------
// C. Render Board — fully randomized
// --------------------------------------
function renderBoard() {
  boardEl.innerHTML = "";

  // boardCards is already shuffled in startGame, but we shuffle again
  // to ensure a fresh layout even on subsequent restarts if needed.
  const layout = shuffle(boardCards);

  layout.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.color = card.color;

    const inner = document.createElement("div");
    inner.className = "card-inner";

    // FRONT: full-color circle
    const front = document.createElement("div");
    front.className = `card-face card-front color-${card.color}`;

    // BACK: white circle showing the image
    const back = document.createElement("div");
    back.className = "card-face card-back";

    const img = new Image();
    img.src = `images/${card.id}.png`;
    img.className = "back-img";
    back.appendChild(img);

    inner.appendChild(front);
    inner.appendChild(back);
    cardEl.appendChild(inner);

    cardEl.addEventListener("click", () => onCardClicked(cardEl));

    boardEl.appendChild(cardEl);
  });
}

// --------------------------------------
// D. Startup shuffle (jitter animation)
// --------------------------------------
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
  if (cardEl.classList.contains("matched")) return; // no action

  const cardId   = cardEl.dataset.cardId;
  const cardColor = cardEl.dataset.color;
  const activeId = deck[0];
  const activeCard = ALL_CARDS.find(c => c.id === activeId);

  if (!activeCard) return;

  // Color restriction: ignore wrong color completely
  if (cardColor !== activeCard.color) {
    messageEl.textContent =
      `Choose a ${prettyColor(activeCard.color)} circle.`;
    return;
  }

  // Lock input and flip the card
  isBusy = true;
  cardEl.classList.add("flipped");

  if (cardId === activeId) {
    // Correct match
    setTimeout(() => {
      // Mark matched visually (hole)
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
        renderSeekCard();
      }

      isBusy = false;
    }, 900);
  } else {
    // Incorrect match (same color, wrong picture)
    setTimeout(() => {
      cardEl.classList.remove("flipped");

      // Move current Find Card to bottom of deck
      const first = deck.shift();
      deck.push(first);

      // Next player's turn
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      renderCurrentPlayer();
      renderSeekCard();

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
  winnerOverlayEl.textContent = text;
  winnerOverlayEl.classList.remove("hidden");

  // Neutralize seek card
  seekCardDisplayEl.className = "seek-display";
  seekCardDisplayEl.textContent = "All matches found!";
}

// ---- Event listeners ----
playerCountEl.addEventListener("change", updateNameInputsVisibility);
startGameBtn.addEventListener("click", startGame);
restartGameBtn.addEventListener("click", startGame);

// Init
updateNameInputsVisibility();
