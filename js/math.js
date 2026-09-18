// MathProblemGenerator - Creates math problems with difficulty scaling (Phase 5 implementation)

class MathProblemGenerator {
  constructor(operation, difficulty) {
    this.operation = operation; // 'addition', 'subtraction', 'multiplication', 'division'
    this.baseDifficulty = difficulty; // 'easy', 'medium', 'hard', 'expert'
    this.nudgeCount = 0; // Incremented every 5 rows to scale difficulty
  }

  between(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Increment difficulty nudge (called every 5 rows)
  nudgeDifficulty() {
    this.nudgeCount = Math.min(this.nudgeCount + 1, 10);
  }

  // Get effective ranges based on base difficulty + nudge interpolation
  getEffectiveRanges() {
    const ranges = MATH_RANGES[this.operation][this.baseDifficulty];

    // Apply nudge scaling (increase ranges slightly every nudge)
    const scale = 1 + this.nudgeCount * 0.1;
    const scaledRanges = {};

    for (const key in ranges) {
      if (key.startsWith("min")) {
        scaledRanges[key] = ranges[key];
      } else {
        scaledRanges[key] = Math.floor(ranges[key] * scale);
      }
    }

    return scaledRanges;
  }

  // Generate a math problem with 4 answer choices
  generate() {
    let operandA, operandB, answer, displayString;
    const ranges = this.getEffectiveRanges();
    const symbol = OPERATION_SYMBOLS[this.operation];

    switch (this.operation) {
      case "addition":
        operandA = this.between(ranges.minA, ranges.maxA);
        operandB = this.between(ranges.minB, ranges.maxB);
        answer = operandA + operandB;
        displayString = `${operandA} ${symbol} ${operandB} = ?`;
        break;

      case "subtraction":
        // Generate result first to ensure non-negative answer
        answer = this.between(ranges.minResult, ranges.maxResult);
        operandB = this.between(
          ranges.minB,
          Math.min(ranges.maxB, answer + 10),
        );
        operandA = answer + operandB;
        displayString = `${operandA} ${symbol} ${operandB} = ?`;
        break;

      case "multiplication":
        operandA = this.between(ranges.minA, ranges.maxA);
        operandB = this.between(ranges.minB, ranges.maxB);
        answer = operandA * operandB;
        displayString = `${operandA} ${symbol} ${operandB} = ?`;
        break;

      case "division":
        // Generate divisor and multiplier to ensure clean division
        operandB = this.between(ranges.minDivisor, ranges.maxDivisor);
        const multiplier = this.between(
          ranges.minMultiplier,
          ranges.maxMultiplier,
        );
        operandA = operandB * multiplier;
        answer = multiplier;
        displayString = `${operandA} ${symbol} ${operandB} = ?`;
        break;

      default:
        operandA = 1;
        operandB = 1;
        answer = 2;
        displayString = "1 + 1 = ?";
    }

    const choices = this._generateChoices(answer);

    return {
      operation: this.operation,
      operandA,
      operandB,
      answer,
      choices,
      displayString,
    };
  }

  // Generate 4 choices including the correct answer
  _generateChoices(correctAnswer) {
    const choices = [correctAnswer];
    const wrongChoices = this._generateWrongChoices(correctAnswer);

    choices.push(...wrongChoices);

    // Shuffle the choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = this.between(0, i);
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  }

  // Generate 3 plausible wrong answer choices
  _generateWrongChoices(correctAnswer) {
    const wrong = [];
    const usedValues = new Set([correctAnswer]);

    // Generate plausible wrong answers near the correct one
    const offsets = [-2, -1, 1, 2, 3, -3, 4, -4, 5, -5];

    for (const offset of offsets) {
      if (wrong.length >= 3) break;

      let wrongAnswer = correctAnswer + offset;

      // Ensure positive and not duplicate
      if (wrongAnswer > 0 && !usedValues.has(wrongAnswer)) {
        wrong.push(wrongAnswer);
        usedValues.add(wrongAnswer);
      }
    }

    // Fallback if we couldn't generate enough
    while (wrong.length < 3) {
      const fallback = this.between(1, Math.max(correctAnswer * 2, 10));
      if (!usedValues.has(fallback)) {
        wrong.push(fallback);
        usedValues.add(fallback);
      }
    }

    return wrong;
  }
}
