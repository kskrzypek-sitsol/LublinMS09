const players = [];
const raceState = {
  running: false,
  finishOrder: [],
  animationFrame: null,
  lastTime: null
};

const form = document.querySelector("#player-form");
const nameInput = document.querySelector("#player-name");
const playerList = document.querySelector("#player-list");
const playerMessage = document.querySelector("#player-message");
const startButton = document.querySelector("#start-race");
const track = document.querySelector("#track");
const results = document.querySelector("#results");
const resultsList = document.querySelector("#results-list");

function renderPlayers() {
  playerList.replaceChildren();

  players.forEach((player, index) => {
    const item = document.createElement("li");
    item.textContent = `${index + 1}. ${player.name}`;
    playerList.append(item);
  });

  const canStart = players.length >= 2 && !raceState.running;
  startButton.disabled = !canStart;
  nameInput.disabled = players.length >= 6 || raceState.running;

  if (players.length >= 6) {
    playerMessage.textContent = "Starting list full. Ready for the race.";
  } else if (players.length >= 2) {
    playerMessage.textContent = `${players.length} riders ready. Start when set.`;
  } else {
    playerMessage.textContent = "Add 2 to 6 players.";
  }
}

function renderTrack() {
  track.replaceChildren();

  players.forEach((player, index) => {
    const lane = document.createElement("div");
    lane.className = "lane";

    const laneNumber = document.createElement("span");
    laneNumber.className = "lane-number";
    laneNumber.textContent = index + 1;

    const finishLine = document.createElement("div");
    finishLine.className = "finish-line";
    finishLine.setAttribute("aria-hidden", "true");

    const horse = document.createElement("div");
    horse.className = "horse";
    horse.dataset.playerId = player.id;
    horse.innerHTML = '<span class="horse-icon" aria-hidden="true">&#128052;</span>';

    const horseName = document.createElement("span");
    horseName.className = "horse-name";
    horseName.textContent = player.name;
    horse.append(horseName);

    lane.append(laneNumber, finishLine, horse);
    track.append(lane);
  });
}

function addPlayer(event) {
  event.preventDefault();
  const name = nameInput.value.trim();

  if (!name || players.length >= 6 || raceState.running) {
    return;
  }

  players.push({ id: crypto.randomUUID(), name, progress: 0, speed: 0 });
  nameInput.value = "";
  renderPlayers();
  renderTrack();
  nameInput.focus();
}

function finishRace() {
  raceState.running = false;
  raceState.animationFrame = null;
  resultsList.replaceChildren();

  raceState.finishOrder.forEach((player) => {
    const result = document.createElement("li");
    result.textContent = player.name;
    resultsList.append(result);
  });

  results.hidden = false;
  startButton.disabled = true;
  playerMessage.textContent = "Race complete.";
}

function race(timestamp) {
  if (!raceState.lastTime) {
    raceState.lastTime = timestamp;
  }

  const elapsed = Math.min((timestamp - raceState.lastTime) / 1000, 0.05);
  raceState.lastTime = timestamp;

  players.forEach((player) => {
    if (player.progress >= 100) {
      return;
    }

    const paceShift = (Math.random() - 0.45) * 4;
    player.progress = Math.min(100, player.progress + (player.speed + paceShift) * elapsed);

    const horse = document.querySelector(`[data-player-id="${player.id}"]`);
    const lane = horse.parentElement;
    const finishLine = lane.querySelector(".finish-line");
    const maxTravel = finishLine.offsetLeft - 72;
    horse.style.transform = `translateX(${Math.max(0, maxTravel * (player.progress / 100))}px)`;

    if (player.progress >= 100) {
      horse.classList.add("finished");
      raceState.finishOrder.push(player);
    }
  });

  if (raceState.finishOrder.length === players.length) {
    finishRace();
    return;
  }

  raceState.animationFrame = requestAnimationFrame(race);
}

function startRace() {
  if (players.length < 2 || raceState.running) {
    return;
  }

  raceState.running = true;
  raceState.finishOrder = [];
  raceState.lastTime = null;
  players.forEach((player) => {
    player.progress = 0;
    player.speed = 14 + Math.random() * 6;
  });

  results.hidden = true;
  form.querySelector("button").disabled = true;
  nameInput.disabled = true;
  startButton.disabled = true;
  playerMessage.textContent = "And they are off!";
  raceState.animationFrame = requestAnimationFrame(race);
}

form.addEventListener("submit", addPlayer);
startButton.addEventListener("click", startRace);
renderPlayers();