import test from "node:test";
import assert from "node:assert/strict";
import { PreschoolQuestions, renderPicture } from "../src/preschool.js";

test("preschool cycle covers five skills with three distinct choices and one valid answer", () => {
  const generator = new PreschoolQuestions();
  const skills = new Set();
  for (let i = 0; i < 500; i++) {
    const question = generator.generate();
    skills.add(question.skill);
    assert.equal(question.choices.length, 3);
    assert.equal(new Set(question.choices.map((c) => c.id)).size, 3);
    assert.equal(
      question.choices.filter((c) => c.id === question.answer).length,
      1,
    );
    assert(question.prompt && question.spokenPrompt && question.explanation);
    for (const item of question.items) {
      if (item.count !== undefined) assert(item.count >= 1 && item.count <= 5);
    }
  }
  assert.deepEqual(
    [...skills],
    ["counting", "number-name", "shape", "color", "pattern"],
  );
});
test("counting and number-name answers match the exact pictured quantities", () => {
  for (let i = 0; i < 100; i++) {
    const q = new PreschoolQuestions().generate("counting");
    const answer = q.choices.find((c) => c.id === q.answer);
    assert.equal(answer.number, q.items[0].count);
    const names = ["zero", "one", "two", "three", "four", "five"];
    const name = new PreschoolQuestions().generate("number-name");
    const matching = name.choices.find((c) => c.id === name.answer);
    assert.equal(names[matching.count], name.word);
  }
});
test("patterns have a visible repeated AB rule and correct next item", () => {
  for (let i = 0; i < 100; i++) {
    const q = new PreschoolQuestions().generate("pattern");
    assert.equal(q.items.length, 5);
    assert.equal(q.items[0].id, q.items[2].id);
    assert.equal(q.items[1].id, q.items[3].id);
    assert.notEqual(q.items[0].id, q.items[1].id);
    assert.equal(q.answer, q.items[1].id);
  }
});
test("visuals render each object separately and provide accessible group names", () => {
  const html = renderPicture({
    kind: "objects",
    count: 5,
    label: "five apples",
  });
  assert.equal((html.match(/<svg /g) || []).length, 5);
  assert.match(html, /five apples/);
  assert.match(
    renderPicture({ kind: "shape", shape: "triangle", label: "triangle" }),
    /<polygon/,
  );
});
