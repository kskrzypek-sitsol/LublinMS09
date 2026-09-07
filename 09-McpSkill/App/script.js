"use strict";

const oscpPlayers = [];
const oscpHorses = [];
const oscpFinishOrder = [];
const oscpHorseColors = ["#a94d3f", "#77553d", "#d58c47", "#3f4c42", "#766178", "#9a6a36"];
const oscpSilkColors = ["#f4ce46", "#5bb9c9", "#e86552", "#f6f2d5", "#efafcc", "#b5d767"];
const oscpPlayerForm = document.querySelector("#player-form");
const oscpPlayerNameInput = document.querySelector("#player-name");
const oscpAddPlayerButton = document.querySelector("#add-player");
const oscpPlayerList = document.querySelector("#player-list");
const oscpEntryMessage = document.querySelector("#entry-message");
const oscpStartButton = document.querySelector("#start-race");
const oscpTrack = document.querySelector("#track");
const oscpRaceTitle = document.querySelector("#race-title");
const oscpRaceStatus = document.querySelector("#race-status");
const oscpClassification = document.querySelector("#classification");
const oscpClassificationList = document.querySelector("#classification-list");
let oscpRaceActive = false;
let oscpLastFrameTime = 0;

function oscpSetEntryMessage(message) {
    oscpEntryMessage.textContent = message;
}

function oscpRenderPlayers() {
    oscpPlayerList.replaceChildren();

    for (const oscpPlayer of oscpPlayers) {
        const oscpItem = document.createElement("li");
        oscpItem.className = "player-chip";
        oscpItem.textContent = oscpPlayer;
        oscpPlayerList.append(oscpItem);
    }

    oscpStartButton.disabled = oscpPlayers.length < 2;
}

function oscpAddPlayer(event) {
    event.preventDefault();
    const oscpName = oscpPlayerNameInput.value.trim();

    if (!oscpName) {
        oscpSetEntryMessage("Enter a player name first.");
        oscpPlayerNameInput.focus();
        return;
    }

    if (oscpPlayers.length === 6) {
        oscpSetEntryMessage("The field is full at 6 players.");
        return;
    }

    if (oscpPlayers.some(oscpIsMatchingPlayer.bind(null, oscpName))) {
        oscpSetEntryMessage("Each runner needs a different name.");
        oscpPlayerNameInput.select();
        return;
    }

    oscpPlayers.push(oscpName);
    oscpPlayerNameInput.value = "";
    oscpSetEntryMessage(oscpPlayers.length < 2 ? "Add one more player to open the gates." : `${oscpPlayers.length} runners ready for the starting gates.`);
    oscpRenderPlayers();
    oscpPlayerNameInput.focus();
}

function oscpIsMatchingPlayer(name, player) {
    return player.toLowerCase() === name.toLowerCase();
}

function oscpCreateHorse(player, index) {
    return {
        player,
        color: oscpHorseColors[index],
        silkColor: oscpSilkColors[index],
        progress: 0,
        speed: 14 + Math.random() * 9,
        finished: false,
        element: null
    };
}

function oscpRenderTrack() {
    oscpTrack.replaceChildren();

    for (const oscpHorse of oscpHorses) {
        const oscpLane = document.createElement("div");
        const oscpName = document.createElement("span");
        const oscpFinishLine = document.createElement("span");
        const oscpHorseElement = document.createElement("div");
        const oscpBody = document.createElement("span");
        const oscpHead = document.createElement("span");
        const oscpEar = document.createElement("span");
        const oscpTail = document.createElement("span");
        const oscpLegOne = document.createElement("span");
        const oscpLegTwo = document.createElement("span");
        const oscpSilk = document.createElement("span");

        oscpLane.className = "lane";
        oscpName.className = "lane-name";
        oscpName.textContent = oscpHorse.player;
        oscpFinishLine.className = "finish-line";
        oscpHorseElement.className = "horse";
        oscpHorseElement.style.setProperty("--horse-color", oscpHorse.color);
        oscpHorseElement.style.setProperty("--silk-color", oscpHorse.silkColor);
        oscpBody.className = "horse-body";
        oscpHead.className = "horse-head";
        oscpEar.className = "horse-ear";
        oscpTail.className = "horse-tail";
        oscpLegOne.className = "horse-leg horse-leg-one";
        oscpLegTwo.className = "horse-leg horse-leg-two";
        oscpSilk.className = "horse-silk";
        oscpHorseElement.append(oscpBody, oscpHead, oscpEar, oscpTail, oscpLegOne, oscpLegTwo, oscpSilk);
        oscpLane.append(oscpName, oscpFinishLine, oscpHorseElement);
        oscpTrack.append(oscpLane);
        oscpHorse.element = oscpHorseElement;
    }
}

function oscpStartRace() {
    if (oscpPlayers.length < 2 || oscpRaceActive) {
        return;
    }

    oscpRaceActive = true;
    oscpLastFrameTime = 0;
    oscpFinishOrder.splice(0);
    oscpHorses.splice(0);
    oscpClassification.hidden = true;
    oscpClassificationList.replaceChildren();

    for (let oscpIndex = 0; oscpIndex < oscpPlayers.length; oscpIndex += 1) {
        oscpHorses.push(oscpCreateHorse(oscpPlayers[oscpIndex], oscpIndex));
    }

    oscpPlayerNameInput.disabled = true;
    oscpAddPlayerButton.disabled = true;
    oscpStartButton.disabled = true;
    oscpRaceTitle.textContent = "They're off!";
    oscpRaceStatus.textContent = "Every stride counts";
    oscpRenderTrack();
    requestAnimationFrame(oscpAnimateRace);
}

function oscpAnimateRace(timestamp) {
    if (!oscpLastFrameTime) {
        oscpLastFrameTime = timestamp;
    }

    const oscpElapsedSeconds = Math.min((timestamp - oscpLastFrameTime) / 1000, 0.05);
    oscpLastFrameTime = timestamp;

    for (const oscpHorse of oscpHorses) {
        if (!oscpHorse.finished) {
            oscpHorse.progress += oscpHorse.speed * oscpElapsedSeconds;
            if (oscpHorse.progress >= 100) {
                oscpHorse.progress = 100;
                oscpFinishHorse(oscpHorse);
            }
            oscpUpdateHorsePosition(oscpHorse);
        }
    }

    if (oscpFinishOrder.length === oscpHorses.length) {
        oscpCompleteRace();
        return;
    }

    requestAnimationFrame(oscpAnimateRace);
}

function oscpUpdateHorsePosition(horse) {
    const oscpTrackDistance = 80;
    horse.element.style.left = `${4 + (horse.progress / 100) * oscpTrackDistance}%`;
    if (!horse.finished) {
        horse.element.classList.add("running");
    }
}

function oscpFinishHorse(horse) {
    horse.finished = true;
    oscpFinishOrder.push(horse.player);
    horse.element.classList.remove("running");
    horse.element.classList.add("finished");
    oscpRaceStatus.textContent = `${oscpFinishOrder.length} of ${oscpHorses.length} horses finished`;
}

function oscpCompleteRace() {
    oscpRaceActive = false;
    oscpRaceTitle.textContent = "Photo finish complete";
    oscpRaceStatus.textContent = "Official results are in";
    oscpRenderClassification();
}

function oscpRenderClassification() {
    oscpClassificationList.replaceChildren();

    for (const oscpPlayer of oscpFinishOrder) {
        const oscpItem = document.createElement("li");
        oscpItem.textContent = oscpPlayer;
        oscpClassificationList.append(oscpItem);
    }

    oscpClassification.hidden = false;
    oscpClassification.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

oscpPlayerForm.addEventListener("submit", oscpAddPlayer);
oscpStartButton.addEventListener("click", oscpStartRace);