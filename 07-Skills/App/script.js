const oscpPlayers = [];
const oscpRaceState = [];
const oscpFinishOrder = [];
const oscpPlayerForm = document.querySelector("#player-form");
const oscpPlayerNameInput = document.querySelector("#player-name");
const oscpAddPlayerButton = document.querySelector("#add-player");
const oscpPlayerList = document.querySelector("#player-list");
const oscpSetupMessage = document.querySelector("#setup-message");
const oscpStartButton = document.querySelector("#start-race");
const oscpRaceStatus = document.querySelector("#race-status");
const oscpRaceTrack = document.querySelector("#race-track");
const oscpResultsSection = document.querySelector("#results-section");
const oscpResultsList = document.querySelector("#results-list");
let oscpRaceActive = false;

function oscpShowMessage(message) {
    oscpSetupMessage.textContent = message;
}

function oscpRenderPlayers() {
    oscpPlayerList.replaceChildren();
    oscpPlayers.forEach((player, index) => {
        const oscpListItem = document.createElement("li");
        const oscpName = document.createElement("span");
        const oscpRemoveButton = document.createElement("button");
        oscpName.textContent = player;
        oscpRemoveButton.type = "button";
        oscpRemoveButton.className = "remove-player";
        oscpRemoveButton.textContent = "x";
        oscpRemoveButton.setAttribute("aria-label", `Remove ${player}`);
        oscpRemoveButton.dataset.playerIndex = index;
        oscpRemoveButton.addEventListener("click", oscpRemovePlayer);
        oscpListItem.append(oscpName, oscpRemoveButton);
        oscpPlayerList.append(oscpListItem);
    });
    oscpStartButton.disabled = oscpPlayers.length < 2;
    oscpRaceStatus.textContent = oscpPlayers.length < 2 ? "Add at least two players to start." : `${oscpPlayers.length} horses ready at the gate.`;
}

function oscpAddPlayer(event) {
    event.preventDefault();
    const oscpName = oscpPlayerNameInput.value.trim();
    if (!oscpName) {
        oscpShowMessage("Enter a rider name.");
        return;
    }
    if (oscpPlayers.some((player) => player.toLowerCase() === oscpName.toLowerCase())) {
        oscpShowMessage("Each rider needs a unique name.");
        return;
    }
    if (oscpPlayers.length === 6) {
        oscpShowMessage("The field is full: six riders maximum.");
        return;
    }
    oscpPlayers.push(oscpName);
    oscpPlayerNameInput.value = "";
    oscpShowMessage("");
    oscpRenderPlayers();
    oscpPlayerNameInput.focus();
}

function oscpRemovePlayer(event) {
    const oscpIndex = Number(event.currentTarget.dataset.playerIndex);
    oscpPlayers.splice(oscpIndex, 1);
    oscpShowMessage("");
    oscpRenderPlayers();
}

function oscpRenderTrack() {
    oscpRaceTrack.replaceChildren();
    oscpRaceState.forEach((horse, index) => {
        const oscpLane = document.createElement("div");
        const oscpHorse = document.createElement("div");
        const oscpIcon = document.createElement("span");
        const oscpLabel = document.createElement("span");
        oscpLane.className = "lane";
        oscpHorse.className = "horse";
        oscpHorse.id = `horse-${index}`;
        oscpIcon.className = "horse-icon";
        oscpIcon.textContent = "🐎";
        oscpLabel.textContent = horse.name;
        oscpHorse.append(oscpIcon, oscpLabel);
        oscpLane.append(oscpHorse);
        oscpRaceTrack.append(oscpLane);
    });
}

function oscpUpdateHorsePositions() {
    oscpRaceState.forEach((horse, index) => {
        const oscpHorseElement = document.querySelector(`#horse-${index}`);
        const oscpPosition = Math.min(horse.progress, 88);
        oscpHorseElement.style.transform = `translateX(${oscpPosition}%)`;
        if (horse.finished) {
            oscpHorseElement.classList.add("is-finished");
        }
    });
}

function oscpFinishHorse(horse) {
    horse.finished = true;
    horse.progress = 100;
    oscpFinishOrder.push(horse.name);
}

function oscpRunRace() {
    oscpRaceState.forEach((horse) => {
        if (horse.finished) {
            return;
        }
        horse.progress += horse.speed * (0.55 + Math.random() * 0.9);
        if (horse.progress >= 100) {
            oscpFinishHorse(horse);
        }
    });
    oscpUpdateHorsePositions();
    if (oscpFinishOrder.length === oscpRaceState.length) {
        oscpCompleteRace();
        return;
    }
    window.requestAnimationFrame(oscpRunRace);
}

function oscpRenderClassification() {
    oscpResultsList.replaceChildren();
    oscpFinishOrder.forEach((player) => {
        const oscpResult = document.createElement("li");
        oscpResult.textContent = player;
        oscpResultsList.append(oscpResult);
    });
    oscpResultsSection.hidden = false;
}

function oscpCompleteRace() {
    oscpRaceActive = false;
    oscpRaceStatus.textContent = "Photo finish complete.";
    oscpRenderClassification();
}

function oscpStartRace() {
    if (oscpRaceActive || oscpPlayers.length < 2) {
        return;
    }
    oscpRaceActive = true;
    oscpFinishOrder.length = 0;
    oscpRaceState.length = 0;
    oscpPlayers.forEach((player) => {
        oscpRaceState.push({ name: player, progress: 0, speed: 0.11 + Math.random() * 0.1, finished: false });
    });
    oscpResultsSection.hidden = true;
    oscpStartButton.disabled = true;
    oscpAddPlayerButton.disabled = true;
    oscpPlayerNameInput.disabled = true;
    document.querySelectorAll(".remove-player").forEach((button) => {
        button.disabled = true;
    });
    oscpRaceStatus.textContent = "They are off!";
    oscpRenderTrack();
    window.requestAnimationFrame(oscpRunRace);
}

oscpPlayerForm.addEventListener("submit", oscpAddPlayer);