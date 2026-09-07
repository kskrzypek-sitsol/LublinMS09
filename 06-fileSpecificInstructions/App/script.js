const oscpPlayers = [];
const oscpMaxPlayers = 6;
const oscpMinPlayers = 2;
let oscpRacing = false;
let oscpResults = [];

const oscpPlayerForm = document.querySelector("#player-form");
const oscpPlayerName = document.querySelector("#player-name");
const oscpPlayerList = document.querySelector("#player-list");
const oscpPlayerCount = document.querySelector("#player-count");
const oscpSetupMessage = document.querySelector("#setup-message");
const oscpStartRaceButton = document.querySelector("#start-race");
const oscpRaceTrack = document.querySelector("#race-track");
const oscpRaceStatus = document.querySelector("#race-status");
const oscpResultsPanel = document.querySelector("#results-panel");
const oscpClassificationList = document.querySelector("#classification-list");

function oscpSetMessage(message) {
  oscpSetupMessage.textContent = message;
}

function oscpRenderPlayers() {
  oscpPlayerCount.textContent = `${oscpPlayers.length} / ${oscpMaxPlayers}`;
  oscpPlayerList.replaceChildren();

  oscpPlayers.forEach((player, index) => {
    const listItem = document.createElement("li");
    const name = document.createElement("span");
    const removeButton = document.createElement("button");

    name.textContent = player;
    removeButton.type = "button";
    removeButton.className = "remove-player";
    removeButton.setAttribute("aria-label", `Remove ${player}`);
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () => oscpRemovePlayer(index));

    listItem.append(name, removeButton);
    oscpPlayerList.append(listItem);
  });

  oscpStartRaceButton.disabled = oscpPlayers.length < oscpMinPlayers || oscpRacing;
  oscpPlayerName.disabled = oscpRacing || oscpPlayers.length === oscpMaxPlayers;
  document.querySelector("#add-player").disabled = oscpPlayerName.disabled;
  oscpRenderTrack();
}

function oscpRemovePlayer(index) {
  if (oscpRacing) return;
  oscpPlayers.splice(index, 1);
  oscpSetMessage("Add 2 to 6 players to race.");
  oscpRenderPlayers();
}

function oscpRenderTrack() {
  oscpRaceTrack.replaceChildren();

  if (!oscpPlayers.length) {
    const emptyTrack = document.createElement("div");
    emptyTrack.className = "empty-track";
    emptyTrack.textContent = "Add runners to build the track.";
    oscpRaceTrack.append(emptyTrack);
    return;
  }

  oscpPlayers.forEach((player, index) => {
    const lane = document.createElement("div");
    const finishLine = document.createElement("div");
    const horse = document.createElement("div");
    const icon = document.createElement("span");
    const name = document.createElement("span");

    lane.className = "lane";
    finishLine.className = "finish-line";
    horse.className = "horse";
    horse.dataset.index = index;
    icon.className = "horse-icon";
    icon.textContent = "♞";
    name.className = "horse-name";
    name.textContent = player;

    horse.append(icon, name);
    lane.append(finishLine, horse);
    oscpRaceTrack.append(lane);
  });
}

function oscpAddPlayer(event) {
  event.preventDefault();
  const player = oscpPlayerName.value.trim();

  if (!player) {
    oscpSetMessage("Enter a player name.");
    oscpPlayerName.focus();
    return;
  }

  if (oscpPlayers.some((existingPlayer) => existingPlayer.toLowerCase() === player.toLowerCase())) {
    oscpSetMessage("Names must be different.");
    return;
  }

  if (oscpPlayers.length >= oscpMaxPlayers) {
    oscpSetMessage("Field is full.");
    return;
  }

  oscpPlayers.push(player);
  oscpPlayerName.value = "";
  oscpSetMessage(oscpPlayers.length === oscpMaxPlayers ? "Field is full. Ready to race." : "Runner added.");
  oscpRenderPlayers();
  oscpPlayerName.focus();
}

function oscpShowResults() {
  oscpClassificationList.replaceChildren();
  oscpResults.forEach((player) => {
    const item = document.createElement("li");
    item.textContent = player;
    oscpClassificationList.append(item);
  });
  oscpResultsPanel.hidden = false;
}

function oscpFinishRace() {
  oscpRacing = false;
  oscpRaceStatus.textContent = "Race complete";
  oscpShowResults();
}

function oscpStartAnimation(runners, finishDistance) {
  let previousTime = 0;

  function oscpRaceFrame(timestamp) {
    if (!previousTime) previousTime = timestamp;
    const elapsedSeconds = (timestamp - previousTime) / 1000;
    previousTime = timestamp;

    runners.forEach((runner) => {
      if (runner.finished) return;
      runner.position += runner.speed * elapsedSeconds;

      if (runner.position >= finishDistance) {
        runner.position = finishDistance;
        runner.finished = true;
        runner.element.classList.add("finished");
        oscpResults.push(runner.name);
      }

      runner.element.style.transform = `translateX(${runner.position}px)`;
    });

    if (oscpResults.length === runners.length) {
      oscpFinishRace();
      return;
    }

    requestAnimationFrame(oscpRaceFrame);
  }

  requestAnimationFrame(oscpRaceFrame);
}

function oscpStartRace() {
  if (oscpPlayers.length < oscpMinPlayers || oscpRacing) return;

  oscpRacing = true;
  oscpResults = [];
  oscpResultsPanel.hidden = true;
  oscpRaceStatus.textContent = "Racing";
  oscpSetMessage("Race in progress.");
  oscpRenderPlayers();

  const firstLane = oscpRaceTrack.querySelector(".lane");
  const firstHorse = oscpRaceTrack.querySelector(".horse");
  const finishLine = oscpRaceTrack.querySelector(".finish-line");
  const finishDistance = Math.max(0, finishLine.offsetLeft - firstHorse.offsetLeft - firstHorse.offsetWidth - 8);
  const runners = oscpPlayers.map((name, index) => ({
    name,
    element: oscpRaceTrack.querySelector(`.horse[data-index="${index}"]`),
    position: 0,
    speed: 75 + Math.random() * 50,
    finished: false
  }));

  if (!firstLane || !finishDistance) return;
  oscpStartAnimation(runners, finishDistance);
}

oscpPlayerForm.addEventListener("submit", oscpAddPlayer);
oscpStartRaceButton.addEventListener("click", oscpStartRace);
oscpRenderPlayers();