import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
function setup(initial = {}, blocked = false) {
  const data = new Map(Object.entries(initial));
  const context = vm.createContext({
    console,
    localStorage: {
      getItem: (key) => {
        if (blocked) throw new Error("blocked");
        return data.get(key) || null;
      },
      setItem: (key, value) => {
        if (blocked) throw new Error("blocked");
        data.set(key, value);
      },
    },
  });
  for (const file of ["data", "save"])
    vm.runInContext(readFileSync(`js/${file}.js`, "utf8"), context);
  return { run: (code) => vm.runInContext(code, context), data };
}
test("legacy score belongs to Nya; Ariana starts fresh and profile changes preserve both saves", () => {
  const { run, data } = setup({
    nya_math_game_save: JSON.stringify({
      highScore: 600,
      cumulativeScore: 900,
      selectedCharacter: 3,
      unlockedCharacters: [0, 1, 2, 3],
      lastPlayedMathType: "division",
      lastPlayedDifficulty: "hard",
    }),
  });
  assert.equal(run("SaveManager.getPlayer()"), "nya");
  assert.equal(run("SaveManager.load().highScore"), 600);
  run('SaveManager.setPlayer("ariana")');
  assert.equal(run("SaveManager.load().highScore"), 0);
  assert.equal(run("SaveManager.load().selectedCharacter"), 0);
  run("SaveManager.updateHighScore(70);SaveManager.updateCumulativeScore(70)");
  run('SaveManager.setPlayer("nya")');
  assert.equal(run("SaveManager.load().highScore"), 600);
  assert.equal(run("SaveManager.load().selectedCharacter"), 3);
  assert.equal(run("SaveManager.load().lastPlayedMathType"), "division");
  run('SaveManager.setPlayer("ariana")');
  assert.equal(run("SaveManager.load().highScore"), 70);
  assert(data.has("nya_math_game_save_ariana"));
});
test("stored player selection survives reload; invalid preference falls back to Nya", () => {
  assert.equal(
    setup({ nya_math_game_player: "ariana" }).run("SaveManager.getPlayer()"),
    "ariana",
  );
  assert.equal(
    setup({ nya_math_game_player: "unknown" }).run("SaveManager.getPlayer()"),
    "nya",
  );
});
test("blocked storage still permits selecting and playing as Ariana", () => {
  const { run } = setup({}, true);
  assert.equal(run('SaveManager.setPlayer("ariana")'), false);
  assert.equal(run("SaveManager.getPlayer()"), "ariana");
  assert.equal(run("SaveManager.load().highScore"), 0);
});

test("another tab selecting a player does not redirect an active run’s saved progress", () => {
  const { run, data } = setup();
  assert.equal(run("SaveManager.getPlayer()"), "nya");
  data.set("nya_math_game_player", "ariana");
  run("SaveManager.updateHighScore(80)");
  assert.equal(JSON.parse(data.get("nya_math_game_save")).highScore, 80);
  assert.equal(data.has("nya_math_game_save_ariana"), false);
});
