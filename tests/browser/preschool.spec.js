import { test, expect } from "@playwright/test";
async function mockSpeech(page) {
  await page.addInitScript(() => {
    window.speechMock = { cancelCalls: 0, speaking: false };
    window.spoken = [];
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel() {
          window.speechMock.cancelCalls++;
          window.speechMock.speaking = false;
        },
        speak(utterance) {
          window.spoken.push(utterance.text);
          window.lastUtterance = utterance;
          window.speechMock.speaking = true;
        },
      },
    });
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
  });
}
async function startSpeech(page) {
  await page.locator("#hear-question").click();
  const state = await page.evaluate(() => window.speechMock);
  expect(state.speaking).toBe(true);
  return state.cancelCalls;
}
async function expectSpeechStopped(page, cancelCallsBefore) {
  const state = await page.evaluate(() => window.speechMock);
  expect(state.cancelCalls).toBeGreaterThan(cancelCallsBefore);
  expect(state.speaking).toBe(false);
}
async function boot(page) {
  await page.addInitScript(() => {
    let seed = 123456;
    Math.random = () =>
      (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  });
  await page.goto("/");
  await expect(page.locator("#loading")).toHaveCount(0);
}
async function nextQuestion(page) {
  for (let i = 0; i < 30; i++) {
    if (await page.locator("#dialog").isVisible()) return;
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(240);
  }
  await expect(page.locator(".picture-question")).toBeAttached();
}
async function correctChoice(page) {
  const skill = await page
    .locator(".picture-question")
    .getAttribute("data-skill");
  const prompt = await page.locator("#dialog-title").innerText();
  if (skill === "counting")
    return page.locator(
      `[data-answer="${await page.locator(".picture-question svg").count()}"]`,
    );
  if (skill === "number-name") {
    const words = ["zero", "one", "two", "three", "four", "five"];
    const word = words.find((w) =>
      prompt.toLowerCase().split(/\W+/).includes(w),
    );
    return page.locator(`[data-answer="objects-${words.indexOf(word)}"]`);
  }
  if (skill === "shape")
    return page.locator(`[data-answer="${prompt.match(/the (\w+)/)[1]}"]`);
  if (skill === "color")
    return page.locator(`[data-answer="${prompt.match(/the (\w+)/)[1]}"]`);
  const shape = await page
    .locator(".pattern-sequence .picture-symbol")
    .nth(1)
    .getAttribute("aria-label");
  return page.locator(`[data-answer="${shape}"]`);
}
test("player switching remembers math settings, isolates progress and persists selected player", async ({
  page,
}) => {
  await boot(page);
  await page.locator("[data-op=division]").click();
  await page.locator("#difficulty").selectOption("hard");
  await page.locator("[data-player=ariana]").click();
  await expect(page.locator("#math-settings")).toBeHidden();
  await expect(page.locator("#preschool-settings")).toBeVisible();
  await page.locator("[data-player=nya]").click();
  await expect(page.locator("[data-op=division]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#difficulty")).toHaveValue("hard");
  await page.locator("[data-player=ariana]").click();
  await page.reload();
  await expect(page.locator("[data-player=ariana]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#play").click();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("#distance")).toHaveText("1");
  await page.locator("#pause").click();
  await page.locator("#end-run").click();
  await page.locator("#back-home").click();
  await expect(page.locator("#best")).toHaveText("10");
  await page.locator("[data-player=nya]").click();
  await expect(page.locator("#best")).toHaveText("0");
});
test("all five preschool skills render, accept correct answers, speak and safely recover", async ({
  page,
}) => {
  test.setTimeout(100000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mockSpeech(page);
  await boot(page);
  await page.locator("[data-player=ariana]").click();
  await page.screenshot({ path: "test-results/ariana-menu-desktop.png" });
  await page.locator("#play").click();
  const skills = [];
  for (let i = 0; i < 5; i++) {
    await nextQuestion(page);
    const skill = await page
      .locator(".picture-question")
      .getAttribute("data-skill");
    skills.push(skill);
    await expect(page.locator(".equation")).toHaveCount(0);
    await expect(page.locator("[data-answer]")).toHaveCount(3);
    const cancelCallsBeforeAnswer = await startSpeech(page);
    expect(await page.evaluate(() => window.spoken.length)).toBe(i * 2 + 1);
    if (i === 0) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/ariana-counting.png" });
    }
    if (i === 4)
      await page.screenshot({ path: "test-results/ariana-pattern.png" });
    await (await correctChoice(page)).click();
    await expectSpeechStopped(page, cancelCallsBeforeAnswer);
    await expect(page.locator(".feedback")).toContainText("You found it!");
    const feedback = await page.locator(".feedback").innerText();
    const cancelCallsBeforeClose = await startSpeech(page);
    expect(await page.evaluate(() => window.spoken.at(-1))).toBe(feedback);
    await page.locator("#continue").click();
    await expect(page.locator("#dialog")).not.toBeVisible();
    await expectSpeechStopped(page, cancelCallsBeforeClose);
    // Some browsers deliver speech errors after cancellation and dialog removal.
    await page.evaluate(() =>
      window.lastUtterance.onerror({ error: "audio-busy" }),
    );
    await expect(page.locator("#hearts")).toHaveAttribute(
      "aria-label",
      "3 hearts remaining",
    );
  }
  expect(skills).toEqual([
    "counting",
    "number-name",
    "shape",
    "color",
    "pattern",
  ]);
  expect(errors).toEqual([]);
  await page.locator("#pause").click();
  await page.locator("#end-run").click();
  await page.locator("#again").click();
  await nextQuestion(page);
  await expect(page.locator(".picture-question")).toHaveAttribute(
    "data-skill",
    "counting",
  );
});
test("mobile picture questions show helpful correction, keep controls in view and support mute", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await boot(page);
  await page.locator("[data-player=ariana]").click();
  await page.locator("#sound").click();
  await page.locator("#play").click();
  await nextQuestion(page);
  await expect(page.locator("#hear-question")).toBeDisabled();
  await expect(page.locator("#speech-help")).toHaveText("Sound is off.");
  const right = await correctChoice(page);
  const answer = await right.getAttribute("data-answer");
  await page
    .locator(`[data-answer]:not([data-answer="${answer}"])`)
    .first()
    .click();
  await expect(page.locator(".feedback")).toContainText("Let’s look together.");
  await expect(right).toHaveClass(/correct/);
  await expect(page.locator("#continue")).toBeInViewport();
  await page.screenshot({ path: "test-results/ariana-mobile-feedback.png" });
  await page.locator("#continue").click();
  await expect(page.locator("#hearts")).toHaveAttribute(
    "aria-label",
    "2 hearts remaining",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("speech unavailable falls back to grown-up reading without blocking questions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });
  await boot(page);
  await page.locator("[data-player=ariana]").click();
  await page.locator("#play").click();
  await nextQuestion(page);
  await expect(page.locator("#hear-question")).toBeDisabled();
  await expect(page.locator("#speech-help")).toContainText("grown-up");
  await (await correctChoice(page)).click();
  await page.locator("#continue").click();
  await expect(page.locator("#dialog")).not.toBeVisible();
});

test("speech stops on hidden tab, incorrect answer and dialog close; Hear question reads feedback", async ({
  page,
}) => {
  await mockSpeech(page);
  await boot(page);
  await page.locator("[data-player=ariana]").click();
  await page.locator("#play").click();
  await nextQuestion(page);

  const cancelCallsBeforeHide = await startSpeech(page);
  // Simulate the browser visibility transition while narration is active.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expectSpeechStopped(page, cancelCallsBeforeHide);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });

  const cancelCallsBeforeAnswer = await startSpeech(page);
  const right = await correctChoice(page);
  const answer = await right.getAttribute("data-answer");
  await page
    .locator(`[data-answer]:not([data-answer="${answer}"])`)
    .first()
    .click();
  await expectSpeechStopped(page, cancelCallsBeforeAnswer);
  await expect(page.locator(".feedback")).toContainText("Let’s look together.");

  const feedback = await page.locator(".feedback").innerText();
  const cancelCallsBeforeClose = await startSpeech(page);
  expect(await page.evaluate(() => window.spoken.at(-1))).toBe(feedback);
  await page.locator("#continue").click();
  await expect(page.locator("#dialog")).not.toBeVisible();
  await expectSpeechStopped(page, cancelCallsBeforeClose);
});
