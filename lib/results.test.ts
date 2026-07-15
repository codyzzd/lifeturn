import { describe, expect, it } from "vitest";
import { buildAssessmentResult, calculateAssessmentScores, type Answers } from "./results";

const healthyAnswers = (): Answers => ({
  "q1-direction-energy": "family",
  "q2-direction-mind": "family",
  "q3-next-goal": 4,
  "q4-satisfaction-duration": "lasting",
  "q5-desired-returns": ["love", "peace"],
  "q6-current-drive": "meaning",
  "q7-freedom-change": 8,
  "q8-peace-change": 8,
  "q9-return-delivered": "agree",
  "q10-one-more-goal": "rarely",
  "q11-best-attention": "almost-always",
  "q12-mental-presence": "almost-always",
  "q13-hidden-costs": ["none"],
  "q14-ten-year-worry": "none",
  "q15-identity-stability": 8,
  "q16-unseen-investment": 80,
  "q17-uncomfortable-truth": "none",
  "q18-postponed-change": "no",
  "q19-change-response": "often",
  "q20-waiting-easier": "disagree",
});

describe("calculateAssessmentScores", () => {
  it("calcula cinco indicadores entre zero e cem", () => {
    const scores = calculateAssessmentScores(healthyAnswers());
    expect(Object.keys(scores)).toEqual([
      "directionConcentration",
      "returnAlignment",
      "hiddenCost",
      "essentialAlignment",
      "transformation",
    ]);
    Object.values(scores).forEach((score) => expect(score).toBeGreaterThanOrEqual(0));
    Object.values(scores).forEach((score) => expect(score).toBeLessThanOrEqual(100));
    expect(scores.hiddenCost).toBe(0);
  });

  it("aplica pontuação reversa à dependência da próxima meta", () => {
    const lowDependency = calculateAssessmentScores({ ...healthyAnswers(), "q10-one-more-goal": "never" });
    const highDependency = calculateAssessmentScores({ ...healthyAnswers(), "q10-one-more-goal": "almost-always" });
    expect(lowDependency.returnAlignment).toBeGreaterThan(highDependency.returnAlignment);
  });

  it("aumenta a concentração quando energia e pensamento apontam para a mesma direção", () => {
    const same = calculateAssessmentScores(healthyAnswers());
    const divided = calculateAssessmentScores({ ...healthyAnswers(), "q2-direction-mind": "work" });
    expect(same.directionConcentration - divided.directionConcentration).toBe(20);
  });
});

describe("motor de contradições", () => {
  it.each([
    ["family-without-presence", {
      "q1-direction-energy": "work", "q2-direction-mind": "work", "q5-desired-returns": ["family-life", "love"],
      "q11-best-attention": "sometimes", "q12-mental-presence": "rarely",
    }],
    ["freedom-through-money", {
      "q1-direction-energy": "money", "q2-direction-mind": "money", "q5-desired-returns": ["freedom", "independence"],
      "q7-freedom-change": 4,
    }],
    ["moving-finish-line", {
      "q1-direction-energy": "work", "q2-direction-mind": "work", "q3-next-goal": 9,
      "q4-satisfaction-duration": "hours", "q10-one-more-goal": "almost-always", "q17-uncomfortable-truth": "enough-achievement",
    }],
    ["body-and-approval", {
      "q1-direction-energy": "body", "q2-direction-mind": "body", "q5-desired-returns": ["confidence", "enough"],
      "q15-identity-stability": 4, "q17-uncomfortable-truth": "enough-achievement",
    }],
    ["service-and-resentment", {
      "q1-direction-energy": "service", "q2-direction-mind": "service", "q14-ten-year-worry": "resentment", "q8-peace-change": 3,
    }],
    ["entertainment-and-escape", {
      "q1-direction-energy": "entertainment", "q2-direction-mind": "entertainment", "q6-current-drive": "escape",
    }],
    ["experiences-without-depth", {
      "q1-direction-energy": "travel", "q2-direction-mind": "travel", "q14-ten-year-worry": "experiences-no-depth",
    }],
    ["external-over-inner-growth", {
      "q1-direction-energy": "work", "q2-direction-mind": "study", "q17-uncomfortable-truth": "achieve-not-love",
      "q19-change-response": "never", "q20-waiting-easier": "strongly-agree",
    }],
    ["busy-and-disconnected", {
      "q1-direction-energy": "social", "q2-direction-mind": "social", "q3-next-goal": 9, "q8-peace-change": 4,
      "q11-best-attention": "sometimes", "q12-mental-presence": "sometimes",
    }],
    ["high-effort-low-return", {
      "q1-direction-energy": "study", "q2-direction-mind": "study", "q3-next-goal": 9,
      "q9-return-delivered": "disagree", "q10-one-more-goal": "often", "q7-freedom-change": 5, "q8-peace-change": 5,
      "q13-hidden-costs": ["rest", "peace", "friendships"], "q14-ten-year-worry": "time",
    }],
  ])("identifica %s sem depender de uma resposta isolada", (patternId, overrides) => {
    expect(buildAssessmentResult({ ...healthyAnswers(), ...overrides }).patternId).toBe(patternId);
  });

  it("reconhece uma direção saudável sem dizer que não há nada a melhorar", () => {
    const result = buildAssessmentResult(healthyAnswers());
    expect(result.patternId).toBe("healthy-direction");
    expect(result.nextStep).toBe("Proteção do essencial");
    expect(result.sevenDayInvitation.length).toBeGreaterThan(30);
  });

  it("usa leitura cautelosa quando os sinais são mistos", () => {
    const result = buildAssessmentResult({
      ...healthyAnswers(),
      "q2-direction-mind": "social",
      "q9-return-delivered": "sometimes",
      "q14-ten-year-worry": "unsure",
    });
    expect(result.patternId).toBe("mixed-direction");
    expect(result.contradiction).toContain("Talvez");
  });
});

describe("resultado e privacidade", () => {
  it("mostra direção secundária quando ela difere da principal", () => {
    const result = buildAssessmentResult({ ...healthyAnswers(), "q2-direction-mind": "work" });
    expect(result.primaryDirection).toBe("família");
    expect(result.secondaryDirection).toBe("trabalho e carreira");
  });

  it("reduz a confiança quando há muitas respostas incertas", () => {
    const clear = buildAssessmentResult(healthyAnswers());
    const uncertain = buildAssessmentResult({
      ...healthyAnswers(),
      "q4-satisfaction-duration": "unsure",
      "q6-current-drive": "unsure",
      "q13-hidden-costs": ["unsure"],
      "q14-ten-year-worry": "unsure",
      "q18-postponed-change": "unsure",
    });
    expect(uncertain.confidence).toBeLessThan(clear.confidence);
    expect(uncertain.confidence).toBeGreaterThanOrEqual(55);
  });

  it("não inclui o texto privado no objeto interpretado", () => {
    const privateText = "Este é um texto que deve ficar apenas no dispositivo.";
    const result = buildAssessmentResult({ ...healthyAnswers(), "q21-open-change": privateText });
    expect(JSON.stringify(result)).not.toContain(privateText);
  });
});
