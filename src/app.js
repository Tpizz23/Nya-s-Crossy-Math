import { CrossingGame } from "./model.js";
import { World } from "./world.js";
const $ = (selector) => document.querySelector(selector);
const dialog = $("#dialog");
let world,
  game = new CrossingGame(),
  mode = "home",
  generator,
  problem,
  pendingAnswer,
  savedRun = false;
let lastStatus = "playing",
  noticeTimer,
  lastFrame = performance.now(),
  focusBeforeDialog;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let settings = SaveManager.load();
let operation = settings.lastPlayedMathType,
  difficulty = settings.lastPlayedDifficulty;
const sound = (method) => {
  try {
    soundManager[method]();
  } catch {
    /* Audio is optional. */
  }
};
function notice(text) {
  $("#notice").textContent = text;
  $("#notice").classList.add("show");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => $("#notice").classList.remove("show"), 2200);
}
function refreshHome() {
  settings = SaveManager.load();
  $("#best").textContent = settings.highScore.toLocaleString();
  const character = CHARACTERS[settings.selectedCharacter];
  $("#selected-emoji").textContent = character.emoji;
  $("#selected-name").textContent = character.name;
  world?.setCharacter(character.id);
  document
    .querySelectorAll("[data-op]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.op === operation)),
    );
  $("#difficulty").value = difficulty;
}
function openDialog(html) {
  if (!dialog.open) focusBeforeDialog = document.activeElement;
  dialog.innerHTML = html;
  if (!dialog.open) dialog.showModal();
  (dialog.querySelector("button:not(:disabled)") || dialog).focus();
}
function closeDialog() {
  dialog.close();
  focusBeforeDialog?.focus();
}
function updateHud() {
  $("#distance").textContent = game.furthest;
  $("#score").textContent = game.score;
  $("#hearts").textContent =
    "♥ ".repeat(game.lives) + "♡ ".repeat(3 - game.lives);
  $("#hearts").setAttribute("aria-label", `${game.lives} hearts remaining`);
  const lane = game.lanes.get(game.row + 1);
  $("#hint").textContent =
    game.furthest === 0
      ? "Your adventure starts with a hop."
      : lane?.type === "rail" && lane.warning
        ? "Train coming! Wait on the grass."
        : lane?.type === "water"
          ? "Hop onto a log. It will carry you."
          : lane?.type === "road"
            ? "Watch the traffic. Find your gap."
            : `Next math stop: ${game.nextQuiz} hops. No need to rush.`;
}
function start() {
  closeDialog();
  SaveManager.updateLastPlayed(operation, difficulty);
  game = new CrossingGame({ difficulty });
  generator = new MathProblemGenerator(operation, difficulty);
  mode = "play";
  savedRun = false;
  pendingAnswer = null;
  lastStatus = "playing";
  world.follow = 2;
  $("#home").hidden = true;
  $("#hud").hidden = false;
  document.body.classList.add("playing");
  world.setCharacter(SaveManager.load().selectedCharacter);
  sound("playTap");
  updateHud();
  $("#pause").focus();
}
function home() {
  closeDialog();
  mode = "home";
  game = new CrossingGame();
  $("#home").hidden = false;
  $("#hud").hidden = true;
  document.body.classList.remove("playing");
  refreshHome();
  $("#play").focus();
}
function showQuiz() {
  generator.nudgeCount = Math.min(10, Math.floor(game.furthest / 10));
  problem = generator.generate();
  pendingAnswer = null;
  const checkpoint = game.quizReason === "checkpoint";
  openDialog(
    `<div class="dialog-icon" aria-hidden="true">${checkpoint ? "✦" : "♥"}</div><div class="eyebrow">${checkpoint ? "A little math stop" : "A second chance"}</div><h2 id="dialog-title">${checkpoint ? "Give your brain a hop!" : "Let’s get you back."}</h2><p>${checkpoint ? "Solve this for bonus points." : "Solve this to keep your heart and hop to safety."}<br>Take as much time as you need.</p><div class="equation">${problem.displayString}</div><div class="answers">${problem.choices.map((n, i) => `<button data-answer="${n}" aria-label="Answer ${n}">${n}</button>`).join("")}</div><div class="feedback" role="status" aria-live="polite"></div><button id="continue" class="primary" hidden>Keep hopping</button>`,
  );
  dialog
    .querySelectorAll("[data-answer]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        answer(Number(button.dataset.answer)),
      ),
    );
  $("#continue").addEventListener("click", () => {
    game.answer(pendingAnswer);
    closeDialog();
    lastStatus = game.status;
    if (game.status === "over") finish();
    else {
      updateHud();
      if (pendingAnswer)
        notice(
          `Nice thinking! ${game.streak > 1 ? `${game.streak} in a row!` : "+25 points"}`,
        );
    }
  });
}
function answer(value) {
  if (pendingAnswer !== null) return;
  pendingAnswer = value === problem.answer;
  sound(pendingAnswer ? "playCorrect" : "playWrong");
  dialog.querySelectorAll("[data-answer]").forEach((b) => {
    b.disabled = true;
    if (Number(b.dataset.answer) === problem.answer) b.classList.add("correct");
    else if (Number(b.dataset.answer) === value) b.classList.add("incorrect");
  });
  $(".feedback").textContent = pendingAnswer
    ? "That’s it! Your path is clear."
    : `${problem.operandA} ${OPERATION_SYMBOLS[operation]} ${problem.operandB} = ${problem.answer}. You’ll get the next one!`;
  $("#continue").hidden = false;
  $("#continue").textContent =
    !pendingAnswer && game.lives === 1 ? "See your adventure" : "Keep hopping";
  $("#continue").focus();
}
function pause() {
  if (mode !== "play" || game.status !== "playing") return;
  game.pause();
  openDialog(
    '<div class="dialog-icon" aria-hidden="true">☀</div><h2 id="dialog-title">A little breather.</h2><p>Your adventure will be right here.</p><button id="resume" class="primary">Keep hopping</button><button id="end-run" class="secondary">Finish this adventure</button>',
  );
  $("#resume").onclick = () => {
    closeDialog();
    game.resume();
    lastStatus = "playing";
  };
  $("#end-run").onclick = finish;
}
function finish() {
  game.status = "over";
  let newBest = false,
    unlocked = [];
  if (!savedRun) {
    const before = SaveManager.load();
    newBest = game.score > before.highScore;
    const cumulative = before.cumulativeScore + game.score;
    unlocked = CHARACTERS.filter(
      (c) =>
        c.unlockScore <= cumulative &&
        !before.unlockedCharacters.includes(c.id),
    );
    const ok = SaveManager.save({
      ...before,
      highScore: Math.max(before.highScore, game.score),
      cumulativeScore: cumulative,
      unlockedCharacters: [
        ...before.unlockedCharacters,
        ...unlocked.map((c) => c.id),
      ],
    });
    if (!ok) notice("Progress could not be saved in this browser.");
    savedRun = true;
  }
  sound(unlocked.length ? "playUnlock" : "playGameOver");
  openDialog(
    `<div class="dialog-icon" aria-hidden="true">${unlocked.length ? "✦" : "☀"}</div><h2 id="dialog-title">${newBest ? "Your best adventure yet!" : "Look how far you hopped!"}</h2><div class="summary-score">${game.score}</div><div class="eyebrow">points collected</div><p class="summary-stats">${game.furthest} hops explored · ${game.correct} answers solved${unlocked.length ? `<br>New friends: ${unlocked.map((c) => c.emoji + " " + c.name).join(", ")}` : ""}</p><button id="again" class="primary">Hop again</button><button id="back-home" class="text-button">Back to the meadow</button>`,
  );
  $("#again").onclick = start;
  $("#back-home").onclick = home;
}
function characters() {
  const saved = SaveManager.load();
  openDialog(
    `<h2 id="dialog-title">Meet your hopping buddies.</h2><p>${saved.cumulativeScore.toLocaleString()} lifetime points. Every adventure adds up.</p><div class="character-grid">${CHARACTERS.map((c) => `<button data-character="${c.id}" ${saved.unlockedCharacters.includes(c.id) ? "" : "disabled"} aria-pressed="${saved.selectedCharacter === c.id}" aria-label="${c.name}${saved.unlockedCharacters.includes(c.id) ? "" : `, unlocks at ${c.unlockScore} points`}"><span>${c.emoji}</span>${c.name}<br><small>${saved.unlockedCharacters.includes(c.id) ? "Ready to hop" : c.unlockScore.toLocaleString()}</small></button>`).join("")}</div><button id="done" class="primary">Ready to hop</button>`,
  );
  dialog.querySelectorAll("[data-character]").forEach(
    (b) =>
      (b.onclick = () => {
        SaveManager.setSelectedCharacter(Number(b.dataset.character));
        refreshHome();
        closeDialog();
        sound("playTap");
      }),
  );
  $("#done").onclick = closeDialog;
}
function move(direction) {
  const movements = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
  if (mode === "play" && game.move(...movements[direction]))
    sound(direction === "up" ? "playHopForward" : "playHopSide");
}
$("#play").onclick = start;
$("#pause").onclick = pause;
$("#characters").onclick = characters;
$("#operations").onclick = (event) => {
  const b = event.target.closest("[data-op]");
  if (b) {
    operation = b.dataset.op;
    refreshHome();
    sound("playTap");
  }
};
$("#difficulty").onchange = (event) => {
  difficulty = event.target.value;
};
$("#sound").onclick = () => {
  soundManager.toggle();
  $("#sound").setAttribute("aria-pressed", String(!soundManager.enabled));
  $("#sound").setAttribute(
    "aria-label",
    soundManager.enabled ? "Mute sound" : "Enable sound",
  );
  $("#sound").textContent = soundManager.enabled ? "♪" : "♪̸";
  const saved = SaveManager.load();
  SaveManager.save({ ...saved, soundEnabled: soundManager.enabled });
};
$("#how-to").onclick = () => {
  openDialog(
    '<div class="dialog-icon" aria-hidden="true">🐸</div><h2 id="dialog-title">Small hops. Big adventure.</h2><ol class="instructions"><li>Use the arrow keys, WASD, or the on-screen arrows. On the world, tap to hop forward or swipe in any direction.</li><li>Wait for a gap in traffic. Ride the logs across water. Flashing railway lights mean a train is coming.</li><li>Every five new rows, stop for math. A correct answer earns bonus points; a wrong answer costs one heart.</li><li>Bumped into something? Solve a question to save your heart. You always return to safe grass.</li><li>There’s no timer. Pause whenever you need. Collect points to unlock new friends!</li></ol><button id="got-it" class="primary">Got it!</button>',
  );
  $("#got-it").onclick = closeDialog;
};
document
  .querySelectorAll("[data-move]")
  .forEach((b) => (b.onclick = () => move(b.dataset.move)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    if (game.status === "paused") {
      $("#resume")?.click();
    } else if (!dialog.open) pause();
    return;
  }
  if (
    dialog.open ||
    mode !== "play" ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  )
    return;
  const keys = {
    ArrowUp: "up",
    w: "up",
    ArrowDown: "down",
    s: "down",
    ArrowLeft: "left",
    a: "left",
    ArrowRight: "right",
    d: "right",
  };
  const direction = keys[event.key] || keys[event.key.toLowerCase()];
  if (direction) {
    event.preventDefault();
    move(direction);
  }
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  if (mode === "home") closeDialog();
  else if (game.status === "paused") {
    $("#resume")?.click();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
  lastFrame = performance.now();
});
let pointer;
$("#world").addEventListener("pointerdown", (event) => {
  if (mode === "play" && game.status === "playing") {
    pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    $("#world").setPointerCapture(event.pointerId);
  }
});
$("#world").addEventListener("pointerup", (event) => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x,
    dy = event.clientY - pointer.y;
  pointer = null;
  move(
    Math.max(Math.abs(dx), Math.abs(dy)) < 20
      ? "up"
      : Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up",
  );
});
$("#world").addEventListener("pointercancel", () => {
  pointer = null;
});
try {
  world = new World($("#world"));
  soundManager.enabled = settings.soundEnabled !== false;
  $("#sound").setAttribute("aria-pressed", String(!soundManager.enabled));
  $("#sound").setAttribute(
    "aria-label",
    soundManager.enabled ? "Mute sound" : "Enable sound",
  );
  refreshHome();
  $("#loading").remove();
  world.renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    pause();
    notice("Graphics paused. Reload the page to try again.");
  });
  function frame(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (!document.hidden) {
      if (mode === "play") {
        game.tick(dt);
        if (game.status === "quiz" && lastStatus !== "quiz") showQuiz();
        lastStatus = game.status;
        updateHud();
      } else if (!reducedMotion.matches && !dialog.open) game.tick(dt);
      world.draw(game, dt, mode === "home", reducedMotion.matches);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
} catch (error) {
  console.error(error);
  $("#loading").innerHTML =
    '<h2>Your 3D world couldn’t start.</h2><p>Try a browser with WebGL enabled, such as Chrome, Edge, Safari, or Firefox.</p><button class="primary" onclick="location.reload()">Try again</button>';
}
