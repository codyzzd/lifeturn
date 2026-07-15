export type Answer = number | string | string[];
export type Answers = Record<string, Answer>;

export type AssessmentScores = {
  directionConcentration: number;
  returnAlignment: number;
  hiddenCost: number;
  essentialAlignment: number;
  transformation: number;
};

export type AssessmentResult = {
  primaryDirection: string;
  secondaryDirection?: string;
  desiredReturns: string[];
  currentDirectionSummary: string;
  seekingSummary: string;
  actualReturnSummary: string;
  hiddenCostSummary: string;
  contradiction: string;
  nextStep: string;
  sevenDayInvitation: string;
  confidence: number;
  confidenceExplanation: string;
  patternId: string;
  scores: AssessmentScores;
};

const scale: Record<string, number> = {
  never: 0,
  rarely: 25,
  sometimes: 50,
  often: 75,
  "almost-always": 100,
  "strongly-disagree": 0,
  disagree: 25,
  unsure: 50,
  agree: 75,
  "strongly-agree": 100,
};

export const directionLabels: Record<string, string> = {
  work: "trabalho e carreira",
  money: "dinheiro e crescimento financeiro",
  family: "família",
  romantic: "relacionamento amoroso",
  body: "corpo e aparência",
  health: "saúde",
  spirituality: "religião ou espiritualidade",
  service: "serviço a outras pessoas",
  study: "estudo e conhecimento",
  travel: "viagens e experiências",
  entertainment: "entretenimento",
  social: "vida social",
  freedom: "liberdade pessoal",
  other: "outra prioridade importante",
};

export const returnLabels: Record<string, string> = {
  freedom: "liberdade",
  security: "segurança",
  peace: "paz",
  love: "amor",
  time: "mais tempo",
  recognition: "reconhecimento",
  respect: "respeito",
  confidence: "confiança",
  control: "controle",
  belonging: "pertencimento",
  purpose: "propósito",
  happiness: "felicidade",
  independence: "independência",
  "family-life": "uma vida melhor para sua família",
  enough: "sentir que é suficiente",
  other: "algo que considera importante",
};

const costLabels: Record<string, string> = {
  family: "sua família",
  romantic: "seu relacionamento amoroso",
  friendships: "suas amizades",
  health: "sua saúde",
  rest: "seu descanso",
  peace: "sua paz",
  spirituality: "sua vida espiritual",
  growth: "seu crescimento pessoal",
  service: "seu serviço ao próximo",
  creativity: "sua criatividade",
  fun: "sua diversão",
  alone: "seu tempo consigo mesmo",
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));
const stringAnswer = (answers: Answers, id: string) => typeof answers[id] === "string" ? answers[id] as string : "";
const numberAnswer = (answers: Answers, id: string, fallback = 5) => typeof answers[id] === "number" ? answers[id] as number : fallback;
const arrayAnswer = (answers: Answers, id: string) => Array.isArray(answers[id]) ? answers[id] as string[] : [];
const valueOf = (answers: Answers, id: string) => scale[stringAnswer(answers, id)] ?? 50;

function listWords(items: string[]) {
  if (items.length <= 1) return items[0] ?? "algo importante";
  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}

export function calculateAssessmentScores(answers: Answers): AssessmentScores {
  const q1 = stringAnswer(answers, "q1-direction-energy");
  const q2 = stringAnswer(answers, "q2-direction-mind");
  const goalIntensity = numberAnswer(answers, "q3-next-goal") * 10;
  const directionConcentration = clamp(goalIntensity * 0.7 + (q1 === q2 ? 30 : 10));

  const desired = arrayAnswer(answers, "q5-desired-returns");
  const freedom = numberAnswer(answers, "q7-freedom-change") * 10;
  const peace = numberAnswer(answers, "q8-peace-change") * 10;
  const delivered = valueOf(answers, "q9-return-delivered");
  const canRelax = 100 - valueOf(answers, "q10-one-more-goal");
  const wantsFreedom = desired.some((item) => ["freedom", "independence", "time"].includes(item));
  const wantsPeace = desired.some((item) => ["peace", "happiness", "control"].includes(item));
  const relevantExperience = wantsFreedom && wantsPeace ? (freedom + peace) / 2 : wantsFreedom ? freedom : wantsPeace ? peace : (freedom + peace) / 2;
  const returnAlignment = clamp(delivered * 0.4 + canRelax * 0.2 + relevantExperience * 0.4);

  const hiddenAreas = arrayAnswer(answers, "q13-hidden-costs");
  const concreteCosts = hiddenAreas.filter((item) => !["none", "unsure"].includes(item));
  const areaRisk = hiddenAreas.includes("none") ? 0 : hiddenAreas.includes("unsure") && concreteCosts.length === 0 ? 35 : clamp(35 + concreteCosts.length * 20);
  const worry = stringAnswer(answers, "q14-ten-year-worry");
  const worryRisk = worry === "none" ? 0 : worry === "unsure" ? 35 : 80;
  const hiddenCost = clamp((100 - valueOf(answers, "q11-best-attention")) * 0.2 + (100 - valueOf(answers, "q12-mental-presence")) * 0.2 + areaRisk * 0.3 + worryRisk * 0.3);

  const identity = numberAnswer(answers, "q15-identity-stability") * 10;
  const unseen = numberAnswer(answers, "q16-unseen-investment", 50);
  const uncomfortableTruth = stringAnswer(answers, "q17-uncomfortable-truth");
  const truthAlignment = uncomfortableTruth === "none" ? 85 : 30;
  const essentialAlignment = clamp(identity * 0.4 + unseen * 0.4 + truthAlignment * 0.2);

  const changeAwareness: Record<string, number> = { yes: 80, probably: 65, unsure: 50, "probably-not": 45, no: 55 };
  const transformation = clamp((changeAwareness[stringAnswer(answers, "q18-postponed-change")] ?? 50) * 0.2 + valueOf(answers, "q19-change-response") * 0.45 + (100 - valueOf(answers, "q20-waiting-easier")) * 0.35);

  return { directionConcentration, returnAlignment, hiddenCost, essentialAlignment, transformation };
}

type Pattern = {
  id: string;
  contradiction: string;
  nextStep: string;
  invitation: string;
  support: number;
};

function choosePattern(answers: Answers, scores: AssessmentScores): Pattern {
  const primary = stringAnswer(answers, "q1-direction-energy");
  const desired = arrayAnswer(answers, "q5-desired-returns");
  const goal = numberAnswer(answers, "q3-next-goal");
  const satisfaction = stringAnswer(answers, "q4-satisfaction-duration");
  const drive = stringAnswer(answers, "q6-current-drive");
  const freedom = numberAnswer(answers, "q7-freedom-change") * 10;
  const peace = numberAnswer(answers, "q8-peace-change") * 10;
  const attention = valueOf(answers, "q11-best-attention");
  const presence = valueOf(answers, "q12-mental-presence");
  const worry = stringAnswer(answers, "q14-ten-year-worry");
  const identity = numberAnswer(answers, "q15-identity-stability") * 10;
  const truth = stringAnswer(answers, "q17-uncomfortable-truth");
  const oneMoreGoal = valueOf(answers, "q10-one-more-goal");

  if (["work", "money"].includes(primary) && desired.some((item) => ["family-life", "love"].includes(item)) && (attention <= 50 || presence <= 50)) {
    return { id: "family-without-presence", contradiction: "Você pode estar construindo uma vida melhor para sua família enquanto oferece a ela menos da sua presença.", nextStep: "Presença", invitation: "Durante sete dias, escolha um momento diário com alguém importante e ofereça vinte minutos de atenção completa, sem tela e sem resolver outra coisa.", support: 4 };
  }
  if (primary === "money" && desired.some((item) => ["freedom", "independence", "time"].includes(item)) && freedom <= 50) {
    return { id: "freedom-through-money", contradiction: "Você pode estar buscando liberdade de uma forma que, neste momento, está deixando sua vida menos livre.", nextStep: "Liberdade suficiente", invitation: "Escolha uma obrigação criada pela busca de mais e reduza-a, adie-a ou recuse-a uma vez nesta semana.", support: 4 };
  }
  if (goal >= 7 && ["hours", "days"].includes(satisfaction) && (oneMoreGoal >= 75 || ["enough-achievement", "future-life"].includes(truth))) {
    return { id: "moving-finish-line", contradiction: "A linha de chegada pode continuar se movendo: cada conquista traz alívio, mas logo exige outra para que você se sinta em paz.", nextStep: "Suficiência", invitation: "Ao concluir algo nesta semana, não avance imediatamente para a próxima meta. Reserve dez minutos para reconhecer o que já é suficiente.", support: 5 };
  }
  if (primary === "body" && desired.some((item) => ["confidence", "recognition", "enough"].includes(item)) && (identity <= 50 || truth === "enough-achievement")) {
    return { id: "body-and-approval", contradiction: "Seu corpo pode estar mudando mais rápido do que sua capacidade de se sentir suficiente sem aprovação.", nextStep: "Valor sem aprovação", invitation: "Durante sete dias, faça uma escolha de cuidado com o corpo que não possa ser medida, exibida ou comparada.", support: 4 };
  }
  if (primary === "service" && (worry === "resentment" || peace <= 40)) {
    return { id: "service-and-resentment", contradiction: "Você pode estar fazendo coisas boas de um jeito que começa a produzir cansaço ou ressentimento em relação ao próprio bem que faz.", nextStep: "Limites", invitation: "Nesta semana, preserve um limite honesto antes de aceitar um novo pedido de ajuda e observe o que essa pausa revela.", support: 3 };
  }
  if (primary === "entertainment" && (drive === "escape" || scores.returnAlignment < 55)) {
    return { id: "entertainment-and-escape", contradiction: "O que deveria oferecer descanso pode estar funcionando mais como afastamento daquilo que precisa ser vivido.", nextStep: "Descanso que restaura", invitation: "Antes do entretenimento automático, fique cinco minutos sem tela e nomeie se você precisa de diversão, descanso ou acolhimento.", support: 3 };
  }
  if (primary === "travel" && (worry === "experiences-no-depth" || scores.returnAlignment < 50)) {
    return { id: "experiences-without-depth", contradiction: "Você pode estar acumulando experiências sem receber delas a presença e a profundidade que esperava.", nextStep: "Profundidade", invitation: "Escolha uma experiência desta semana e permaneça nela sem registrá-la ou transformá-la imediatamente em conteúdo.", support: 3 };
  }
  if (["work", "money", "study", "body"].includes(primary) && scores.transformation < 50 && truth === "achieve-not-love") {
    return { id: "external-over-inner-growth", contradiction: "Sua capacidade de conquistar pode estar crescendo mais rápido do que sua capacidade de mudar, amar e reparar.", nextStep: "Transformação interior", invitation: "Escolha uma percepção antiga sobre você e transforme-a em uma atitude observável que leve menos de quinze minutos.", support: 4 };
  }
  if (goal >= 7 && peace <= 50 && attention <= 50 && presence <= 50) {
    return { id: "busy-and-disconnected", contradiction: "Sua vida pode estar cheia sem que você consiga habitá-la com paz, atenção e presença.", nextStep: "Atenção", invitation: "Crie diariamente um intervalo de dez minutos sem meta, tela ou tarefa e permaneça inteiro onde estiver.", support: 5 };
  }
  if (scores.directionConcentration >= 70 && scores.returnAlignment < 55 && scores.hiddenCost >= 50) {
    return { id: "high-effort-low-return", contradiction: "Você pode estar avançando com muita força em uma direção que ainda não entrega o retorno pelo qual recebe tanto da sua vida.", nextStep: "Reavaliação", invitation: "Escolha uma busca que consome muito de você e escreva: “o que espero receber?” e “o que estou realmente recebendo?”.", support: 4 };
  }
  if (scores.directionConcentration <= 75 && scores.returnAlignment >= 70 && scores.hiddenCost <= 35 && scores.essentialAlignment >= 65 && scores.transformation >= 65) {
    return { id: "healthy-direction", contradiction: "Sua direção parece produzir mais do que resultados externos; ainda assim, o próximo crescimento pode estar em proteger aquilo que já faz sua vida ter profundidade.", nextStep: "Proteção do essencial", invitation: "Escolha uma relação, hábito ou valor que sustenta sua direção e reserve para ele um espaço inegociável nesta semana.", support: 5 };
  }

  const lowest = [
    [scores.returnAlignment, "Honestidade com o retorno", "Compare o que você esperava receber com o que essa busca realmente produz hoje."],
    [100 - scores.hiddenCost, "Reequilíbrio", "Devolva nesta semana uma hora concreta à área importante que tem recebido menos de você."],
    [scores.essentialAlignment, "Essencial", "Faça uma escolha importante que continuaria valendo mesmo sem elogio, visibilidade ou recompensa."],
    [scores.transformation, "Ação", "Dê um passo pequeno na mudança que você já percebeu, antes de esperar que ela fique mais fácil."],
  ].sort((a, b) => Number(a[0]) - Number(b[0]))[0];
  return { id: "mixed-direction", contradiction: "Suas respostas mostram forças e tensões ao mesmo tempo. Talvez a questão não seja abandonar sua direção, mas perceber o que ela oferece e o que cobra de você.", nextStep: String(lowest[1]), invitation: String(lowest[2]), support: 1 };
}

function actualReturnSummary(answers: Answers, scores: AssessmentScores, returns: string[]) {
  const freedom = numberAnswer(answers, "q7-freedom-change") * 10;
  const peace = numberAnswer(answers, "q8-peace-change") * 10;
  if (scores.returnAlignment >= 70) return `Há sinais de que seus esforços estão produzindo parte importante de ${listWords(returns)}, sem depender apenas da próxima conquista.`;
  if (freedom <= 40 && peace <= 40) return `Apesar do esforço, você relata hoje menos liberdade e menos paz do que alguns anos atrás. O retorno esperado ainda parece distante.`;
  if (freedom <= 40) return `Há movimento e esforço, mas eles ainda não parecem produzir a liberdade que poderiam prometer.`;
  if (peace <= 40) return `Há resultados possíveis, mas eles ainda parecem conviver com menos paz do que você esperava.`;
  return `Você parece receber parte do retorno esperado, mas não com consistência suficiente para encerrar a sensação de que ainda falta alguma coisa.`;
}

function hiddenCostSummary(answers: Answers, scores: AssessmentScores) {
  const costs = arrayAnswer(answers, "q13-hidden-costs").filter((item) => costLabels[item]).map((item) => costLabels[item]);
  if (costs.length) return `A forma como sua vida está organizada pode estar cobrando espaço de ${listWords(costs.slice(0, 3))}.`;
  if (arrayAnswer(answers, "q13-hidden-costs").includes("none") && scores.hiddenCost < 35) return "Você não apontou uma área importante sendo claramente sacrificada, embora ainda valha proteger o que sustenta seus vínculos e sua presença.";
  if (valueOf(answers, "q11-best-attention") <= 50 || valueOf(answers, "q12-mental-presence") <= 50) return "O custo pode estar aparecendo menos no que você faz e mais na qualidade da atenção que as pessoas importantes recebem.";
  return "O custo não aparece de forma única. Talvez ele esteja distribuído em pequenas ausências, adiamentos ou espaços que deixaram de existir.";
}

function confidenceFor(answers: Answers, pattern: Pattern) {
  const uncertainty = Object.values(answers).reduce<number>((total, answer) => {
    if (answer === "unsure") return total + 1;
    if (Array.isArray(answer) && answer.includes("unsure")) return total + 1;
    return total;
  }, 0);
  const q1 = stringAnswer(answers, "q1-direction-energy");
  const q2 = stringAnswer(answers, "q2-direction-mind");
  const delivered = valueOf(answers, "q9-return-delivered");
  const feltReturn = (numberAnswer(answers, "q7-freedom-change") * 10 + numberAnswer(answers, "q8-peace-change") * 10) / 2;
  const conflicting = Math.abs(delivered - feltReturn) >= 60 ? 1 : 0;
  return clamp(58 + pattern.support * 7 + (q1 === q2 ? 3 : 0) - uncertainty * 4 - conflicting * 6, 55, 95);
}

export function buildAssessmentResult(answers: Answers): AssessmentResult {
  const scores = calculateAssessmentScores(answers);
  const primaryKey = stringAnswer(answers, "q1-direction-energy") || "other";
  const secondaryKey = stringAnswer(answers, "q2-direction-mind");
  const primaryDirection = directionLabels[primaryKey] ?? directionLabels.other;
  const secondaryDirection = secondaryKey && secondaryKey !== primaryKey ? directionLabels[secondaryKey] : undefined;
  const desiredKeys = arrayAnswer(answers, "q5-desired-returns");
  const desiredReturns = desiredKeys.map((item) => returnLabels[item]).filter(Boolean);
  const namedReturns = desiredReturns.length ? desiredReturns : ["algo que considera importante"];
  const pattern = choosePattern(answers, scores);
  const confidence = confidenceFor(answers, pattern);

  return {
    primaryDirection,
    secondaryDirection,
    desiredReturns: namedReturns,
    currentDirectionSummary: `Suas respostas sugerem que sua vida está organizada principalmente em torno de ${primaryDirection}.${secondaryDirection ? ` ${secondaryDirection[0].toUpperCase()}${secondaryDirection.slice(1)} também ocupa uma parte importante da sua atenção.` : " Essa mesma direção também parece ocupar grande parte da sua mente."}`,
    seekingSummary: `Por trás desse esforço, você parece buscar principalmente ${listWords(namedReturns)}.`,
    actualReturnSummary: actualReturnSummary(answers, scores, namedReturns),
    hiddenCostSummary: hiddenCostSummary(answers, scores),
    contradiction: pattern.contradiction,
    nextStep: pattern.nextStep,
    sevenDayInvitation: pattern.invitation,
    confidence,
    confidenceExplanation: confidence >= 85
      ? "Esta leitura se apoia em sinais bastante consistentes entre suas prioridades, o retorno relatado e os possíveis custos."
      : confidence >= 70
        ? "Existe um padrão claro nas respostas, embora algumas partes da sua experiência possam apontar para direções diferentes."
        : "Suas respostas formam um quadro misto. Leia esta interpretação como uma hipótese útil para observar, não como uma conclusão sobre você.",
    patternId: pattern.id,
    scores,
  };
}
