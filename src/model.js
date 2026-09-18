// Simulation units are tiles and seconds. Rendering never decides collisions.
export const HOP_TIME = 0.17;
export const TRAIN_PERIOD = 8;
export const wrap = (x) => ((((x + 7) % 14) + 14) % 14) - 7;
export function laneType(id) {
  if (id < 3 || id % 5 === 0 || id % 5 === 1) return "grass";
  return ["road", "water", "rail"][Math.floor((id - 2) / 5) % 3];
}
export class CrossingGame {
  constructor({ random = Math.random, difficulty = "easy" } = {}) {
    this.random = random;
    this.difficulty = difficulty;
    this.x = 0;
    this.row = 0;
    this.furthest = 0;
    this.score = 0;
    this.lives = 3;
    this.correct = 0;
    this.streak = 0;
    this.time = 0;
    this.status = "playing";
    this.hop = null;
    this.invincible = 0;
    this.checkpoint = 0;
    this.nextQuiz = 5;
    this.quizReason = null;
    this.lanes = new Map();
    this.ensureLanes();
  }
  ensureLanes() {
    for (let id = Math.max(-3, this.row - 5); id <= this.row + 17; id++) {
      if (this.lanes.has(id)) continue;
      const type = laneType(id),
        direction = this.random() < 0.5 ? -1 : 1;
      const speed = Math.min(1.7, 0.72 + Math.max(id, 0) * 0.012);
      const lane = {
        id,
        type,
        direction,
        speed,
        phase: this.random() * 2,
        warning: false,
        active: false,
        objects: [],
      };
      if (type === "road")
        lane.objects = [-5, 0, 5].map((x, i) => ({
          x: x + this.random(),
          width: 1.35,
          color: i,
        }));
      if (type === "water")
        lane.objects = [-5, -0.3, 4.4].map((x) => ({ x, width: 3.1 }));
      if (type === "rail") lane.objects = [{ x: -10, width: 4.8 }];
      this.lanes.set(id, lane);
    }
    for (const id of this.lanes.keys())
      if (id < this.row - 5 || id > this.row + 17) this.lanes.delete(id);
  }
  move(dx, dr) {
    if (
      this.status !== "playing" ||
      this.hop ||
      Math.abs(dx) + Math.abs(dr) !== 1
    )
      return false;
    const x = Math.round(this.x) + dx,
      row = this.row + dr;
    if (x < -3 || x > 3 || row < Math.max(0, this.furthest - 4)) return false;
    this.hop = {
      fromX: this.x,
      fromRow: this.row,
      toX: x,
      toRow: row,
      elapsed: 0,
    };
    return true;
  }
  tick(delta) {
    if (this.status !== "playing") return;
    // Substeps prevent tunneling on slower devices; hidden tabs are paused by UI.
    let remaining = Math.min(Math.max(delta, 0), 0.1);
    while (remaining > 0 && this.status === "playing") {
      const dt = Math.min(remaining, 1 / 120);
      remaining -= dt;
      this.step(dt);
    }
  }
  step(dt) {
    this.time += dt;
    this.invincible = Math.max(0, this.invincible - dt);
    for (const lane of this.lanes.values()) {
      if (lane.type === "rail") {
        const phase = (this.time + lane.phase) % TRAIN_PERIOD;
        lane.warning = phase >= 3.5 && phase < 7;
        lane.active = phase >= 5 && phase < 7;
        lane.objects[0].x = lane.active
          ? (-10 + (phase - 5) * 10) * lane.direction
          : -15;
      } else
        for (const object of lane.objects)
          object.x = wrap(object.x + dt * lane.speed * lane.direction);
    }
    if (this.hop) {
      this.hop.elapsed += dt;
      if (this.hop.elapsed < HOP_TIME) return;
      this.x = this.hop.toX;
      this.row = this.hop.toRow;
      this.hop = null;
      if (this.row > this.furthest) {
        this.score += (this.row - this.furthest) * 10;
        this.furthest = this.row;
      }
      this.ensureLanes();
      if (this.lanes.get(this.row).type === "grass") this.checkpoint = this.row;
      if (
        this.furthest >= this.nextQuiz &&
        this.lanes.get(this.row).type === "grass"
      ) {
        this.nextQuiz += 5;
        this.beginQuiz("checkpoint");
        return;
      }
    }
    const lane = this.lanes.get(this.row);
    if (lane.type === "water") {
      const log = lane.objects.find(
        (o) => Math.abs(o.x - this.x) < o.width / 2 - 0.12,
      );
      if (log) this.x += lane.speed * lane.direction * dt;
      if ((!log || Math.abs(this.x) > 3.65) && !this.invincible)
        this.beginQuiz("water");
    } else if (
      !this.invincible &&
      (lane.type === "road" || (lane.type === "rail" && lane.active))
    ) {
      if (lane.objects.some((o) => Math.abs(o.x - this.x) < o.width / 2 + 0.22))
        this.beginQuiz(lane.type);
    }
  }
  beginQuiz(reason) {
    if (this.status === "playing") {
      this.status = "quiz";
      this.quizReason = reason;
      this.hop = null;
    }
  }
  answer(correct) {
    if (this.status !== "quiz") return;
    if (correct) {
      this.correct++;
      this.streak++;
      this.score += 25 + Math.min(this.streak - 1, 3) * 5;
    } else {
      this.lives--;
      this.streak = 0;
    }
    this.x = 0;
    this.row = this.checkpoint;
    this.hop = null;
    this.invincible = 1.5;
    this.ensureLanes();
    this.status = this.lives > 0 ? "playing" : "over";
  }
  pause() {
    if (this.status === "playing") {
      this.status = "paused";
      this.hop = null;
    }
  }
  resume() {
    if (this.status === "paused") this.status = "playing";
  }
  visualPosition() {
    if (!this.hop) return { x: this.x, row: this.row, height: 0 };
    const t = Math.min(1, this.hop.elapsed / HOP_TIME);
    return {
      x: this.hop.fromX + (this.hop.toX - this.hop.fromX) * t,
      row: this.hop.fromRow + (this.hop.toRow - this.hop.fromRow) * t,
      height: Math.sin(t * Math.PI) * 0.52,
    };
  }
}
