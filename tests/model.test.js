import test from "node:test";
import assert from "node:assert/strict";
import { CrossingGame, laneType } from "../src/model.js";
const advance = (g, n = 20) => {
  for (let i = 0; i < n; i++) g.tick(0.01);
};
test("hops are bounded, rate limited, and only new distance scores", () => {
  const g = new CrossingGame();
  assert.equal(g.move(0, -1), false);
  assert(g.move(0, 1));
  assert.equal(g.move(0, 1), false);
  advance(g);
  assert.equal(g.score, 10);
  g.move(0, -1);
  advance(g);
  g.move(0, 1);
  advance(g);
  assert.equal(g.score, 10);
  g.x = 3;
  assert.equal(g.move(1, 0), false);
});
test("pause and quiz freeze time, hazards, and movement", () => {
  const g = new CrossingGame();
  g.pause();
  g.tick(1);
  assert.equal(g.time, 0);
  assert.equal(g.move(0, 1), false);
  g.resume();
  advance(g);
  g.beginQuiz("road");
  const time = g.time;
  g.tick(1);
  assert.equal(g.time, time);
});
test("road collision starts one rescue, wrong costs one life, recovery is safe", () => {
  const g = new CrossingGame();
  g.row = 3;
  g.lanes.get(3).objects[0].x = 0;
  g.tick(0.01);
  assert.equal(g.status, "quiz");
  assert.equal(g.quizReason, "road");
  g.answer(false);
  g.answer(false);
  assert.equal(g.lives, 2);
  assert.equal(g.row, 0);
  assert.equal(g.status, "playing");
  assert(g.invincible > 0);
});
test("logs carry horizontally, a missed log triggers rescue", () => {
  const g = new CrossingGame({ random: () => 0.8 });
  g.row = 7;
  const lane = g.lanes.get(7);
  lane.objects = [{ x: 0, width: 3.1 }];
  g.tick(0.05);
  assert(g.x > 0);
  assert.equal(g.status, "playing");
  g.x = 3;
  g.tick(0.01);
  assert.equal(g.quizReason, "water");
});
test("trains warn before becoming dangerous", () => {
  const g = new CrossingGame();
  const lane = g.lanes.get(12);
  lane.phase = 0;
  g.time = 3.6;
  g.tick(0.01);
  assert(lane.warning);
  assert.equal(lane.active, false);
  g.time = 5.9;
  g.row = 12;
  g.tick(0.1);
  assert(lane.active);
  assert.equal(g.status, "quiz");
});
test("checkpoint rewards and three incorrect answers end run", () => {
  const g = new CrossingGame();
  g.row = 4;
  g.furthest = 4;
  g.move(0, 1);
  advance(g);
  assert.equal(g.quizReason, "checkpoint");
  g.answer(true);
  assert.equal(g.score, 35);
  assert.equal(g.row, 5);
  for (let i = 0; i < 3; i++) {
    g.beginQuiz("road");
    g.answer(false);
  }
  assert.equal(g.status, "over");
  assert.equal(g.lives, 0);
  assert.equal(g.move(1, 0), false);
});
test("infinite terrain retains bounded objects and speeds with safe gaps", () => {
  const g = new CrossingGame();
  for (let i = 0; i < 1000; i++) {
    g.row = i;
    g.ensureLanes();
    assert(g.lanes.size <= 23);
    for (const l of g.lanes.values()) assert(l.speed <= 1.7);
  }
  for (let i = 0; i < 100; i += 5) {
    assert.equal(laneType(i), "grass");
    assert.equal(laneType(i + 1), "grass");
  }
});
test("pausing mid-hop freezes the accepted move and resumes it exactly once", () => {
  const g = new CrossingGame();
  assert(g.move(0, 1));
  g.tick(0.07);
  const position = g.visualPosition();
  const time = g.time;
  const hazardX = g.lanes.get(3).objects[0].x;
  g.pause();
  g.tick(1);
  assert.deepEqual(g.visualPosition(), position);
  assert.equal(g.time, time);
  assert.equal(g.lanes.get(3).objects[0].x, hazardX);
  assert.equal(g.move(1, 0), false);
  g.resume();
  g.tick(0.05);
  assert.equal(g.row, 0);
  assert(g.visualPosition().row > position.row);
  advance(g);
  assert.equal(g.row, 1);
  assert.equal(g.score, 10);
  assert.equal(g.hop, null);
  advance(g);
  assert.equal(g.score, 10);
});
