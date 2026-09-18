import { test, expect } from "@playwright/test";
const saveKey = "nya_math_game_save";
async function boot(page) {
  await page.addInitScript(() => {
    let seed = 123456;
    Math.random = () =>
      (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  });
  await page.goto("/");
  await expect(page.locator("#loading")).toHaveCount(0);
}
async function hop(page, key = "ArrowUp") {
  await page.keyboard.press(key);
  await page.waitForTimeout(240);
}
async function solve(page, correct = true) {
  await expect(page.locator(".equation")).toBeVisible();
  const equation = await page.locator(".equation").innerText();
  const [a, op, b] = equation.split(" ");
  const values = {
    "+": Number(a) + Number(b),
    "-": Number(a) - Number(b),
    "×": Number(a) * Number(b),
    "÷": Number(a) / Number(b),
  };
  const value = values[op];
  const choices = page.locator("[data-answer]");
  for (let i = 0; i < 4; i++) {
    const button = choices.nth(i);
    if (
      (Number(await button.getAttribute("data-answer")) === value) ===
      correct
    ) {
      await button.click();
      break;
    }
  }
  await expect(page.locator(".feedback")).not.toBeEmpty();
  await page.locator("#continue").click();
}
test("desktop renders local 3D scene, full play loop, pause and persistence", async ({
  page,
}) => {
  const errors = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:8176") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  await boot(page);
  await page.screenshot({ path: "test-results/home-desktop.png" });
  await page.getByRole("button", { name: "Let's hop!" }).click();
  await hop(page);
  await expect(page.locator("#distance")).toHaveText("1");
  await hop(page, "ArrowDown");
  await hop(page);
  await expect(page.locator("#score")).toHaveText("10");
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A little breather." }),
  ).toBeVisible();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("#distance")).toHaveText("1");
  await page.getByRole("button", { name: "Keep hopping" }).click();
  for (
    let i = 0;
    i < 35 && Number(await page.locator("#distance").innerText()) < 5;
    i++
  ) {
    if (await page.locator(".equation").isVisible()) await solve(page);
    else await hop(page);
  }
  await expect(page.locator(".equation")).toBeVisible();
  await page.screenshot({ path: "test-results/quiz-desktop.png" });
  await solve(page);
  await page.screenshot({ path: "test-results/play-desktop.png" });
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await page.getByRole("button", { name: "Finish this adventure" }).click();
  await expect(page.locator(".summary-score")).toBeVisible();
  const score = Number(await page.locator(".summary-score").innerText());
  expect(score).toBeGreaterThanOrEqual(75);
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    saveKey,
  );
  expect(saved.highScore).toBe(score);
  expect(saved.cumulativeScore).toBe(score);
  await page.getByRole("button", { name: "Back to the meadow" }).click();
  await page.reload();
  await expect(page.locator("#best")).toHaveText(String(score));
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
test("three wrong answers end the run, show corrections and restart cleanly", async ({
  page,
}) => {
  await boot(page);
  await page.getByRole("button", { name: "Let's hop!" }).click();
  let wrong = 0;
  for (let i = 0; i < 70 && wrong < 3; i++) {
    if (await page.locator(".equation").isVisible()) {
      await solve(page, false);
      wrong++;
    } else await hop(page);
  }
  expect(wrong).toBe(3);
  await expect(page.locator(".summary-score")).toBeVisible();
  await page.getByRole("button", { name: "Hop again", exact: true }).click();
  await expect(page.locator("#distance")).toHaveText("0");
  await expect(page.locator("#hearts")).toHaveAttribute(
    "aria-label",
    "3 hearts remaining",
  );
});
test("legacy character, operation and difficulty survive; all unlocked characters selectable", async ({
  page,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          highScore: 650,
          cumulativeScore: 700,
          selectedCharacter: 3,
          unlockedCharacters: [0, 1, 2, 3],
          lastPlayedMathType: "division",
          lastPlayedDifficulty: "hard",
        }),
      ),
    saveKey,
  );
  await boot(page);
  await expect(page.locator("#selected-name")).toHaveText("Kitty");
  await expect(page.locator("[data-op=division]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#difficulty")).toHaveValue("hard");
  await page.locator("#characters").click();
  await expect(page.locator('[data-character="4"]')).toBeDisabled();
  await page.locator('[data-character="1"]').click();
  await expect(page.locator("#selected-name")).toHaveText("Chick");
});
test("mobile touch buttons, swipe, dialogs and layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await boot(page);
  await page.screenshot({ path: "test-results/home-mobile.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Let's hop!" }).click();
  await page.getByRole("button", { name: "Hop forward", exact: true }).click();
  await expect(page.locator("#distance")).toHaveText("1");
  await page.mouse.move(190, 440);
  await page.mouse.down();
  await page.mouse.move(190, 380, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator("#distance")).toHaveText("2");
  await page.screenshot({ path: "test-results/play-mobile.png" });
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await expect(page.locator("#resume")).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(page.locator("#dialog")).not.toBeVisible();
});
