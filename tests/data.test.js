import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
function context(stored = null) {
  const ctx = vm.createContext({
    console,
    localStorage: {
      getItem: () => stored,
      setItem: (_key, data) => {
        stored = data;
      },
    },
  });
  for (const file of ["data", "save", "math"])
    vm.runInContext(readFileSync(`js/${file}.js`, "utf8"), ctx);
  return ctx;
}
test("all math modes/difficulties generate correct arithmetic and four unique choices", () => {
  const ctx = context();
  for (const op of ["addition", "subtraction", "multiplication", "division"])
    for (const difficulty of ["easy", "medium", "hard", "expert"]) {
      const problems = vm.runInContext(
        `Array.from({length:200},()=>new MathProblemGenerator('${op}','${difficulty}').generate())`,
        ctx,
      );
      for (const p of problems) {
        const a = p.operandA,
          b = p.operandB;
        const expected = {
          addition: a + b,
          subtraction: a - b,
          multiplication: a * b,
          division: a / b,
        }[op];
        assert.equal(p.answer, expected);
        assert(Number.isInteger(p.answer));
        assert(p.answer >= 0);
        assert.equal(new Set(p.choices).size, 4);
        assert(p.choices.includes(p.answer));
      }
    }
});
test("legacy saves preserve scores and unlocked characters", () => {
  const ctx = context(
    JSON.stringify({
      highScore: 480,
      cumulativeScore: 700,
      selectedCharacter: 3,
      unlockedCharacters: [0, 1, 2, 3],
      lastPlayedMathType: "division",
      lastPlayedDifficulty: "hard",
    }),
  );
  const save = vm.runInContext("SaveManager.load()", ctx);
  assert.equal(save.highScore, 480);
  assert.equal(save.selectedCharacter, 3);
  assert.equal(save.lastPlayedMathType, "division");
});
test("invalid stored preferences and corrupt JSON safely fall back", () => {
  for (const stored of [
    "broken",
    "null",
    JSON.stringify({
      highScore: -9,
      cumulativeScore: "bad",
      selectedCharacter: 99,
      unlockedCharacters: [-1, 99, "3"],
      lastPlayedMathType: "oops",
      lastPlayedDifficulty: "oops",
    }),
  ]) {
    const ctx = context(stored);
    const s = vm.runInContext("SaveManager.load()", ctx);
    assert.equal(s.highScore, 0);
    assert.equal(s.selectedCharacter, 0);
    assert.equal(s.lastPlayedMathType, "addition");
  }
});
