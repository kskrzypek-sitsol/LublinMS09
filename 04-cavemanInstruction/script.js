const colors = ["#e6573c", "#397ec1", "#eeaa2d", "#8f5ca8"];
const playerFields = document.querySelector("#player-fields");
const countButtons = document.querySelectorAll(".count-button");
const setupPanel = document.querySelector("#setup-panel");
const racePanel = document.querySelector("#race-panel");
const track = document.querySelector("#track");
const startButton = document.querySelector("#start-button");
const rematchButton = document.querySelector("#rematch-button");
const resultsDialog = document.querySelector("#results-dialog");
const resultsList = document.querySelector("#results-list");
const winnerName = document.querySelector("#winner-name");
const raceStatus = document.querySelector("#race-status");
const raceNumber = document.querySelector("#race-number");

let playerCount = 2;
let raceCount = 1;
let racers = [];
let animationFrame;

function renderPlayerFields() {
  playerFields.innerHTML = "";

  for (let index = 0; index < playerCount; index += 1) {
    const field = document.createElement("label");
    field.className = "field";
    field.innerHTML = `
      <span class="silk" style="background:${colors[index]}">${String(index + 1).padStart(2, "0")}</span>
      <input type="text" maxlength="16" value="Player ${index + 1}" aria-label="Player ${index + 1} name">
    `;
    playerFields.append(field);
  }
}

function setPlayerCount(event) {
  playerCount = Number(event.currentTarget.dataset.count);
  countButtons.forEach((button) => button.classList.toggle("active", button === event.currentTarget));
  renderPlayerFields();
}

function collectRacers() {
  const inputs = playerFields.querySelectorAll("input");
  racers = [...inputs].map((input, index) => ({
    name: input.value.trim() || `Player ${index + 1}`,
    color: colors[index],
    progress: 0,
    finished: false,
    finishTime: 0,
    element: null
  }));
}

function renderTrack() {
  track.innerHTML = "";
  racers.forEach((racer) => {
    const lane = document.createElement("div");
    lane.className = "lane";
    lane.innerHTML = `
      <div class="horse" style="--silk:${racer.color}">
        <span class="horse-icon" aria-hidden="true">♞</span>
        <span class="horse-name">${racer.name}</span>
      </div>
    `;
    racer.element = lane.querySelector(".horse");
    track.append(lane);
  });
}

function startRace() {
  collectRacers();
  renderTrack();
  setupPanel.classList.add("hidden");
  racePanel.classList.remove("hidden");
  raceStatus.textContent = "And they are running!";

  const startedAt = performance.now();
  const finishDistance = 84;

  function raceFrame(now) {
    let finishedCount = 0;

    racers.forEach((racer) => {
      if (racer.finished) {
        finishedCount += 1;
        return;
      }

      const pace = 0.14 + Math.random() * 0.39;
      racer.progress = Math.min(finishDistance, racer.progress + pace);
      racer.element.style.left = `${racer.progress}%`;

      if (racer.progress >= finishDistance) {
        racer.finished = true;
        racer.finishTime = now - startedAt;
        finishedCount += 1;
      }
    });

    if (finishedCount === racers.length) {
      finishRace();
      return;
    }

    animationFrame = requestAnimationFrame(raceFrame);
  }

  animationFrame = requestAnimationFrame(raceFrame);
}

function finishRace() {
  const ranking = [...racers].sort((first, second) => first.finishTime - second.finishTime);
  raceStatus.textContent = "Photo finish confirmed";
  winnerName.textContent = ranking[0].name;
  resultsList.innerHTML = ranking.map((racer, index) => `
    <li><span>${racer.name}</span><strong>${index === 0 ? "WINNER" : "FINISHED"}</strong></li>
  `).join("");
  window.setTimeout(() => resultsDialog.showModal(), 500);
}

function rematch() {
  cancelAnimationFrame(animationFrame);
  resultsDialog.close();
  raceCount += 1;
  raceNumber.textContent = String(raceCount).padStart(2, "0");
  racers.forEach((racer) => {
    racer.progress = 0;
    racer.finished = false;
    racer.finishTime = 0;
  });
  renderTrack();
  raceStatus.textContent = "Horses at the gate";
  window.setTimeout(() => {
    raceStatus.textContent = "And they are running!";
    startRaceFromCurrentRacers();
  }, 350);
}

function startRaceFromCurrentRacers() {
  const startedAt = performance.now();
  const finishDistance = 84;

  function raceFrame(now) {
    let finishedCount = 0;
    racers.forEach((racer) => {
      if (racer.finished) {
        finishedCount += 1;
        return;
      }
      racer.progress = Math.min(finishDistance, racer.progress + 0.14 + Math.random() * 0.39);
      racer.element.style.left = `${racer.progress}%`;
      if (racer.progress >= finishDistance) {
        racer.finished = true;
        racer.finishTime = now - startedAt;
        finishedCount += 1;
      }
    });

    if (finishedCount === racers.length) {
      finishRace();
      return;
    }
    animationFrame = requestAnimationFrame(raceFrame);
  }

  animationFrame = requestAnimationFrame(raceFrame);
}

countButtons.forEach((button) => button.addEventListener("click", setPlayerCount));
startButton.addEventListener("click", startRace);
rematchButton.addEventListener("click", rematch);
renderPlayerFields();