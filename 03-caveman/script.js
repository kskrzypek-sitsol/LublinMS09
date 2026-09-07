const form = document.getElementById("setup-form");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const setupMessage = document.getElementById("setup-message");
const statusText = document.getElementById("status-text");
const countdownChip = document.getElementById("countdown-chip");
const raceTrack = document.getElementById("race-track");
const resultPanel = document.getElementById("result-panel");
const winnerName = document.getElementById("winner-name");
const winnerCopy = document.getElementById("winner-copy");
const playerInputs = Array.from(document.querySelectorAll('input[name="player"]'));

const palette = [
    { lane: "#e8573d", badge: "#a52c16", horse: "#c45b31" },
    { lane: "#f0a324", badge: "#8f580d", horse: "#9f5d18" },
    { lane: "#1e8f73", badge: "#0e5f4b", horse: "#0b6a53" },
    { lane: "#4578d3", badge: "#214a91", horse: "#2b56ad" }
];

let players = [];
let animationFrame = null;
let raceState = "idle";
let countdownTimer = null;
let lastTimestamp = 0;

function setSetupMessage(message, isError) {
    setupMessage.textContent = message;
    setupMessage.style.color = isError ? "#9f1f1f" : "";
}

function collectPlayers() {
    return playerInputs
        .map((input) => input.value.trim())
        .filter(Boolean)
        .slice(0, 4)
        .map((name, index) => ({
            id: index,
            name,
            color: palette[index % palette.length],
            progress: 0,
            speed: 0,
            burstAt: 0,
            finished: false,
            laneElement: null,
            horseElement: null,
            speedElement: null,
            distanceElement: null,
            trackLimit: 0
        }));
}

function renderEmptyTrack() {
    raceTrack.innerHTML = "";
}

function buildLane(player, index) {
    const lane = document.createElement("article");
    lane.className = "lane";
    lane.style.background = [
        "linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.08))",
        "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 40px, rgba(0, 0, 0, 0.06) 40px, rgba(0, 0, 0, 0.06) 80px)",
        `linear-gradient(180deg, ${lighten(player.color.lane, 0.18)}, ${player.color.lane})`
    ].join(",");

    lane.innerHTML = `
        <div class="lane-top">
            <div class="lane-badge">
                <span class="lane-number" style="background:${player.color.badge}">${index + 1}</span>
                <strong>${escapeHtml(player.name)}</strong>
            </div>
            <div class="distance-pill">0%</div>
        </div>
        <div class="lane-runway">
            <div class="horse-token">
                <div class="horse-mark" style="background:${player.color.horse}; color:${player.color.horse}"></div>
                <div>
                    <div class="horse-name">${escapeHtml(player.name)}</div>
                    <span class="horse-speed">steady trot</span>
                </div>
            </div>
        </div>
    `;

    player.laneElement = lane;
    player.horseElement = lane.querySelector(".horse-token");
    player.speedElement = lane.querySelector(".horse-speed");
    player.distanceElement = lane.querySelector(".distance-pill");
    return lane;
}

function renderTrack(racers) {
    raceTrack.innerHTML = "";
    const fragment = document.createDocumentFragment();

    racers.forEach((player, index) => {
        fragment.appendChild(buildLane(player, index));
    });

    raceTrack.appendChild(fragment);
    updateTrackLimits();
}

function updateTrackLimits() {
    players.forEach((player) => {
        if (!player.horseElement || !player.laneElement) {
            return;
        }

        const runway = player.laneElement.querySelector(".lane-runway");
        const previousLimit = player.trackLimit;
        const runwayWidth = runway.clientWidth;
        const horseWidth = player.horseElement.offsetWidth;
        player.trackLimit = Math.max(0, runwayWidth - horseWidth);

        if (previousLimit > 0) {
            const progressRatio = player.progress / previousLimit;
            player.progress = Math.min(player.trackLimit, player.trackLimit * progressRatio);
        } else {
            player.progress = Math.min(player.progress, player.trackLimit);
        }

        player.horseElement.style.transform = `translateX(${player.progress}px)`;
    });
}

function resetPlayers(racers) {
    racers.forEach((player) => {
        player.progress = 0;
        player.speed = 0;
        player.burstAt = 0;
        player.finished = false;
    });
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function lighten(hex, strength) {
    const normalized = hex.replace("#", "");
    const channels = normalized.match(/.{2}/g).map((part) => parseInt(part, 16));
    const adjusted = channels.map((channel) => Math.min(255, Math.round(channel + (255 - channel) * strength)));
    return `rgb(${adjusted.join(", ")})`;
}

function setRacingEnabled(enabled) {
    playerInputs.forEach((input) => {
        input.disabled = enabled;
    });

    startButton.disabled = enabled;
}

function showResult(player) {
    winnerName.textContent = player.name;
    winnerCopy.textContent = `${player.name} stormed through the finish line first.`;
    resultPanel.classList.remove("hidden");
}

function hideResult() {
    resultPanel.classList.add("hidden");
}

function stopRace(winner) {
    raceState = "finished";
    statusText.textContent = `${winner.name} wins`; 
    countdownChip.textContent = "WIN";
    setSetupMessage("Race done. Restart keeps the same lineup.", false);
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    setRacingEnabled(false);

    players.forEach((player) => {
        if (!player.horseElement) {
            return;
        }

        player.horseElement.classList.remove("running");
        player.speedElement.textContent = player === winner ? "victory burst" : "finished";

        if (player === winner) {
            player.horseElement.classList.add("winner");
        }
    });

    showResult(winner);
}

function describeSpeed(speed) {
    if (speed < 120) {
        return "steady trot";
    }

    if (speed < 170) {
        return "dust kick";
    }

    if (speed < 220) {
        return "full gallop";
    }

    return "wild burst";
}

function stepRace(timestamp) {
    if (raceState !== "racing") {
        return;
    }

    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }

    const delta = Math.min(0.045, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;
    const leaderProgress = Math.max(...players.map((player) => player.progress));

    for (const player of players) {
        if (player.finished) {
            continue;
        }

        if (timestamp >= player.burstAt) {
            const catchUp = Math.max(0, (leaderProgress - player.progress) / Math.max(player.trackLimit, 1));
            player.speed = 115 + Math.random() * 110 + catchUp * 90 - (player.progress / Math.max(player.trackLimit, 1)) * 18;
            player.burstAt = timestamp + 140 + Math.random() * 260;
        }

        player.progress = Math.min(player.trackLimit, player.progress + player.speed * delta);

        if (player.horseElement) {
            player.horseElement.style.transform = `translateX(${player.progress}px)`;
            player.horseElement.classList.add("running");
            player.speedElement.textContent = describeSpeed(player.speed);
            player.distanceElement.textContent = `${Math.round((player.progress / Math.max(player.trackLimit, 1)) * 100)}%`;
        }

        if (player.progress >= player.trackLimit) {
            player.finished = true;
            stopRace(player);
            return;
        }
    }

    animationFrame = requestAnimationFrame(stepRace);
}

function startAnimation() {
    lastTimestamp = 0;
    raceState = "racing";
    statusText.textContent = "They are running";
    countdownChip.textContent = "GO";
    setSetupMessage("Random speed bursts. Close race. One winner.", false);
    hideResult();

    players.forEach((player) => {
        player.horseElement.classList.remove("winner");
        player.speedElement.textContent = "steady trot";
        player.distanceElement.textContent = "0%";
    });

    animationFrame = requestAnimationFrame(stepRace);
}

function clearTimers() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

function startCountdown() {
    const marks = ["3", "2", "1", "GO"];
    let index = 0;
    raceState = "countdown";
    statusText.textContent = "Race begins";
    countdownChip.textContent = marks[index];

    countdownTimer = setInterval(() => {
        index += 1;

        if (index >= marks.length) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            startAnimation();
            return;
        }

        countdownChip.textContent = marks[index];
        statusText.textContent = index === marks.length - 1 ? "Break loose" : "Race begins";
    }, 700);
}

function prepareRace(racers) {
    clearTimers();
    resetPlayers(racers);
    renderTrack(racers);
    updateTrackLimits();
    hideResult();
    setRacingEnabled(true);
    setSetupMessage("Count down. Then chaos.", false);
    startCountdown();
}

function handleStart(event) {
    event.preventDefault();

    if (raceState === "countdown" || raceState === "racing") {
        return;
    }

    const racers = collectPlayers();

    if (racers.length < 2) {
        setSetupMessage("Need at least 2 names.", true);
        statusText.textContent = "Waiting for racers";
        countdownChip.textContent = "-";
        renderEmptyTrack();
        return;
    }

    players = racers;
    prepareRace(players);
}

function handleRestart() {
    if (players.length < 2) {
        return;
    }

    prepareRace(players);
}

window.addEventListener("resize", () => {
    if (players.length === 0) {
        return;
    }

    updateTrackLimits();
});

form.addEventListener("submit", handleStart);
restartButton.addEventListener("click", handleRestart);

renderEmptyTrack();
countdownChip.textContent = "-";
statusText.textContent = "Waiting for racers";
setSetupMessage("Need 2 to 4 names.", false);