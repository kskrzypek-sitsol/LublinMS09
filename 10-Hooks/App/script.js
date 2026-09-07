"use strict";

const oscpPlayerNameInput = document.querySelector("#player-name");
const oscpAddPlayerButton = document.querySelector("#add-player");
const oscpStartRaceButton = document.querySelector("#start-race");
const oscpPlayerList = document.querySelector("#player-list");
const oscpPlayerMessage = document.querySelector("#player-message");
const oscpRaceTrack = document.querySelector("#race-track");
const oscpResultsPanel = document.querySelector("#results-panel");
const oscpClassification = document.querySelector("#classification");
const oscpMaximumPlayers = 6;
let oscpPlayers = [];
let oscpRaceActive = false;

function oscpRenderPlayers() {
  oscpPlayerList.replaceChildren();

  oscpPlayers.forEach((player) => {
    const playerItem = document.createElement("li");
    playerItem.className = "player-chip";
    playerItem.textContent = player.name;
    oscpPlayerList.append(playerItem);
  });

  const ready = oscpPlayers.length >= 2;
  oscpStartRaceButton.disabled = !ready;
  oscpAddPlayerButton.disabled = oscpPlayers.length === oscpMaximumPlayers;
  oscpPlayerNameInput.disabled = oscpPlayers.length === oscpMaximumPlayers;
  oscpPlayerMessage.textContent = ready
    ? `${oscpPlayers.length} racers ready. Open the gates.`
    : "Add 2 to 6 players to open the gates.";
}

function oscpRenderTrack() {
  oscpRaceTrack.replaceChildren();

  if (oscpPlayers.length === 0) {
    const emptyTrack = document.createElement("p");
    emptyTrack.className = "track-empty";
    emptyTrack.textContent = "Add your racers. The turf awaits.";
    oscpRaceTrack.append(emptyTrack);
    return;
  }

  oscpPlayers.forEach((player) => {
    const lane = document.createElement("div");
    const horse = document.createElement("div");
    const horseIcon = document.createElement("span");
    const horseName = document.createElement("span");

    lane.className = "lane";
    horse.className = "horse";
    horse.dataset.playerId = player.id;
    horseIcon.className = "horse-icon";
    horseIcon.textContent = "♞";
    horseName.className = "horse-name";
    horseName.textContent = player.name;
    horse.append(horseIcon, horseName);
    lane.append(horse);
    oscpRaceTrack.append(lane);
  });
}

function oscpAddPlayer() {
  const name = oscpPlayerNameInput.value.trim();

  if (!name) {
    oscpPlayerMessage.textContent = "Enter a player name first.";
    oscpPlayerNameInput.focus();
    return;
  }

  if (oscpPlayers.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    oscpPlayerMessage.textContent = "That player is already in the race.";
    return;
  }

  oscpPlayers.push({ id: crypto.randomUUID(), name });
  oscpPlayerNameInput.value = "";
  oscpRenderPlayers();
  oscpRenderTrack();
  oscpPlayerNameInput.focus();
}

function oscpShowClassification(finishingOrder) {
  oscpClassification.replaceChildren();
  finishingOrder.forEach((player) => {
    const result = document.createElement("li");
    result.textContent = player.name;
    oscpClassification.append(result);
  });
  oscpResultsPanel.hidden = false;
  oscpResultsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function oscpRunRace() {
  if (oscpRaceActive || oscpPlayers.length < 2) return;

  oscpRaceActive = true;
  oscpStartRaceButton.disabled = true;
  oscpAddPlayerButton.disabled = true;
  oscpPlayerNameInput.disabled = true;
  oscpResultsPanel.hidden = true;

  const finishDistance = oscpRaceTrack.clientWidth - 112;
  const racers = oscpPlayers.map((player) => ({
    ...player,
    position: 0,
    speed: 0.8 + Math.random() * 1.2,
    finished: false
  }));
  const finishingOrder = [];
  const horses = new Map(
    [...oscpRaceTrack.querySelectorAll(".horse")].map((horse) => [horse.dataset.playerId, horse])
  );

  horses.forEach((horse) => horse.classList.add("running"));

  function oscpAnimateRace() {
    racers.forEach((racer) => {
      if (racer.finished) return;

      racer.position += racer.speed * (0.55 + Math.random() * 0.85);
      const horse = horses.get(racer.id);
      horse.style.transform = `translateX(${Math.min(racer.position, finishDistance)}px)`;

      if (racer.position >= finishDistance) {
        racer.finished = true;
        horse.classList.remove("running");
        finishingOrder.push(racer);
      }
    });

    if (finishingOrder.length === racers.length) {
      oscpRaceActive = false;
      oscpPlayerMessage.textContent = "Race complete. Official result below.";
      oscpShowClassification(finishingOrder);
      return;
    }

    requestAnimationFrame(oscpAnimateRace);
  }

  requestAnimationFrame(oscpAnimateRace);
}

oscpAddPlayerButton.addEventListener("click", oscpAddPlayer);
oscpStartRaceButton.addEventListener("click", oscpRunRace);
oscpPlayerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !oscpAddPlayerButton.disabled) oscpAddPlayer();
});

oscpRenderPlayers();
oscpRenderTrack();