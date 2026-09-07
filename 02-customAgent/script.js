const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const HORSE_DISPLAY_WIDTH = 90;

const HORSE_STYLES = [
    {
        horseName: "Crimson Bolt",
        main: "#ff7b63",
        dark: "#8f3527",
        accent: "#ffd166"
    },
    {
        horseName: "Tidal Flash",
        main: "#72d6ff",
        dark: "#245f87",
        accent: "#d2f2ff"
    },
    {
        horseName: "Emerald Dash",
        main: "#61d0a4",
        dark: "#1d6b55",
        accent: "#eaffc7"
    },
    {
        horseName: "Sunfire Drift",
        main: "#ffb454",
        dark: "#8a4b10",
        accent: "#fff0b0"
    }
];

const DEFAULT_PLAYER_NAMES = ["Avery", "Blake", "Casey", "Devon"];
const LOBBY_MESSAGES = {
    ready: "Add racers and choose names to start the next sprint.",
    countdown: "The field is loaded. Hold steady while the gates prepare to open.",
    racing: "They are running. Watch the lanes for the late charge.",
    results: "The race is official. Review the order, then run it back."
};

const HEADLINE_MESSAGES = {
    lobby: "Waiting at the gate",
    countdown: "Racers to their marks",
    racing: "The gates are open",
    results: "Photo finish complete"
};

const state = {
    stage: "lobby",
    players: [],
    race: [],
    results: [],
    countdownValue: null,
    countdownTimer: null,
    animationFrame: null,
    lastTimestamp: 0,
    raceElapsed: 0,
    laneWidth: 0,
    nextPlayerId: 1
};

const elements = {
    addPlayerButton: document.querySelector("#add-player-button"),
    playerList: document.querySelector("#player-list"),
    startRaceButton: document.querySelector("#start-race-button"),
    statusMessage: document.querySelector("#status-message"),
    headlineMessage: document.querySelector("#headline-message"),
    countdownDisplay: document.querySelector("#countdown-display"),
    trackLanes: document.querySelector("#track-lanes"),
    resultsOverlay: document.querySelector("#results-overlay"),
    resultsTitle: document.querySelector("#results-title"),
    resultsList: document.querySelector("#results-list"),
    playAgainButton: document.querySelector("#play-again-button")
};

bootstrap();

function bootstrap() {
    state.players = [createPlayer(0), createPlayer(1)];

    elements.addPlayerButton.addEventListener("click", handleAddPlayer);
    elements.startRaceButton.addEventListener("click", handleStartRace);
    elements.playAgainButton.addEventListener("click", handlePlayAgain);
    elements.playerList.addEventListener("input", handlePlayerListInput);
    elements.playerList.addEventListener("click", handlePlayerListClick);
    window.addEventListener("resize", handleResize);

    render();
}

function createPlayer(index) {
    const style = HORSE_STYLES[index % HORSE_STYLES.length];

    return {
        id: state.nextPlayerId++,
        name: DEFAULT_PLAYER_NAMES[index] || `Player ${index + 1}`,
        lane: index,
        style
    };
}

function handleAddPlayer() {
    if (state.stage !== "lobby" || state.players.length >= MAX_PLAYERS) {
        return;
    }

    state.players.push(createPlayer(state.players.length));
    resetTrackPreview();
    render();
}

function handlePlayerListInput(event) {
    if (state.stage !== "lobby") {
        return;
    }

    const input = event.target;

    if (!(input instanceof HTMLInputElement) || input.dataset.playerId === undefined) {
        return;
    }

    const player = state.players.find((entry) => String(entry.id) === input.dataset.playerId);

    if (!player) {
        return;
    }

    player.name = input.value;
    renderTrack();
    syncControls();
}

function handlePlayerListClick(event) {
    const button = event.target;

    if (!(button instanceof HTMLButtonElement) || !button.dataset.removePlayerId) {
        return;
    }

    if (state.stage !== "lobby" || state.players.length <= MIN_PLAYERS) {
        return;
    }

    state.players = state.players.filter((player) => String(player.id) !== button.dataset.removePlayerId);
    state.players.forEach((player, index) => {
        player.lane = index;
        player.style = HORSE_STYLES[index % HORSE_STYLES.length];
    });
    resetTrackPreview();
    render();
}

function handleStartRace() {
    if (state.stage !== "lobby" || state.players.length < MIN_PLAYERS) {
        return;
    }

    state.players.forEach((player, index) => {
        const trimmedName = player.name.trim();
        player.name = trimmedName || DEFAULT_PLAYER_NAMES[index] || `Player ${index + 1}`;
    });

    state.stage = "countdown";
    state.results = [];
    state.countdownValue = 3;
    elements.resultsOverlay.classList.add("hidden");
    elements.resultsOverlay.setAttribute("aria-hidden", "true");
    initializeRaceState();
    render();
    beginCountdown();
}

function handlePlayAgain() {
    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
        state.animationFrame = null;
    }

    clearCountdownTimer();
    state.stage = "lobby";
    state.countdownValue = null;
    state.results = [];
    elements.resultsOverlay.classList.add("hidden");
    elements.resultsOverlay.setAttribute("aria-hidden", "true");
    resetTrackPreview();
    render();
}

function initializeRaceState() {
    state.raceElapsed = 0;
    state.lastTimestamp = 0;

    state.race = state.players.map((player, index) => ({
        playerId: player.id,
        progress: 0,
        speed: 0.1 + Math.random() * 0.02,
        targetSpeed: 0.1 + Math.random() * 0.02,
        burstTimer: 0.35 + Math.random() * 0.25,
        baseSpeed: 0.085 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2 + index,
        finished: false,
        finishTime: null,
        rank: null
    }));
}

function beginCountdown() {
    clearCountdownTimer();
    elements.countdownDisplay.textContent = String(state.countdownValue);

    state.countdownTimer = window.setInterval(() => {
        state.countdownValue -= 1;

        if (state.countdownValue > 0) {
            elements.countdownDisplay.textContent = String(state.countdownValue);
            return;
        }

        clearCountdownTimer();
        state.countdownValue = 0;
        elements.countdownDisplay.textContent = "GO";
        state.stage = "racing";
        render();
        state.animationFrame = requestAnimationFrame(runRaceFrame);
    }, 1000);
}

function clearCountdownTimer() {
    if (state.countdownTimer) {
        window.clearInterval(state.countdownTimer);
        state.countdownTimer = null;
    }
}

function runRaceFrame(timestamp) {
    if (state.stage !== "racing") {
        return;
    }

    if (!state.lastTimestamp) {
        state.lastTimestamp = timestamp;
    }

    const deltaTime = Math.min(0.045, (timestamp - state.lastTimestamp) / 1000);
    state.lastTimestamp = timestamp;
    state.raceElapsed += deltaTime;

    const averageProgress = state.race.reduce((sum, racer) => sum + racer.progress, 0) / state.race.length;

    for (const racer of state.race) {
        if (racer.finished) {
            continue;
        }

        racer.burstTimer -= deltaTime;

        if (racer.burstTimer <= 0) {
            const catchUpBoost = Math.max(0, averageProgress - racer.progress) * 0.18;
            const finishKick = racer.progress > 0.78 ? 0.04 + Math.random() * 0.035 : 0;

            racer.targetSpeed = racer.baseSpeed + Math.random() * 0.065 + catchUpBoost + finishKick;
            racer.burstTimer = 0.22 + Math.random() * 0.34;
        }

        racer.speed += (racer.targetSpeed - racer.speed) * Math.min(1, deltaTime * 4.4);

        const previousProgress = racer.progress;
        const nextProgress = Math.min(1, racer.progress + racer.speed * deltaTime);
        racer.progress = nextProgress;

        if (nextProgress >= 1) {
            const progressDelta = nextProgress - previousProgress;
            const finishRatio = progressDelta > 0 ? (1 - previousProgress) / progressDelta : 1;

            racer.finished = true;
            racer.finishTime = state.raceElapsed - deltaTime + deltaTime * finishRatio;
            racer.rank = state.results.length + 1;
            state.results.push({
                playerId: racer.playerId,
                finishTime: racer.finishTime,
                rank: racer.rank
            });
        }
    }

    paintRaceFrame(timestamp);

    if (state.results.length === state.players.length) {
        finishRace();
        return;
    }

    state.animationFrame = requestAnimationFrame(runRaceFrame);
}

function finishRace() {
    state.stage = "results";
    state.animationFrame = null;
    elements.countdownDisplay.textContent = "--";
    populateResults();
    render();
    elements.resultsOverlay.classList.remove("hidden");
    elements.resultsOverlay.setAttribute("aria-hidden", "false");
}

function populateResults() {
    const firstPlace = getPlayerById(state.results[0]?.playerId);
    const winnerName = firstPlace ? firstPlace.name : "The winner";

    elements.resultsTitle.textContent = `${winnerName} takes the sprint`;
    elements.resultsList.innerHTML = "";

    state.results
        .slice()
        .sort((left, right) => left.rank - right.rank)
        .forEach((result) => {
            const player = getPlayerById(result.playerId);

            if (!player) {
                return;
            }

            const item = document.createElement("li");
            item.className = "results-item";
            item.innerHTML = `
                <div class="results-rank">${result.rank}</div>
                <div class="results-player">
                    <strong>${escapeHtml(player.name)}</strong>
                    <span>${player.style.horseName}</span>
                </div>
                <div class="results-time">${formatSeconds(result.finishTime)}</div>
            `;
            elements.resultsList.appendChild(item);
        });
}

function handleResize() {
    if (state.stage === "racing") {
        paintRaceFrame(performance.now());
        return;
    }

    renderTrack();
}

function paintRaceFrame(timestamp) {
    const leaderId = getLeaderId();
    const runwayWidth = getRunwayWidth();

    for (const racer of state.race) {
        const lane = elements.trackLanes.querySelector(`[data-lane-player-id="${racer.playerId}"]`);

        if (!lane) {
            continue;
        }

        const horse = lane.querySelector(".horse");
        const distance = lane.querySelector(".distance-readout");

        if (!(horse instanceof HTMLElement) || !(distance instanceof HTMLElement)) {
            continue;
        }

        const bob = Math.sin(timestamp / 70 + racer.phase) * 2.5;
        const travel = Math.max(0, runwayWidth * racer.progress);
        horse.style.transform = `translateX(${travel}px) translateY(${bob}px)`;
        distance.textContent = `${Math.round(racer.progress * 100)}%`;
        lane.classList.toggle("is-leading", racer.playerId === leaderId && state.stage === "racing");
    }
}

function getLeaderId() {
    let leader = null;

    for (const racer of state.race) {
        if (!leader || racer.progress > leader.progress) {
            leader = racer;
        }
    }

    return leader ? leader.playerId : null;
}

function getRunwayWidth() {
    const runway = elements.trackLanes.querySelector(".lane-runway");

    if (!(runway instanceof HTMLElement)) {
        return state.laneWidth;
    }

    state.laneWidth = Math.max(0, runway.clientWidth - HORSE_DISPLAY_WIDTH - 44);
    return state.laneWidth;
}

function resetTrackPreview() {
    state.race = state.players.map((player) => ({
        playerId: player.id,
        progress: 0,
        speed: 0,
        targetSpeed: 0,
        burstTimer: 0,
        baseSpeed: 0,
        phase: 0,
        finished: false,
        finishTime: null,
        rank: null
    }));
}

function render() {
    renderPlayers();
    renderTrack();
    syncControls();
}

function renderPlayers() {
    elements.playerList.innerHTML = "";

    state.players.forEach((player, index) => {
        const card = document.createElement("article");
        card.className = "player-card";
        card.innerHTML = `
            <div class="player-swatch" style="background: linear-gradient(135deg, ${player.style.main}, ${player.style.dark});"></div>
            <div class="player-fields">
                <label for="player-name-${player.id}">Player ${index + 1}</label>
                <input
                    id="player-name-${player.id}"
                    data-player-id="${player.id}"
                    maxlength="18"
                    type="text"
                    value="${escapeAttribute(player.name)}"
                    ${state.stage !== "lobby" ? "disabled" : ""}
                >
            </div>
            <div class="player-meta">
                <div class="horse-title">${player.style.horseName}</div>
                <button
                    class="ghost-button"
                    data-remove-player-id="${player.id}"
                    type="button"
                    ${state.stage !== "lobby" || state.players.length <= MIN_PLAYERS ? "disabled" : ""}
                >
                    Remove
                </button>
            </div>
        `;
        elements.playerList.appendChild(card);
    });
}

function renderTrack() {
    if (state.race.length !== state.players.length) {
        resetTrackPreview();
    }

    const raceMap = new Map(state.race.map((racer) => [racer.playerId, racer]));
    elements.trackLanes.innerHTML = "";

    state.players.forEach((player, index) => {
        const racer = raceMap.get(player.id);
        const lane = document.createElement("article");
        lane.className = "track-lane";
        lane.dataset.lanePlayerId = String(player.id);
        lane.innerHTML = `
            <div class="lane-badge">
                <span class="lane-number">Lane ${index + 1}</span>
                <strong class="lane-player">${escapeHtml(player.name.trim() || `Player ${index + 1}`)}</strong>
                <span class="lane-horse-name">${player.style.horseName}</span>
            </div>
            <div class="lane-runway">
                <div class="leader-glow"></div>
                <div class="distance-readout">${Math.round((racer?.progress || 0) * 100)}%</div>
                <div
                    class="horse"
                    style="--horse-main: ${player.style.main}; --horse-dark: ${player.style.dark}; --horse-accent: ${player.style.accent}; transform: translateX(0px) translateY(0px);"
                >
                    <span class="horse-shadow"></span>
                    <span class="horse-body"></span>
                    <span class="horse-legs"></span>
                    <span class="horse-tail"></span>
                    <span class="horse-saddle">${String.fromCharCode(65 + index)}</span>
                    <span class="horse-headband"></span>
                </div>
            </div>
        `;
        elements.trackLanes.appendChild(lane);
    });

    paintRaceFrame(performance.now());
}

function syncControls() {
    elements.addPlayerButton.disabled = state.stage !== "lobby" || state.players.length >= MAX_PLAYERS;
    elements.startRaceButton.disabled = state.stage !== "lobby" || state.players.length < MIN_PLAYERS;
    elements.statusMessage.textContent = LOBBY_MESSAGES[state.stage];
    elements.headlineMessage.textContent = HEADLINE_MESSAGES[state.stage];
    elements.countdownDisplay.textContent = state.stage === "countdown" ? String(state.countdownValue) : state.stage === "racing" ? "GO" : "--";
}

function getPlayerById(playerId) {
    return state.players.find((player) => player.id === playerId) || null;
}

function formatSeconds(seconds) {
    return `${seconds.toFixed(2)}s`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}