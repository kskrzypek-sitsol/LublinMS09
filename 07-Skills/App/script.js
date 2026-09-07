"use strict";

const oscpPlayerForm = document.querySelector("#player-form");
const oscpPlayerNameInput = document.querySelector("#player-name");
const oscpAddPlayerButton = document.querySelector("#add-player");
const oscpPlayerList = document.querySelector("#player-list");
const oscpPlayerCount = document.querySelector("#player-count");
const oscpFormMessage = document.querySelector("#form-message");
const oscpStartButton = document.querySelector("#start-race");
const oscpRaceTrack = document.querySelector("#race-track");
const oscpRaceStatus = document.querySelector("#race-status");
const oscpResults = document.querySelector("#results");
const oscpClassification = document.querySelector("#classification");

const oscpMinimumPlayers = 2;
const oscpMaximumPlayers = 8;
const oscpStartProgress = 7;
const oscpFinishProgress = 92;
const oscpPlayers = [];
const oscpFinishingOrder = [];
let oscpNextPlayerId = 1;
let oscpRaceStarted = false;
let oscpLastFrameTime = 0;

function oscpSetMessage(message, isError) {
    oscpFormMessage.textContent = message;
    oscpFormMessage.classList.toggle("error", isError);
}

function oscpCreatePlayer(name) {
    const player = {
        id: oscpNextPlayerId,
        name,
        progress: oscpStartProgress,
        baseSpeed: 0,
        finished: false
    };

    oscpNextPlayerId += 1;
    return player;
}

function oscpRenderRoster() {
    oscpPlayerList.replaceChildren();

    for (const player of oscpPlayers) {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const removeButton = document.createElement("button");

        item.className = "player-chip";
        name.textContent = player.name;
        removeButton.className = "remove-player";
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.dataset.playerId = String(player.id);
        removeButton.setAttribute("aria-label", `Remove ${player.name}`);
        removeButton.addEventListener("click", oscpRemovePlayer);
        item.append(name, removeButton);
        oscpPlayerList.append(item);
    }

    oscpPlayerCount.textContent = String(oscpPlayers.length);
    oscpStartButton.disabled = oscpPlayers.length < oscpMinimumPlayers || oscpRaceStarted;
    oscpAddPlayerButton.disabled = oscpPlayers.length >= oscpMaximumPlayers || oscpRaceStarted;
    oscpPlayerNameInput.disabled = oscpPlayers.length >= oscpMaximumPlayers || oscpRaceStarted;
}

function oscpCreateLane(player, laneNumber) {
    const lane = document.createElement("div");
    const horse = document.createElement("div");
    const horseIcon = document.createElement("span");
    const horseName = document.createElement("span");

    lane.className = "lane";
    lane.dataset.lane = `LANE ${laneNumber}`;
    horse.className = "horse";
    horse.id = `horse-${player.id}`;
    horse.style.setProperty("--progress", String(player.progress));
    horseIcon.className = "horse-icon";
    horseIcon.textContent = "🐎";
    horseIcon.setAttribute("aria-hidden", "true");
    horseName.className = "horse-name";
    horseName.textContent = player.name;
    horse.append(horseIcon, horseName);
    lane.append(horse);
    return lane;
}

function oscpRenderTrack() {
    oscpRaceTrack.replaceChildren();
    oscpRaceTrack.classList.toggle("empty", oscpPlayers.length === 0);

    if (oscpPlayers.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-track-message";
        emptyMessage.innerHTML = '<span aria-hidden="true">♞</span><p>Added players appear here.</p>';
        oscpRaceTrack.append(emptyMessage);
        return;
    }

    for (let index = 0; index < oscpPlayers.length; index += 1) {
        oscpRaceTrack.append(oscpCreateLane(oscpPlayers[index], index + 1));
    }
}

function oscpHandlePlayerSubmit(event) {
    event.preventDefault();

    const name = oscpPlayerNameInput.value.trim();
    if (oscpRaceStarted) {
        return;
    }
    if (!name) {
        oscpSetMessage("Enter a player name.", true);
        oscpPlayerNameInput.focus();
        return;
    }
    if (oscpPlayers.length >= oscpMaximumPlayers) {
        oscpSetMessage("The field is full with 8 players.", true);
        return;
    }

    oscpPlayers.push(oscpCreatePlayer(name));
    oscpPlayerNameInput.value = "";
    oscpRenderRoster();
    oscpRenderTrack();

    if (oscpPlayers.length === oscpMaximumPlayers) {
        oscpSetMessage("Field full. Ready to race.", false);
        oscpStartButton.focus();
    } else if (oscpPlayers.length >= oscpMinimumPlayers) {
        oscpSetMessage("Ready to race, or add another player.", false);
        oscpPlayerNameInput.focus();
    } else {
        oscpSetMessage("Add 1 more player to race.", false);
        oscpPlayerNameInput.focus();
    }
}

function oscpRemovePlayer(event) {
    if (oscpRaceStarted) {
        return;
    }

    const playerId = Number(event.currentTarget.dataset.playerId);
    const playerIndex = oscpPlayers.findIndex(oscpFindPlayerById.bind(null, playerId));
    if (playerIndex >= 0) {
        oscpPlayers.splice(playerIndex, 1);
    }

    oscpRenderRoster();
    oscpRenderTrack();
    oscpSetMessage(
        oscpPlayers.length >= oscpMinimumPlayers ? "Ready to race, or add another player." : `Add ${oscpMinimumPlayers - oscpPlayers.length} more player${oscpPlayers.length === 0 ? "s" : ""} to race.`,
        false
    );
    oscpPlayerNameInput.focus();
}

function oscpFindPlayerById(playerId, player) {
    return player.id === playerId;
}

function oscpGetRandomSpeed() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimumSpeed = reducedMotion ? 38 : 10;
    const speedRange = reducedMotion ? 12 : 7;
    return minimumSpeed + Math.random() * speedRange;
}

function oscpLockSetup() {
    oscpRenderRoster();
    const removeButtons = oscpPlayerList.querySelectorAll(".remove-player");
    for (const removeButton of removeButtons) {
        removeButton.disabled = true;
    }
}

function oscpStartRace() {
    if (oscpRaceStarted || oscpPlayers.length < oscpMinimumPlayers) {
        oscpSetMessage("Add at least 2 players to start.", true);
        return;
    }

    oscpRaceStarted = true;
    oscpFinishingOrder.length = 0;
    oscpLastFrameTime = 0;
    oscpLockSetup();
    oscpSetMessage("Setup locked. Race in progress.", false);
    oscpRaceStatus.textContent = "Race in progress";

    for (const player of oscpPlayers) {
        player.baseSpeed = oscpGetRandomSpeed();
        player.finished = false;
        const horse = document.querySelector(`#horse-${player.id}`);
        horse.classList.add("running");
    }

    window.requestAnimationFrame(oscpRaceFrame);
}

function oscpUpdatePlayer(player, elapsedSeconds, timestamp, frameDuration) {
    const variation = 0.78 + Math.random() * 0.44;
    const previousProgress = player.progress;
    const movement = player.baseSpeed * variation * elapsedSeconds;
    const nextProgress = previousProgress + movement;

    player.progress = Math.min(nextProgress, oscpFinishProgress);
    const horse = document.querySelector(`#horse-${player.id}`);
    horse.style.setProperty("--progress", String(player.progress));

    if (nextProgress >= oscpFinishProgress && !player.finished) {
        const crossingRatio = movement > 0 ? (oscpFinishProgress - previousProgress) / movement : 1;
        return {
            player,
            crossingTime: timestamp - frameDuration + crossingRatio * frameDuration
        };
    }

    return null;
}

function oscpRecordFinisher(finishRecord) {
    const player = finishRecord.player;
    if (player.finished) {
        return;
    }

    player.finished = true;
    oscpFinishingOrder.push(player);
    const horse = document.querySelector(`#horse-${player.id}`);
    horse.classList.remove("running");
    horse.classList.add("finished");
    oscpRaceStatus.textContent = `${oscpFinishingOrder.length} of ${oscpPlayers.length} finished`;
}

function oscpCompareFinishTimes(firstRecord, secondRecord) {
    return firstRecord.crossingTime - secondRecord.crossingTime;
}

function oscpRaceFrame(timestamp) {
    if (oscpLastFrameTime === 0) {
        oscpLastFrameTime = timestamp;
    }

    const frameDuration = Math.min(timestamp - oscpLastFrameTime, 80);
    const elapsedSeconds = frameDuration / 1000;
    const newFinishers = [];
    oscpLastFrameTime = timestamp;

    for (const player of oscpPlayers) {
        if (!player.finished) {
            const finishRecord = oscpUpdatePlayer(player, elapsedSeconds, timestamp, frameDuration);
            if (finishRecord) {
                newFinishers.push(finishRecord);
            }
        }
    }

    newFinishers.sort(oscpCompareFinishTimes);
    for (const finishRecord of newFinishers) {
        oscpRecordFinisher(finishRecord);
    }

    if (oscpFinishingOrder.length === oscpPlayers.length) {
        oscpFinishRace();
        return;
    }

    window.requestAnimationFrame(oscpRaceFrame);
}

function oscpRenderClassification() {
    oscpClassification.replaceChildren();

    for (const player of oscpFinishingOrder) {
        const item = document.createElement("li");
        item.textContent = player.name;
        oscpClassification.append(item);
    }
}

function oscpFinishRace() {
    oscpRenderClassification();
    oscpRaceStatus.textContent = "Race complete";
    oscpResults.hidden = false;
    oscpResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

oscpPlayerForm.addEventListener("submit", oscpHandlePlayerSubmit);
oscpStartButton.addEventListener("click", oscpStartRace);
oscpRenderRoster();
oscpRenderTrack();