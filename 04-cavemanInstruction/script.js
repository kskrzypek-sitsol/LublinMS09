const MAX_POSITION = 100;
const playerColors = ["#e94f37", "#217a7e", "#5a4eac", "#d46a19"];
const setupPanel = document.querySelector("#setup-panel");
const racePanel = document.querySelector("#race-panel");
const nameFields = document.querySelector("#name-fields");
const countButtons = document.querySelectorAll(".count-button");
const startButton = document.querySelector("#start-button");
const track = document.querySelector("#track");
const raceStatus = document.querySelector("#race-status");
const raceButton = document.querySelector("#race-button");
const winnerDialog = document.querySelector("#winner-dialog");
const winnerName = document.querySelector("#winner-name");
const replayButton = document.querySelector("#replay-button");
const setupButton = document.querySelector("#setup-button");
let playerCount = 2;
let players = [];
let raceActive = false;
let animationFrame;

function renderNameFields() {
    const names = [...nameFields.querySelectorAll("input")].map((input) => input.value);
    nameFields.replaceChildren();
    for (let index = 0; index < playerCount; index += 1) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        label.className = "field-label";
        label.textContent = `Rider ${index + 1}`;
        input.className = "name-input";
        input.type = "text";
        input.maxLength = 12;
        input.autocomplete = "off";
        input.value = names[index] || `Player ${index + 1}`;
        input.setAttribute("aria-label", `Name for rider ${index + 1}`);
        label.append(input);
        nameFields.append(label);
    }
}

function buildTrack() {
    track.replaceChildren();
    players.forEach((player, index) => {
        const lane = document.createElement("div");
        const finish = document.createElement("div");
        const horse = document.createElement("div");
        const horseIcon = document.createElement("span");
        const horseName = document.createElement("span");
        lane.className = "lane";
        lane.style.setProperty("--lane-color", index % 2 === 0 ? "#e6f3dc" : "#f9dfad");
        finish.className = "finish-line";
        horse.className = "horse";
        horse.id = `horse-${index}`;
        horse.style.setProperty("--rider-color", player.color);
        horseIcon.className = "horse-icon";
        horseIcon.textContent = "Horse";
        horseIcon.setAttribute("aria-hidden", "true");
        horseName.className = "horse-name";
        horseName.textContent = player.name;
        horse.append(horseIcon, horseName);
        lane.append(finish, horse);
        track.append(lane);
    });
}

function startRace() {
    const inputs = nameFields.querySelectorAll("input");
    players = [...inputs].map((input, index) => ({
        name: input.value.trim() || `Player ${index + 1}`,
        color: playerColors[index],
        position: 0,
        speed: 0.16 + Math.random() * 0.008,
    }));
    raceActive = false;
    buildTrack();
    raceStatus.textContent = "Horses ready. Press GOGOGOGO.";
    setupPanel.classList.add("hidden");
    racePanel.classList.remove("hidden");
    raceButton.disabled = false;
    raceButton.focus();
}

function endRace(winner) {
    raceActive = false;
    window.cancelAnimationFrame(animationFrame);
    raceButton.disabled = false;
    raceButton.textContent = "RACE AGAIN";
    raceStatus.textContent = `${winner.name} crossed first.`;
    winnerName.textContent = winner.name;
    document.querySelector("#winner-copy").textContent = `${winner.name}'s horse reached the finish line first.`;
    window.setTimeout(() => winnerDialog.showModal(), 750);
}

function runRace() {
    if (raceActive) return;
    raceActive = true;
    raceButton.disabled = true;
    raceButton.textContent = "RACING...";
    raceStatus.textContent = "They are off!";

    const advance = () => {
        const finishers = [];
        players.forEach((player, index) => {
            const variation = 0.78 + Math.random() * 0.44;
            const previousPosition = player.position;
            const distance = player.speed * variation;
            player.position += distance;
            const horse = document.querySelector(`#horse-${index}`);
            horse.style.left = `${Math.min(92, 2 + player.position * 0.9)}%`;
            horse.classList.add("moving");
            if (player.position >= MAX_POSITION) {
                finishers.push({
                    player,
                    crossingPoint: (MAX_POSITION - previousPosition) / distance,
                });
            }
        });

        if (finishers.length) {
            finishers.sort((first, second) => first.crossingPoint - second.crossingPoint);
            endRace(finishers[0].player);
            return;
        }
        animationFrame = window.requestAnimationFrame(advance);
    };

    animationFrame = window.requestAnimationFrame(advance);
}

countButtons.forEach((button) => button.addEventListener("click", () => {
    playerCount = Number(button.dataset.count);
    countButtons.forEach((countButton) => {
        const active = countButton === button;
        countButton.classList.toggle("active", active);
        countButton.setAttribute("aria-pressed", String(active));
    });
    renderNameFields();
}));
startButton.addEventListener("click", startRace);
raceButton.addEventListener("click", runRace);
replayButton.addEventListener("click", () => { winnerDialog.close(); startRace(); });
setupButton.addEventListener("click", () => {
    winnerDialog.close();
    racePanel.classList.add("hidden");
    setupPanel.classList.remove("hidden");
    nameFields.querySelector("input").focus();
});
renderNameFields();