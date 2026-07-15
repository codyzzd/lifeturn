import { dimensionLabels, questions, type Dimension } from "./questions";

export type Answer = number | string | string[];
export type DimensionScores = Record<Dimension, number>;

export const bands = [
  { min: 80, title: "Caminho de crescimento", description: "Sua vida atual parece estar produzindo transformação positiva. Isso não significa ausência de problemas, mas sugere que você está conseguindo aprender, ajustar e crescer com aquilo que vive." },
  { min: 65, title: "Boa direção, alguns pontos de atenção", description: "Você parece caminhar em uma direção saudável, embora existam áreas específicas que podem estar limitando seu crescimento." },
  { min: 45, title: "Momento de reavaliação", description: "Sua vida mostra sinais de crescimento, mas também padrões que podem estar mantendo você parado ou deixando áreas importantes em segundo plano." },
  { min: 25, title: "Desvio de direção", description: "Alguns hábitos, prioridades ou padrões parecem ocupar espaço demais e diminuir sua liberdade, seus relacionamentos ou sua capacidade de mudança." },
  { min: 0, title: "Vida no automático", description: "Suas respostas sugerem que parte importante da sua vida pode estar sendo conduzida por hábitos, fugas ou padrões repetitivos. Perceber isso já pode ser o início de uma mudança." },
];

const dimensions = Object.keys(dimensionLabels) as Dimension[];

export function calculateScores(answers: Record<string, Answer>): { dimensions: DimensionScores; overall: number } {
  const grouped = Object.fromEntries(dimensions.map((dimension) => [dimension, [] as number[]])) as Record<Dimension, number[]>;

  questions.forEach((question) => {
    if (question.scored === false || question.type === "text" || question.type === "multi") return;
    const answer = answers[question.id];
    if (typeof answer !== "number") return;

    let value = answer;
    if (question.id === "balance-dominance") value = 100 - answer * 10;
    grouped[question.dimension].push(value);
  });

  const scores = Object.fromEntries(dimensions.map((dimension) => {
    const values = grouped[dimension];
    const score = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 50;
    return [dimension, score];
  })) as DimensionScores;

  const overall = Math.round(dimensions.reduce((sum, dimension) => sum + scores[dimension], 0) / dimensions.length);
  return { dimensions: scores, overall };
}

export function getBand(score: number) {
  return bands.find((band) => score >= band.min) ?? bands[bands.length - 1];
}

export function getHighlights(scores: DimensionScores) {
  const sorted = dimensions.map((key) => ({ key, label: dimensionLabels[key], score: scores[key] })).sort((a, b) => b.score - a.score);
  return { strongest: sorted.slice(0, 3), attention: [...sorted].reverse().slice(0, 2) };
}

export function getPattern(scores: DimensionScores) {
  if (scores.awareness >= 68 && scores.growth < 55) return "Suas respostas sugerem clareza sobre o que precisa mudar, mas talvez exista uma distância entre perceber e transformar essa percepção em ação.";
  if (scores.responsibility >= 70 && scores.balance < 55) return "Você demonstra disposição para assumir responsabilidade, mas talvez esteja carregando obrigações demais e deixando pouco espaço para descanso e relações.";
  if (scores.purpose >= 65 && scores.presence < 55) return "Sua direção parece relativamente clara, mas algumas distrações podem estar dificultando viver essa direção com presença no cotidiano.";
  if (scores.love >= 70 && scores.freedom < 55) return "Seus vínculos parecem importantes para você. Talvez valha observar se cuidar das relações também está deixando espaço para suas próprias escolhas e limites.";
  if (scores.growth >= 70 && scores.balance < 55) return "Você parece valorizar a mudança, mas existe a possibilidade de estar buscando crescimento em um ritmo que cobra mais equilíbrio do que oferece.";
  return "Suas respostas mostram forças e tensões convivendo ao mesmo tempo. Talvez valha observar a área mais frágil sem perder de vista aquilo que já está ajudando você a crescer.";
}

const guidance: Record<Dimension, { keep: string; observe: string; try: string }> = {
  freedom: { keep: "Proteja as escolhas conscientes que já fazem parte da sua rotina.", observe: "Perceba quais hábitos parecem decidir por você antes que você escolha.", try: "Escolha um pequeno “não” que devolva tempo ou energia nesta semana." },
  awareness: { keep: "Continue criando pausas para enxergar o que a rotina costuma esconder.", observe: "Note um padrão repetido sem tentar explicá-lo ou julgá-lo de imediato.", try: "Anote, por 7 dias, uma situação que se repetiu e como você respondeu." },
  love: { keep: "Continue investindo nos vínculos em que você consegue estar inteiro.", observe: "Repare onde mágoa, pressa ou defesa estão criando distância.", try: "Tenha uma conversa curta com alguém que importa, começando por escutar." },
  growth: { keep: "Reconheça as mudanças reais que você já conseguiu sustentar.", observe: "Veja onde entender o problema ainda não se tornou uma atitude diferente.", try: "Transforme uma intenção antiga em uma ação que leve menos de 15 minutos." },
  balance: { keep: "Preserve os espaços que devolvem ritmo e perspectiva à sua vida.", observe: "Perceba qual área continua crescendo às custas das demais.", try: "Reserve uma hora nesta semana para uma área importante que ficou esquecida." },
  presence: { keep: "Valorize as formas de descanso que realmente devolvem você a si mesmo.", observe: "Note quando distração deixa de ser lazer e passa a evitar alguma coisa.", try: "Antes da distração automática, fique dois minutos nomeando o que sente." },
  responsibility: { keep: "Continue olhando para sua participação sem transformar isso em culpa.", observe: "Repare se defender sua intenção impede você de enxergar o impacto causado.", try: "Em um conflito, pergunte: “o que eu poderia fazer diferente da próxima vez?”" },
  purpose: { keep: "Mantenha perto as escolhas que combinam com o que importa para você.", observe: "Perceba onde seus dias e seus valores estão contando histórias diferentes.", try: "Escolha uma ação de 10 minutos que aproxime sua semana do que é importante." },
};

const growthMeaning: Record<Dimension, string> = {
  freedom: "Escolher melhor como usa seu tempo, estabelecer limites e depender menos de hábitos que decidem por você.",
  awareness: "Reconhecer padrões, refletir sobre quem está se tornando e aprender com aquilo que não saiu bem.",
  love: "Dar presença e cuidado aos vínculos próximos, compreender diferenças e não permanecer preso ao ressentimento.",
  growth: "Transformar percepções e experiências difíceis em mudanças reais, não apenas em boas intenções.",
  balance: "Impedir que trabalho, entretenimento ou outra área ocupe o espaço de relações, descanso e responsabilidades importantes.",
  presence: "Enfrentar emoções com mais honestidade e usar menos distrações para fugir do que precisa ser compreendido.",
  responsibility: "Enxergar sua participação nos conflitos, reparar impactos e mudar a própria atitude quando necessário.",
  purpose: "Aproximar o uso dos seus dias daquilo que considera importante e da pessoa que deseja construir no longo prazo.",
};

export function getGrowthAreas(scores: DimensionScores) {
  return dimensions
    .map((key) => ({
      key,
      label: dimensionLabels[key],
      score: scores[key],
      gap: 100 - scores[key],
      meaning: growthMeaning[key],
      action: guidance[key].try,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

export function getRecommendations(scores: DimensionScores) {
  const { strongest, attention } = getHighlights(scores);
  return {
    keep: guidance[strongest[0].key].keep,
    observe: guidance[attention[0].key].observe,
    try: guidance[attention[1]?.key ?? attention[0].key].try,
  };
}
