/* Derby Dash — local multiplayer horse racing */
(() => {
    "use strict";

    // ── tuning ────────────────────────────────────────────────
    const TAP_IMPULSE = 0.045;   // track fraction per second added per tap
    const FRICTION = 3.0;        // velocity decay factor (per second, exponential)
    const STAMINA_MAX = 100;
    const STAMINA_COST = 5;
    const STAMINA_REGEN = 25;    // per second → ~5 sustainable taps/s
    const STRAGGLER_TIMEOUT = 8; // seconds after the winner before the race is called

    const COLORS = ["#e5484d", "#3e8bff", "#f5b301", "#30c48d", "#b46cff", "#ff8a3d"];
    const KEYS = ["A", "L", "F", "J", "V", "N"];
    const NAMES = ["Thunderbolt", "Blue Comet", "Sundancer", "Emerald Ghost", "Purple Reign", "Copper Blaze"];
    const MEDALS = ["🥇", "🥈", "🥉"];

    // ── dom ───────────────────────────────────────────────────
    const $ = (id) => document.getElementById(id);
    const screens = {
        setup: $("setup-screen"),
        race: $("race-screen"),
        results: $("results-screen"),
    };
    const racerList = $("racer-list");
    const lanesEl = $("lanes");
    const countdownEl = $("countdown");
    const countdownText = $("countdown-text");
    const clockEl = $("race-clock");

    // ── state ─────────────────────────────────────────────────
    /** @type {Array<Object>} */
    let racers = [];
    let distance = 1;
    let phase = "setup"; // setup | countdown | running | done
    let startedAt = 0;
    let firstFinishAt = null;
    let rafId = null;
    let lastFrame = 0;
    let rebinding = null; // racer awaiting a new key
    const timers = [];

    // ── setup screen ──────────────────────────────────────────
    function makeRacer(i) {
        return {
            id: i,
            name: NAMES[i],
            color: COLORS[i],
            key: KEYS[i],
            cpu: false,
            // per-race
            pos: 0, vel: 0, stamina: STAMINA_MAX, finished: false, time: null, place: null,
            cpuNext: 0, cpuRate: 0,
        };
    }

    function buildSetup() {
        const count = Number($("racer-count").value);
        while (racers.length < count) racers.push(makeRacer(racers.length));
        racers.length = count;
        renderSetup();
    }

    function renderSetup() {
        racerList.innerHTML = "";
        racers.forEach((r) => {
            const card = document.createElement("div");
            card.className = "racer-card";
            card.style.setProperty("--c", r.color);
            card.innerHTML = `
                <div class="silks">🏇</div>
                <div class="racer-card__body">
                    <input class="name-input" type="text" maxlength="18" value="${escapeHtml(r.name)}" aria-label="Horse name">
                    <div class="racer-card__controls">
                        <button class="key-badge" type="button" title="Click, then press a key">${r.key}</button>
                        <button class="type-toggle" type="button" data-type="${r.cpu ? "cpu" : "human"}">${r.cpu ? "CPU" : "Human"}</button>
                    </div>
                </div>`;

            card.querySelector(".name-input").addEventListener("input", (e) => {
                r.name = e.target.value.trim() || NAMES[r.id];
            });

            const keyBtn = card.querySelector(".key-badge");
            keyBtn.addEventListener("click", () => {
                if (rebinding) rebinding.btn.classList.remove("key-badge--listening");
                rebinding = { racer: r, btn: keyBtn };
                keyBtn.textContent = "…";
                keyBtn.classList.add("key-badge--listening");
            });

            const typeBtn = card.querySelector(".type-toggle");
            typeBtn.addEventListener("click", () => {
                r.cpu = !r.cpu;
                typeBtn.dataset.type = r.cpu ? "cpu" : "human";
                typeBtn.textContent = r.cpu ? "CPU" : "Human";
            });

            racerList.appendChild(card);
        });
    }

    function tryRebind(key) {
        const taken = racers.some((r) => r !== rebinding.racer && r.key === key);
        if (!taken && /^[A-Z0-9]$/.test(key)) rebinding.racer.key = key;
        rebinding.btn.textContent = rebinding.racer.key;
        rebinding.btn.classList.remove("key-badge--listening");
        rebinding = null;
    }

    // ── race build ────────────────────────────────────────────
    function buildLanes() {
        lanesEl.innerHTML = "";
        racers.forEach((r) => {
            const lane = document.createElement("div");
            lane.className = "lane";
            lane.style.setProperty("--c", r.color);
            lane.innerHTML = `
                <div class="lane__gate">
                    <div class="rank">–</div>
                    <div class="lane__info">
                        <div class="lane__name">${escapeHtml(r.name)}</div>
                        <div class="stamina"><div class="stamina__fill"></div></div>
                    </div>
                    <button class="tap-pad${r.cpu ? " tap-pad--cpu" : ""}" type="button" ${r.cpu ? "disabled" : ""}>${r.cpu ? "🤖" : r.key}</button>
                </div>
                <div class="lane__track">
                    <div class="horse">
                        <div class="horse__dust"></div>
                        <div class="horse__body">🏇</div>
                    </div>
                </div>`;

            r.el = {
                lane,
                rank: lane.querySelector(".rank"),
                stamina: lane.querySelector(".stamina"),
                staminaFill: lane.querySelector(".stamina__fill"),
                pad: lane.querySelector(".tap-pad"),
                track: lane.querySelector(".lane__track"),
                horse: lane.querySelector(".horse"),
            };

            if (!r.cpu) {
                r.el.pad.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    tap(r);
                });
            }
            lanesEl.appendChild(lane);
        });
    }

    function resetRacers() {
        racers.forEach((r) => {
            r.pos = 0;
            r.vel = 0;
            r.stamina = STAMINA_MAX;
            r.finished = false;
            r.time = null;
            r.place = null;
            r.cpuRate = 4.0 + Math.random() * 1.6;  // taps/s personality
            r.cpuNext = 0;
        });
    }

    function startRace() {
        distance = Number($("track-length").value);
        resetRacers();
        buildLanes();
        show("race");
        phase = "countdown";
        clockEl.textContent = "0.00s";
        firstFinishAt = null;

        countdownEl.hidden = false;
        const steps = ["3", "2", "1", "GO!"];
        steps.forEach((s, i) => {
            timers.push(setTimeout(() => {
                countdownText.textContent = s;
                countdownText.style.animation = "none";
                countdownText.getBoundingClientRect(); // force reflow so the pop animation restarts
                countdownText.style.animation = "";
                if (s === "GO!") {
                    phase = "running";
                    startedAt = performance.now();
                    lastFrame = startedAt;
                    racers.forEach((r) => r.el.horse.classList.add("horse--running"));
                    rafId = requestAnimationFrame(frame);
                    timers.push(setTimeout(() => { countdownEl.hidden = true; }, 550));
                }
            }, i * 800));
        });
    }

    // ── input ─────────────────────────────────────────────────
    function tap(racer) {
        if (phase !== "running" || racer.finished) return;
        const ready = Math.min(racer.stamina / 40, 1);
        racer.vel += TAP_IMPULSE * (0.3 + 0.7 * ready);
        racer.stamina = Math.max(0, racer.stamina - STAMINA_COST);
        racer.el.pad.classList.add("tap-pad--hit");
        setTimeout(() => racer.el.pad.classList.remove("tap-pad--hit"), 70);
    }

    document.addEventListener("keydown", (e) => {
        if (e.repeat) return;
        const key = e.key.toUpperCase();

        if (rebinding) {
            e.preventDefault();
            tryRebind(key);
            return;
        }
        if (phase !== "running") return;

        const racer = racers.find((r) => !r.cpu && r.key === key);
        if (racer) {
            e.preventDefault();
            tap(racer);
        }
    });

    // ── loop ──────────────────────────────────────────────────
    function frame(now) {
        const dt = Math.min((now - lastFrame) / 1000, 0.05);
        lastFrame = now;
        const elapsed = (now - startedAt) / 1000;
        clockEl.textContent = elapsed.toFixed(2) + "s";

        const first = racers[0].el;
        const laneWidth = Math.max(first.track.clientWidth - first.horse.offsetWidth - 10, 1);
        const decay = Math.exp(-FRICTION * dt);

        racers.forEach((r) => {
            if (!r.finished) {
                if (r.cpu) driveCpu(r, elapsed);
                r.stamina = Math.min(STAMINA_MAX, r.stamina + STAMINA_REGEN * dt);
                r.vel *= decay;
                r.pos += (r.vel / distance) * dt;

                if (r.pos >= 1) {
                    r.pos = 1;
                    r.finished = true;
                    r.time = elapsed;
                    r.el.horse.classList.remove("horse--running");
                    r.el.horse.classList.add("horse--done");
                    if (firstFinishAt === null) firstFinishAt = elapsed;
                }
            }
            r.el.horse.style.transform = `translate3d(${r.pos * laneWidth}px, -50%, 0)`;
            r.el.horse.style.setProperty("--dust", Math.min(r.vel * 14, 1).toFixed(2));

            const pct = (r.stamina / STAMINA_MAX) * 100;
            r.el.staminaFill.style.width = pct + "%";
            r.el.stamina.classList.toggle("stamina--low", pct < 30);
        });

        updateRanks();

        const allDone = racers.every((r) => r.finished);
        const timedOut = firstFinishAt !== null && elapsed - firstFinishAt > STRAGGLER_TIMEOUT;
        if (allDone || timedOut) {
            endRace();
            return;
        }
        rafId = requestAnimationFrame(frame);
    }

    function driveCpu(r, elapsed) {
        if (r.cpuNext === 0) r.cpuNext = elapsed;
        // late-race surge keeps finishes tight
        const rate = r.cpuRate * (r.pos > 0.7 ? 1.15 : 1) * (0.9 + Math.random() * 0.2);
        while (elapsed >= r.cpuNext) {
            tap(r);
            r.cpuNext += 1 / rate;
        }
    }

    function updateRanks() {
        const order = [...racers].sort((a, b) => {
            if (a.finished && b.finished) return a.time - b.time;
            if (a.finished !== b.finished) return a.finished ? -1 : 1;
            return b.pos - a.pos;
        });
        order.forEach((r, i) => {
            r.el.rank.textContent = i + 1;
            r.el.rank.classList.toggle("rank--1", i === 0);
        });
    }

    // ── finish ────────────────────────────────────────────────
    function endRace() {
        phase = "done";
        cancelAnimationFrame(rafId);
        racers.forEach((r) => r.el.horse.classList.remove("horse--running"));

        const standings = [...racers].sort((a, b) => {
            if (a.finished && b.finished) return a.time - b.time;
            if (a.finished !== b.finished) return a.finished ? -1 : 1;
            return b.pos - a.pos;
        });
        standings.forEach((r, i) => (r.place = i + 1));

        renderResults(standings);
        show("results");
        fireConfetti(standings[0].color);
    }

    function renderResults(standings) {
        const winnerTime = standings[0].time;
        const podium = $("podium");
        podium.innerHTML = "";
        [2, 1, 3].forEach((place) => {
            const r = standings[place - 1];
            if (!r) return;
            const slot = document.createElement("div");
            slot.className = "podium__slot";
            slot.dataset.place = place;
            slot.style.setProperty("--c", r.color);
            slot.style.animationDelay = place * 0.08 + "s";
            slot.innerHTML = `
                <div class="podium__silks">🏇</div>
                <div class="podium__name">${escapeHtml(r.name)}</div>
                <div class="podium__block">${MEDALS[place - 1]}</div>`;
            podium.appendChild(slot);
        });

        const list = $("result-list");
        list.innerHTML = "";
        standings.forEach((r) => {
            const li = document.createElement("li");
            li.className = "result-row";
            li.style.setProperty("--c", r.color);
            const time = r.finished ? r.time.toFixed(2) + "s" : `${Math.round(r.pos * 100)}% — DNF`;
            const gap = r.finished && r.place > 1 ? "+" + (r.time - winnerTime).toFixed(2) + "s" : "";
            li.innerHTML = `
                <span class="result-row__place">${r.place}</span>
                <span>${MEDALS[r.place - 1] || "🏇"}</span>
                <span>${escapeHtml(r.name)}${r.cpu ? " <small>(CPU)</small>" : ""}</span>
                <span class="result-row__time">${time}</span>
                <span class="result-row__gap">${gap}</span>`;
            list.appendChild(li);
        });

        document.querySelector(".results__title").textContent =
            standings[0].name + " takes the cup!";
    }

    function fireConfetti(color) {
        const box = $("confetti");
        box.innerHTML = "";
        const palette = [color, "#ffcc4d", "#ffffff", "#8ecdf7"];
        for (let i = 0; i < 90; i++) {
            const bit = document.createElement("i");
            bit.style.left = Math.random() * 100 + "vw";
            bit.style.background = palette[i % palette.length];
            bit.style.animationDuration = 2.2 + Math.random() * 2 + "s";
            bit.style.animationDelay = Math.random() * 0.8 + "s";
            box.appendChild(bit);
        }
        timers.push(setTimeout(() => (box.innerHTML = ""), 5200));
    }

    // ── helpers ───────────────────────────────────────────────
    function show(name) {
        Object.values(screens).forEach((s) => s.classList.remove("screen--active"));
        screens[name].classList.add("screen--active");
    }

    function clearTimers() {
        while (timers.length) clearTimeout(timers.pop());
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function abandon() {
        clearTimers();
        cancelAnimationFrame(rafId);
        phase = "setup";
        countdownEl.hidden = true;
        show("setup");
    }

    // ── wiring ────────────────────────────────────────────────
    $("racer-count").addEventListener("change", buildSetup);
    $("start-btn").addEventListener("click", () => { clearTimers(); startRace(); });
    $("quit-btn").addEventListener("click", abandon);
    $("again-btn").addEventListener("click", () => { clearTimers(); startRace(); });
    $("change-btn").addEventListener("click", abandon);

    buildSetup();
})();
