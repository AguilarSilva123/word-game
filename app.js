const WORDS = [
  { word: "SQUIRREL", hint: "Animal roedor que vive em árvores." },
  { word: "TURTLE", hint: "Animal lento que carrega a casa nas costas." },
  { word: "ORANGE", hint: "Fruta cítrica de cor vibrante." },
  { word: "JOURNEY", hint: "Uma viagem ou caminho para algum lugar." },
  { word: "WINDOW", hint: "Abertura na parede que deixa a luz entrar." },
  { word: "GARDEN", hint: "Lugar onde flores e plantas são cultivadas." },
];
const ROUND_TIME = 25;
const $ = (id) => document.getElementById(id);
let state;

function startGame() {
  state = { level: 1, score: 0, wordIndex: 0, remaining: ROUND_TIME, selected: [], letters: [], timer: null };
  show("game-screen");
  loadRound();
}

function show(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function currentWord() {
  return WORDS[state.wordIndex % WORDS.length];
}

function shuffledLetters(word) {
  const extras = "AEIOURTNSM";
  const letters = [...word, ...extras.slice(0, Math.max(3, 12 - word.length))];
  return letters.sort(() => Math.random() - 0.5);
}

function loadRound() {
  clearInterval(state.timer);
  state.remaining = ROUND_TIME;
  state.selected = [];
  state.letters = shuffledLetters(currentWord().word);

  $("level").textContent = state.level;
  $("score").textContent = state.score;
  $("hint").textContent = currentWord().hint;
  $("feedback").textContent = "";

  renderAnswer();
  renderLetters();
  updateTimer();

  state.timer = setInterval(() => {
    state.remaining -= 1;
    updateTimer();
    if (state.remaining <= 0) endGame("O tempo acabou!");
  }, 1000);
}

function updateTimer() {
  $("time").textContent = state.remaining;
  const bar = $("timer-bar");
  bar.style.width = `${(state.remaining / ROUND_TIME) * 100}%`;
  bar.className = `timer-bar ${state.remaining <= 8 ? "danger" : state.remaining <= 14 ? "warning" : ""}`;
}

function renderAnswer() {
  const answer = $("answer");
  answer.innerHTML = "";
  for (let i = 0; i < currentWord().word.length; i++) {
    const slot = document.createElement("div");
    slot.className = `answer-slot ${state.selected[i] ? "filled" : ""}`;
    slot.textContent = state.selected[i] ? state.selected[i].split(":")[1] : "";
    answer.appendChild(slot);
  }
}

function renderLetters() {
  const bank = $("letter-bank");
  bank.innerHTML = "";
  state.letters.forEach((letter, index) => {
    const button = document.createElement("button");
    button.className = "letter";
    button.textContent = letter;
    button.disabled = state.selected.includes(`${index}:${letter}`);
    button.addEventListener("click", () => chooseLetter(letter, index));
    bank.appendChild(button);
  });
}

function chooseLetter(letter, index) {
  if (state.selected.length >= currentWord().word.length) return;
  state.selected.push(`${index}:${letter}`);
  renderAnswer();
  renderLetters();
  if (state.selected.length === currentWord().word.length) checkAnswer();
}

function checkAnswer() {
  const guess = state.selected.map((item) => item.split(":")[1]).join("");
  if (guess === currentWord().word) {
    const multiplier = Math.max(1, Math.ceil(state.remaining / 5));
    state.score += currentWord().word.length * 10 * multiplier;
    $("score").textContent = state.score;
    $("feedback").textContent = `Correto! Multiplicador ×${multiplier}`;
    clearInterval(state.timer);
    setTimeout(() => {
      state.level += 1;
      state.wordIndex += 1;
      loadRound();
    }, 800);
  } else {
    $("feedback").textContent = "Quase! Tente outra combinação.";
    document.querySelectorAll(".answer-slot").forEach((slot) => slot.classList.add("invalid"));
    setTimeout(() => {
      state.selected = [];
      renderAnswer();
      renderLetters();
      $("feedback").textContent = "";
    }, 650);
  }
}

function clearAnswer() {
  state.selected = [];
  renderAnswer();
  renderLetters();
  $("feedback").textContent = "";
}

function endGame(message) {
  clearInterval(state.timer);
  $("feedback").textContent = message;
  $("final-level").textContent = state.level;
  $("final-score").textContent = `${state.score} pts`;
  setTimeout(() => show("result-screen"), 500);
}

$("play-button").addEventListener("click", startGame);
$("restart-button").addEventListener("click", startGame);
$("clear-button").addEventListener("click", clearAnswer);
$("quit-button").addEventListener("click", () => {
  clearInterval(state?.timer);
  show("home-screen");
});

// Registro do service worker: precisa rodar em HTTPS (ou localhost).
// Sem isso, o app não funciona offline e o navegador não considera
// os critérios mínimos para "instalável" em alguns navegadores.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}
