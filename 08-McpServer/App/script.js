const oscpPlayers = [];
const oscpMaxPlayers = 6;
let oscpRaceActive = false;
let oscpFinishOrder = [];
let oscpAnimationFrame = null;

const oscpPlayerName = document.querySelector("#player-name");
const oscpAddPlayerButton = document.querySelector("#add-player");
const oscpStartRaceButton = document.querySelector("#start-race");
const oscpPlayerList = document.querySelector("#player-list");
const oscpInputMessage = document.querySelector("#input-message");
const oscpTrack = document.querySelector("#track");
const oscpEmptyTrack = document.querySelector("#empty-track");
const oscpRaceStatus = document.querySelector("#race-status");
const oscpResults = document.querySelector("#results");
const oscpClassification = document.querySelector("#classification");

function oscpRenderPlayers() {
  oscpPlayerList.innerHTML = "";
  oscpPlayers.forEach((player, index) => {
    const item = document.createElement("li");
    item.className = "player-chip";
    item.innerHTML = `<span>${player.name}</span><button class="remove-player" type="button" aria-label="Remove ${player.name}" data-index="${index}">×</button>`;
    oscpPlayerList.append(item);
  });

  oscpStartRaceButton.disabled = oscpPlayers.length < 2;
  oscpAddPlayerButton.disabled = oscpPlayers.length >= oscpMaxPlayers;
  oscpPlayerName.disabled = oscpPlayers.length >= oscpMaxPlayers;
  oscpInputMessage.textContent = oscpPlayers.length >= oscpMaxPlayers
    ? "Field complete. Ready at the gates."
    : `Add ${Math.max(0, 2 - oscpPlayers.length)} more player${oscpPlayers.length === 1 ? "" : "s"} to begin.`;
}

function oscpAddPlayer() {
  const name = oscpPlayerName.value.trim();
  if (!name || oscpRaceActive || oscpPlayers.length >= oscpMaxPlayers) return;

  if (oscpPlayers.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    oscpInputMessage.textContent = "Each rider needs a unique name.";
    return;
  }

  oscpPlayers.push({ name });
  oscpPlayerName.value = "";
  oscpRenderPlayers();
  oscpPlayerName.focus();
}

function oscpRemovePlayer(event) {
  const button = event.target.closest(".remove-player");
  if (!button || oscpRaceActive) return;
  oscpPlayers.splice(Number(button.dataset.index), 1);
  oscpRenderPlayers();
}

function oscpCreateTrack() {
  oscpTrack.querySelectorAll(".lane").forEach((lane) => lane.remove());
  oscpEmptyTrack.hidden = true;
  oscpPlayers.forEach((player) => {
    const lane = document.createElement("div");
    lane.className = "lane";
    lane.innerHTML = `<div class="horse" data-player="${player.name}"><span class="horse-icon" aria-hidden="true">♞</span><span class="horse-name">${player.name}</span></div>`;
    oscpTrack.append(lane);
  });
  oscpTrack.style.minHeight = `${Math.max(250, oscpPlayers.length * 55)}px`;
}

function oscpStartRace() {
  if (oscpPlayers.length < 2 || oscpRaceActive) return;
  oscpRaceActive = true;
  oscpFinishOrder = [];
  oscpResults.hidden = true;
  oscpClassification.innerHTML = "";
  oscpStartRaceButton.disabled = true;
  oscpAddPlayerButton.disabled = true;
  oscpPlayerName.disabled = true;
  oscpRaceStatus.textContent = "They are off.";
  oscpCreateTrack();

  const finishLine = oscpTrack.querySelector(".finish-line");
  const finishPoint = finishLine.offsetLeft - 48;
  const racers = oscpPlayers.map((player) => ({
    name: player.name,
    position: 10,
    speed: 0.55 + Math.random() * 0.6,
    finished: false,
    element: oscpTrack.querySelector(`[data-player="${CSS.escape(player.name)}"]`)
  }));
  let previousTime = performance.now();

  function oscpAdvanceRace(now) {
    const elapsed = Math.min(now - previousTime, 40);
    previousTime = now;
    racers.forEach((racer) => {
      if (racer.finished) return;
      racer.speed += (Math.random() - 0.46) * 0.08;
      racer.speed = Math.max(0.35, Math.min(racer.speed, 1.3));
      racer.position += racer.speed * elapsed / 16;
      if (racer.position >= finishPoint) {
        racer.position = finishPoint;
        racer.finished = true;
        racer.element.classList.add("finished");
        oscpFinishOrder.push(racer.name);
        oscpRaceStatus.textContent = `${racer.name} finishes #${oscpFinishOrder.length}`;
      }
      racer.element.style.left = `${racer.position}px`;
    });

    if (oscpFinishOrder.length === racers.length) {
      oscpFinishRace();
      return;
    }
    oscpAnimationFrame = requestAnimationFrame(oscpAdvanceRace);
  }

  oscpAnimationFrame = requestAnimationFrame(oscpAdvanceRace);
}

function oscpFinishRace() {
  cancelAnimationFrame(oscpAnimationFrame);
  oscpRaceActive = false;
  oscpRaceStatus.textContent = "Official result";
  oscpFinishOrder.forEach((name) => {
    const item = document.createElement("li");
    item.textContent = name;
    oscpClassification.append(item);
  });
  oscpResults.hidden = false;
}

oscpAddPlayerButton.addEventListener("click", oscpAddPlayer);
oscpPlayerName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") oscpAddPlayer();
});
oscpPlayerList.addEventListener("click", oscpRemovePlayer);
oscpStartRaceButton.addEventListener("click", oscpStartRace);
oscpRenderPlayers();