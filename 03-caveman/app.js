const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;
const FINISH_POSITION = 90;

const state = {
  players: [],
  raceTimer: null,
  running: false
};

const playerFields = document.querySelector("#player-fields");
const setupForm = document.querySelector("#setup-form");
const addPlayerButton = document.querySelector("#add-player");
const formError = document.querySelector("#form-error");
const setupScreen = document.querySelector("#setup-screen");
const raceScreen = document.querySelector("#race-screen");
const track = document.querySelector("#track");
const raceStatus = document.querySelector("#race-status");
const winnerDialog = document.querySelector("#winner-dialog");
const winnerName = document.querySelector("#winner-name");
const winnerDetail = document.querySelector("#winner-detail");
const raceAgainButton = document.querySelector("#race-again");

function addPlayerField(name = "") {
  const playerNumber = playerFields.children.length + 1;
  const field = document.createElement("label");
  field.className = "player-field";
  field.innerHTML = `
    <span class="player-number">${playerNumber}</span>
    <input type="text" name="player-${playerNumber}" maxlength="18" value="${name}" placeholder="Rider ${playerNumber}" aria-label="Rider ${playerNumber} name" autocomplete="off">
  `;
  playerFields.append(field);
  addPlayerButton.disabled = playerNumber >= MAX_PLAYERS;
}

function getPlayerNames() {
  return [...playerFields.querySelectorAll("input")]
    .map((input) => input.value.trim());
}

function validatePlayers(names) {
  if (names.length < MIN_PLAYERS || names.some((name) => !name)) {
    return "Name every rider.";
  }

  const distinctNames = new Set(names.map((name) => name.toLowerCase()));
  if (distinctNames.size !== names.length) {
    return "Each rider needs a different name.";
  }

  return "";
}

function createRacers(names) {
  track.replaceChildren();
  state.players = names.map((name, index) => ({
    name,
    position: 2,
    element: null,
    lane: index + 1
  }));

  state.players.forEach((player) => {
    const lane = document.createElement("div");
    lane.className = "lane";
    lane.innerHTML = `<p class="lane-label">${player.lane}. ${player.name}</p>`;

    const horse = document.createElement("div");
    horse.className = "horse";
    horse.innerHTML = "&#127943;";
    horse.setAttribute("aria-label", `${player.name}'s horse`);
    horse.setAttribute("role", "img");
    lane.append(horse);
    track.append(lane);
    player.element = horse;
  });
}

function moveRacers() {
  const leaders = [];

  state.players.forEach((player) => {
    const stride = 0.6 + Math.random() * 2.4;
    player.position = Math.min(FINISH_POSITION, player.position + stride);
    player.element.style.left = `${player.position}%`;

    if (player.position >= FINISH_POSITION) {
      leaders.push(player);
    }
  });

  if (leaders.length > 0) {
    finishRace(leaders[0]);
  }
}

function startRace() {
  state.running = true;
  raceStatus.textContent = "And they are off!";
  state.players.forEach((player) => player.element.classList.add("is-running"));
  state.raceTimer = window.setInterval(moveRacers, 115);
}

function finishRace(winner) {
  if (!state.running) {
    return;
  }

  state.running = false;
  window.clearInterval(state.raceTimer);
  state.players.forEach((player) => player.element.classList.remove("is-running"));
  winner.element.classList.add("is-winner");
  raceStatus.textContent = `${winner.name} takes the flag!`;
  winnerName.textContent = winner.name;
  winnerDetail.textContent = `Lane ${winner.lane} crosses first.`;
  window.setTimeout(() => winnerDialog.showModal(), 450);
}

function resetRace() {
  winnerDialog.close();
  createRacers(state.players.map((player) => player.name));
  raceStatus.textContent = "Waiting at the gate";
  window.setTimeout(startRace, 250);
}

addPlayerButton.addEventListener("click", () => addPlayerField());

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const names = getPlayerNames();
  const error = validatePlayers(names);
  formError.textContent = error;

  if (error) {
    return;
  }

  createRacers(names);
  setupScreen.classList.add("is-hidden");
  raceScreen.classList.remove("is-hidden");
  window.setTimeout(startRace, 450);
});

raceAgainButton.addEventListener("click", resetRace);

addPlayerField();
addPlayerField();
