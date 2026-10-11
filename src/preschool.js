// Picture-first questions stay within 1–5 and never scale with distance.
export const NUMBER_NAMES = ["zero", "one", "two", "three", "four", "five"];
const SHAPES = ["circle", "square", "triangle", "star"];
const COLORS = [
  { id: "red", hex: "#db4549" },
  { id: "blue", hex: "#3276cb" },
  { id: "yellow", hex: "#f4ca42" },
  { id: "green", hex: "#469455" },
];
const SKILLS = ["counting", "number-name", "shape", "color", "pattern"];
export class PreschoolQuestions {
  constructor(random = Math.random) {
    this.random = random;
    this.index = 0;
  }
  pick(items) {
    return items[Math.floor(this.random() * items.length)];
  }
  shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  generate(skill = SKILLS[this.index++ % SKILLS.length]) {
    const quantity = () => this.pick([1, 2, 3, 4, 5]);
    const group = (count) => ({
      id: `objects-${count}`,
      kind: "objects",
      count,
      label: `${NUMBER_NAMES[count]} ${count === 1 ? "apple" : "apples"}`,
    });
    const shape = (name) => ({
      id: name,
      kind: "shape",
      shape: name,
      label: name,
    });
    let prompt, items, choices, answer, word, explanation;
    if (skill === "counting") {
      const count = quantity();
      items = [group(count)];
      prompt = "How many apples do you see?";
      choices = [
        count,
        ...this.shuffle([1, 2, 3, 4, 5].filter((n) => n !== count)).slice(0, 2),
      ].map((n) => ({
        id: String(n),
        kind: "number",
        number: n,
        label: String(n),
      }));
      answer = String(count);
      explanation = `There ${count === 1 ? "is" : "are"} ${group(count).label}.`;
    } else if (skill === "number-name") {
      const count = quantity();
      word = NUMBER_NAMES[count];
      items = [];
      prompt = `Can you find ${word} ${count === 1 ? "apple" : "apples"}?`;
      choices = [
        count,
        ...this.shuffle([1, 2, 3, 4, 5].filter((n) => n !== count)).slice(0, 2),
      ].map(group);
      answer = `objects-${count}`;
      explanation = `${word.charAt(0).toUpperCase() + word.slice(1)} means ${count}. This group has ${group(count).label}.`;
    } else if (skill === "shape") {
      const name = this.pick(SHAPES);
      items = [];
      prompt = `Can you find the ${name}?`;
      choices = [
        name,
        ...this.shuffle(SHAPES.filter((n) => n !== name)).slice(0, 2),
      ].map(shape);
      answer = name;
      explanation = `This is the ${name}.`;
    } else if (skill === "color") {
      const color = this.pick(COLORS);
      items = [];
      prompt = `Can you find the ${color.id} balloon?`;
      choices = [
        color,
        ...this.shuffle(COLORS.filter((c) => c !== color)).slice(0, 2),
      ].map((c) => ({
        id: c.id,
        kind: "color",
        color: c.hex,
        label: `${c.id} balloon`,
      }));
      answer = color.id;
      explanation = `This balloon is ${color.id}.`;
    } else if (skill === "pattern") {
      const [a, b, c] = this.shuffle(SHAPES);
      items = [a, b, a, b, a].map(shape);
      prompt = "What comes next?";
      choices = [a, b, c].map(shape);
      answer = b;
      explanation = `${a}, ${b}, ${a}, ${b}, ${a}… ${b} comes next!`;
    } else throw new Error(`Unknown preschool skill: ${skill}`);
    const spokenPrompt =
      skill === "pattern"
        ? `${items.map((item) => item.label).join(", ")}. What comes next?`
        : prompt;
    return {
      skill,
      prompt,
      spokenPrompt,
      items,
      choices: this.shuffle(choices),
      answer,
      word,
      explanation,
    };
  }
}
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function svg(body) {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${body}</svg>`;
}
const apple = () =>
  svg(
    '<path d="M32 18c-5-8-23-6-24 10-2 14 7 29 17 26 4-2 10-2 14 0 10 3 19-12 17-26-1-16-19-18-24-10Z" fill="#dc5b4e"/><path d="M32 18 34 8" stroke="#77553d" stroke-width="5" stroke-linecap="round"/><path d="M35 12c0-8 9-10 16-8-1 8-8 12-16 8Z" fill="#59945b"/><path d="M17 27c-3 5-2 10 0 13" stroke="#f79c7c" stroke-width="4" stroke-linecap="round"/>',
  );
export function renderPicture(item) {
  if (item.kind === "number")
    return `<span class="picture-number">${item.number}</span>`;
  if (item.kind === "objects")
    return `<span class="object-group" role="img" aria-label="${escape(item.label)}">${Array.from({ length: item.count }, apple).join("")}</span>`;
  if (item.kind === "color")
    return `<span class="picture-symbol" role="img" aria-label="${escape(item.label)}">${svg(`<path d="M32 41v14l5 6" fill="none" stroke="#6d7769" stroke-width="2"/><ellipse cx="32" cy="24" rx="19" ry="22" fill="${item.color}"/><path d="m32 44-4 5h8Z" fill="${item.color}"/><path d="M21 15c-3 3-4 7-4 10" fill="none" stroke="#fff9e3" stroke-width="3" stroke-linecap="round"/>`)}</span>`;
  const bodies = {
    circle: '<circle cx="32" cy="32" r="23"/>',
    square: '<rect x="10" y="10" width="44" height="44" rx="3"/>',
    triangle: '<polygon points="32,7 58,55 6,55"/>',
    star: '<polygon points="32,4 40,22 60,24 45,38 49,58 32,48 15,58 19,38 4,24 24,22"/>',
  };
  return `<span class="picture-symbol" role="img" aria-label="${escape(item.label)}">${svg(`<g fill="#6d80c3" stroke="#4c5b96" stroke-width="2" stroke-linejoin="round">${bodies[item.shape]}</g>`)}</span>`;
}
