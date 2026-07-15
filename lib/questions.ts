export type Dimension =
  | "freedom"
  | "awareness"
  | "love"
  | "growth"
  | "balance"
  | "presence"
  | "responsibility"
  | "purpose";

export type Option = { label: string; value: number; key?: string };

export type Question = {
  id: string;
  dimension: Dimension;
  eyebrow: string;
  prompt: string;
  type: "single" | "multi" | "range" | "text";
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  optional?: boolean;
  scored?: boolean;
  helper?: string;
};

const frequency: Option[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 25 },
  { label: "Às vezes", value: 50 },
  { label: "Frequentemente", value: 75 },
  { label: "Quase sempre", value: 100 },
];

const agreement: Option[] = [
  { label: "Nada", value: 0 },
  { label: "Pouco", value: 25 },
  { label: "Moderadamente", value: 50 },
  { label: "Bastante", value: 75 },
  { label: "Muito", value: 100 },
];

export const questions: Question[] = [
  { id: "freedom-time", dimension: "freedom", eyebrow: "Liberdade interior", prompt: "Com que frequência você sente que consegue escolher conscientemente como usa seu tempo?", type: "single", options: frequency },
  { id: "freedom-habits", dimension: "freedom", eyebrow: "Liberdade interior", prompt: "Existem hábitos que você continua repetindo mesmo sabendo que gostaria de parar?", type: "single", options: [...agreement].reverse().map((item, index) => ({ ...item, value: index * 25 })) },
  { id: "freedom-no", dimension: "freedom", eyebrow: "Liberdade interior", prompt: "Quando algo não combina com o que você quer para sua vida, você consegue dizer “não”?", type: "single", options: frequency },

  { id: "awareness-person", dimension: "awareness", eyebrow: "Consciência", prompt: "Com que frequência você para para pensar no tipo de pessoa que está se tornando?", type: "single", options: frequency },
  { id: "awareness-patterns", dimension: "awareness", eyebrow: "Consciência", prompt: "Você consegue perceber padrões que continuam se repetindo na sua vida?", type: "single", options: agreement },
  { id: "awareness-learn", dimension: "awareness", eyebrow: "Consciência", prompt: "Quando alguma coisa dá errado, você tenta entender o que pode aprender com aquilo?", type: "single", options: frequency },

  { id: "love-differences", dimension: "love", eyebrow: "Capacidade de amar", prompt: "Você sente que está aprendendo a compreender melhor pessoas diferentes de você?", type: "single", options: agreement },
  { id: "love-depth", dimension: "love", eyebrow: "Capacidade de amar", prompt: "Seus relacionamentos mais próximos estão se tornando mais profundos ou mais distantes?", type: "single", options: [
    { label: "Muito mais distantes", value: 0 }, { label: "Um pouco mais distantes", value: 25 }, { label: "Permanecem parecidos", value: 50 }, { label: "Um pouco mais profundos", value: 75 }, { label: "Muito mais profundos", value: 100 },
  ] },
  { id: "love-hurt", dimension: "love", eyebrow: "Capacidade de amar", prompt: "Quando alguém machuca você, com o tempo consegue processar aquilo sem permanecer preso ao ressentimento?", type: "single", options: frequency },

  { id: "growth-maturity", dimension: "growth", eyebrow: "Crescimento", prompt: "Você sente que é uma pessoa diferente e mais madura do que era há alguns anos?", type: "single", options: agreement },
  { id: "growth-change", dimension: "growth", eyebrow: "Crescimento", prompt: "Quando percebe um problema em si mesmo, costuma transformar essa percepção em alguma mudança?", type: "single", options: frequency },
  { id: "growth-experiences", dimension: "growth", eyebrow: "Crescimento", prompt: "Quais experiências difíceis realmente mudaram sua forma de viver?", type: "multi", scored: false, helper: "Selecione quantas fizerem sentido.", options: [
    "Relacionamentos", "Família", "Trabalho", "Perdas", "Dinheiro", "Saúde", "Espiritualidade", "Erros pessoais", "Ainda não sei",
  ].map((label) => ({ label, value: 50, key: label })) },

  { id: "balance-area", dimension: "balance", eyebrow: "Equilíbrio", prompt: "Alguma área ocupa tanto espaço que outras partes importantes da sua vida estão sendo negligenciadas?", type: "single", scored: false, options: [
    "Trabalho", "Dinheiro", "Corpo e aparência", "Relacionamentos", "Religião", "Jogos ou entretenimento", "Redes sociais", "Estudos", "Nenhuma",
  ].map((label) => ({ label, value: 50, key: label })) },
  { id: "balance-dominance", dimension: "balance", eyebrow: "Equilíbrio", prompt: "Quanto essa área domina seus pensamentos hoje?", type: "range", min: 0, max: 10, step: 1, minLabel: "Quase nada", maxLabel: "O tempo todo", helper: "Uma área importante também pode ocupar espaço demais.", scored: true },
  { id: "balance-rest", dimension: "balance", eyebrow: "Equilíbrio", prompt: "Você consegue descansar sem sentir que deveria estar produzindo, resolvendo ou cuidando de algo?", type: "single", options: frequency },

  { id: "presence-distraction", dimension: "presence", eyebrow: "Presença", prompt: "Quando está triste, ansioso ou frustrado, com que frequência procura distração só para não pensar no que sente?", type: "single", options: [...frequency].reverse().map((item, index) => ({ ...item, value: index * 25 })) },
  { id: "presence-escape", dimension: "presence", eyebrow: "Presença", prompt: "Qual destas coisas você mais usa para escapar de problemas?", type: "single", scored: false, helper: "A resposta ajuda a observar um padrão; não é um diagnóstico.", options: [
    "Jogos", "Filmes e séries", "Redes sociais", "Comida", "Sexo ou pornografia", "Compras", "Trabalho", "Álcool ou outras substâncias", "Religião", "Sono", "Não sinto que faço isso",
  ].map((label) => ({ label, value: 50, key: label })) },
  { id: "presence-feelings", dimension: "presence", eyebrow: "Presença", prompt: "Você consegue permanecer com uma emoção difícil tempo suficiente para entender o que ela tenta mostrar?", type: "single", options: frequency },

  { id: "responsibility-conflict", dimension: "responsibility", eyebrow: "Responsabilidade", prompt: "Quando um conflito se repete, como você costuma enxergar sua participação?", type: "single", options: [
    { label: "O problema está quase sempre nos outros", value: 10 }, { label: "Geralmente está mais nos outros", value: 30 }, { label: "Tento olhar para os dois lados", value: 100 }, { label: "Assumo que está mais em mim", value: 65 }, { label: "Depende da situação", value: 75 },
  ] },
  { id: "responsibility-wrong", dimension: "responsibility", eyebrow: "Responsabilidade", prompt: "Quando percebe que estava errado, qual é sua reação mais comum?", type: "single", options: [
    { label: "Defendo minha posição", value: 10 }, { label: "Evito pensar nisso", value: 20 }, { label: "Sinto culpa, mas não mudo", value: 35 }, { label: "Tento reparar e mudar", value: 100 }, { label: "Depende da situação", value: 65 },
  ] },

  { id: "purpose-future", dimension: "purpose", eyebrow: "Propósito", prompt: "Se continuar vivendo exatamente como vive hoje pelos próximos 10 anos, você gostaria da pessoa que provavelmente se tornaria?", type: "single", options: [
    { label: "Definitivamente não", value: 0 }, { label: "Provavelmente não", value: 25 }, { label: "Não sei", value: 50 }, { label: "Provavelmente sim", value: 75 }, { label: "Definitivamente sim", value: 100 },
  ] },
  { id: "purpose-alignment", dimension: "purpose", eyebrow: "Propósito", prompt: "Quanto da sua vida atual parece alinhada ao que você considera realmente importante?", type: "range", min: 0, max: 100, step: 5, minLabel: "0%", maxLabel: "100%", scored: true },

  { id: "open-pattern", dimension: "awareness", eyebrow: "Para levar com você", prompt: "Qual problema parece continuar se repetindo na sua vida?", type: "text", optional: true, scored: false, helper: "Opcional. Sua resposta fica somente neste dispositivo." },
  { id: "open-experience", dimension: "growth", eyebrow: "Para levar com você", prompt: "Qual experiência mais mudou você até hoje?", type: "text", optional: true, scored: false, helper: "Opcional. Escreva do seu jeito." },
  { id: "open-change", dimension: "purpose", eyebrow: "Para levar com você", prompt: "O que você sente que precisa mudar, mas continua adiando?", type: "text", optional: true, scored: false, helper: "Opcional. Talvez nomear já seja um começo." },
];

export const dimensionLabels: Record<Dimension, string> = {
  freedom: "Liberdade interior",
  awareness: "Consciência",
  love: "Amor",
  growth: "Crescimento",
  balance: "Equilíbrio",
  presence: "Presença",
  responsibility: "Responsabilidade",
  purpose: "Propósito",
};
