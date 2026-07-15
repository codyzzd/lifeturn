export type QuestionType = "single" | "multi" | "range" | "text";

export type Option = {
  key: string;
  label: string;
  description?: string;
};

export type Question = {
  id: string;
  section: string;
  prompt: string;
  type: QuestionType;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  valueSuffix?: string;
  maxSelections?: number;
  optional?: boolean;
  helper?: string;
};

const directionOptions: Option[] = [
  ["work", "Trabalho ou carreira"],
  ["money", "Dinheiro ou crescimento financeiro"],
  ["family", "Família"],
  ["romantic", "Relacionamento amoroso"],
  ["body", "Corpo ou aparência"],
  ["health", "Saúde"],
  ["spirituality", "Religião ou espiritualidade"],
  ["service", "Ajudar ou servir outras pessoas"],
  ["study", "Estudo ou conhecimento"],
  ["travel", "Viagens e experiências"],
  ["entertainment", "Entretenimento"],
  ["social", "Vida social"],
  ["freedom", "Liberdade pessoal"],
  ["other", "Outra área"],
].map(([key, label]) => ({ key, label }));

const frequency: Option[] = [
  ["never", "Nunca"],
  ["rarely", "Raramente"],
  ["sometimes", "Às vezes"],
  ["often", "Frequentemente"],
  ["almost-always", "Quase sempre"],
].map(([key, label]) => ({ key, label }));

const agreement: Option[] = [
  ["strongly-disagree", "Discordo totalmente"],
  ["disagree", "Discordo"],
  ["unsure", "Não tenho certeza"],
  ["agree", "Concordo"],
  ["strongly-agree", "Concordo totalmente"],
].map(([key, label]) => ({ key, label }));

export const questions: Question[] = [
  {
    id: "q1-direction-energy",
    section: "O que está recebendo sua vida?",
    prompt: "Qual área recebe hoje a maior parte da sua energia?",
    type: "single",
    options: directionOptions,
  },
  {
    id: "q2-direction-mind",
    section: "O que está recebendo sua vida?",
    prompt: "Qual área mais ocupa sua mente, mesmo quando você não está cuidando dela?",
    type: "single",
    options: directionOptions,
  },
  {
    id: "q3-next-goal",
    section: "O que está recebendo sua vida?",
    prompt: "Quanto da sua vida atual parece organizada em torno de alcançar a próxima meta?",
    type: "range",
    min: 0,
    max: 10,
    step: 1,
    minLabel: "Quase nada",
    maxLabel: "Quase tudo",
  },
  {
    id: "q4-satisfaction-duration",
    section: "O que está recebendo sua vida?",
    prompt: "Quando você conquista algo importante, quanto tempo a satisfação costuma durar?",
    type: "single",
    options: [
      { key: "hours", label: "Minutos ou horas" },
      { key: "days", label: "Alguns dias" },
      { key: "weeks", label: "Algumas semanas" },
      { key: "months", label: "Alguns meses" },
      { key: "lasting", label: "Costuma produzir satisfação duradoura" },
      { key: "unsure", label: "Não tenho certeza" },
    ],
  },
  {
    id: "q5-desired-returns",
    section: "O que você espera receber?",
    prompt: "O que você mais espera que seus esforços atuais lhe deem no futuro?",
    type: "multi",
    maxSelections: 3,
    helper: "Escolha até três respostas.",
    options: [
      ["freedom", "Liberdade"], ["security", "Segurança"], ["peace", "Paz"], ["love", "Amor"],
      ["time", "Mais tempo"], ["recognition", "Reconhecimento"], ["respect", "Respeito"],
      ["confidence", "Confiança"], ["control", "Controle"], ["belonging", "Pertencimento"],
      ["purpose", "Propósito"], ["happiness", "Felicidade"], ["independence", "Independência"],
      ["family-life", "Uma vida melhor para minha família"], ["enough", "Sentir que sou suficiente"],
      ["other", "Outra coisa"],
    ].map(([key, label]) => ({ key, label })),
  },
  {
    id: "q6-current-drive",
    section: "O que você espera receber?",
    prompt: "Qual frase mais se aproxima da sua vida hoje?",
    type: "single",
    options: [
      ["meaning", "Estou construindo algo significativo."],
      ["security", "Estou tentando criar segurança."],
      ["prove", "Estou tentando provar alguma coisa."],
      ["behind", "Estou tentando não ficar para trás."],
      ["enough", "Estou tentando finalmente me sentir suficiente."],
      ["escape", "Estou tentando escapar de alguma coisa."],
      ["survive", "Na maior parte do tempo, estou tentando sobreviver."],
      ["unsure", "Não sei ao certo para onde estou indo."],
    ].map(([key, label]) => ({ key, label })),
  },
  {
    id: "q7-freedom-change",
    section: "Isso está funcionando?",
    prompt: "Comparado a alguns anos atrás, quanto mais livre você se sente hoje?",
    type: "range",
    min: 0,
    max: 10,
    step: 1,
    minLabel: "Muito menos livre",
    maxLabel: "Muito mais livre",
  },
  {
    id: "q8-peace-change",
    section: "Isso está funcionando?",
    prompt: "Comparado a alguns anos atrás, quanto mais em paz você se sente hoje?",
    type: "range",
    min: 0,
    max: 10,
    step: 1,
    minLabel: "Muito menos em paz",
    maxLabel: "Muito mais em paz",
  },
  {
    id: "q9-return-delivered",
    section: "Isso está funcionando?",
    prompt: "As coisas às quais dedico a maior parte da minha vida estão me dando o retorno emocional que eu esperava.",
    type: "single",
    options: agreement,
  },
  {
    id: "q10-one-more-goal",
    section: "Isso está funcionando?",
    prompt: "Sinto que preciso alcançar mais uma meta antes de poder relaxar ou aproveitar plenamente a vida.",
    type: "single",
    options: frequency,
  },
  {
    id: "q11-best-attention",
    section: "O que pode estar pagando o custo?",
    prompt: "As pessoas que digo serem mais importantes recebem uma parte significativa da minha melhor atenção, e não apenas o que sobra.",
    type: "single",
    options: frequency,
  },
  {
    id: "q12-mental-presence",
    section: "O que pode estar pagando o custo?",
    prompt: "Quando estou com pessoas que amo, costumo estar mentalmente presente com elas.",
    type: "single",
    options: frequency,
  },
  {
    id: "q13-hidden-costs",
    section: "O que pode estar pagando o custo?",
    prompt: "O que provavelmente recebe menos atenção por causa da forma como você vive hoje?",
    type: "multi",
    maxSelections: 3,
    helper: "Escolha até três respostas.",
    options: [
      ["family", "Família"], ["romantic", "Relacionamento amoroso"], ["friendships", "Amizades"],
      ["health", "Saúde"], ["rest", "Descanso"], ["peace", "Paz"], ["spirituality", "Vida espiritual"],
      ["growth", "Crescimento pessoal"], ["service", "Serviço ao próximo"], ["creativity", "Criatividade"],
      ["fun", "Diversão"], ["alone", "Tempo sozinho"], ["none", "Nada importante"], ["unsure", "Não tenho certeza"],
    ].map(([key, label]) => ({ key, label })),
  },
  {
    id: "q14-ten-year-worry",
    section: "O que pode estar pagando o custo?",
    prompt: "Se você continuasse vivendo exatamente assim pelos próximos dez anos, o que mais lhe preocuparia?",
    type: "single",
    options: [
      ["distance", "Ficar distante das pessoas que amo"], ["health", "Perder minha saúde"],
      ["time", "Desperdiçar tempo demais"], ["anxiety", "Ficar mais ansioso"],
      ["achievement", "Tornar-me dependente de conquistas"], ["numb", "Ficar emocionalmente anestesiado"],
      ["money-no-meaning", "Ter dinheiro, mas pouco significado"], ["experiences-no-depth", "Ter experiências, mas pouca profundidade"],
      ["resentment", "Tornar-me ressentido"], ["unrecognizable", "Tornar-me alguém que não reconheço"],
      ["none", "Nada em particular"], ["unsure", "Não tenho certeza"],
    ].map(([key, label]) => ({ key, label })),
  },
  {
    id: "q15-identity-stability",
    section: "O que é essencial?",
    prompt: "Se dinheiro, cargo, aparência, posses e reconhecimento desaparecessem, quanto da sua identidade permaneceria estável?",
    type: "range",
    min: 0,
    max: 10,
    step: 1,
    minLabel: "Muito pouco",
    maxLabel: "Quase tudo",
  },
  {
    id: "q16-unseen-investment",
    section: "O que é essencial?",
    prompt: "Quanto da sua semana é investido em coisas que ainda importariam profundamente se ninguém pudesse ver, elogiar ou recompensar você?",
    type: "range",
    min: 0,
    max: 100,
    step: 5,
    minLabel: "Quase nada",
    maxLabel: "Quase tudo",
    valueSuffix: "%",
  },
  {
    id: "q17-uncomfortable-truth",
    section: "O que é essencial?",
    prompt: "Qual frase incomoda mais porque talvez seja parcialmente verdadeira?",
    type: "single",
    helper: "Uma resposta não define você; ela apenas aponta algo que pode valer observar.",
    options: [
      ["work-family", "Trabalho por pessoas com quem quase não passo tempo."],
      ["freedom-trap", "Busco liberdade de um jeito que está me deixando menos livre."],
      ["enough-achievement", "Tento me sentir suficiente por meio de conquistas."],
      ["busy-avoidance", "Mantenho-me ocupado para não precisar encarar alguma coisa."],
      ["achieve-not-love", "Estou melhor em conquistar, mas não necessariamente em amar."],
      ["broad-neglect", "Dou energia a muitas pessoas e negligencio quem está mais perto."],
      ["future-life", "Espero uma versão futura da vida antes de me permitir viver."],
      ["none", "Nenhuma dessas frases parece verdadeira."],
    ].map(([key, label]) => ({ key, label })),
  },
  {
    id: "q18-postponed-change",
    section: "Transformação e resistência",
    prompt: "Existe algo que você deseja mudar há muito tempo, mas continua adiando?",
    type: "single",
    options: [
      ["yes", "Sim, claramente"], ["probably", "Provavelmente"], ["unsure", "Não tenho certeza"],
      ["probably-not", "Provavelmente não"], ["no", "Não"],
    ].map(([key, label]) => ({ key, label })),
  },
  {
    id: "q19-change-response",
    section: "Transformação e resistência",
    prompt: "Quando a vida me mostra repetidamente o mesmo problema, costumo mudar algo na forma como vivo.",
    type: "single",
    options: frequency,
  },
  {
    id: "q20-waiting-easier",
    section: "Transformação e resistência",
    prompt: "Existe algo que já sei que deveria fazer diferente, mas continuo esperando que fique mais fácil.",
    type: "single",
    options: agreement,
    helper: "Considere o que tem se repetido, não apenas um dia difícil.",
  },
  {
    id: "q21-open-change",
    section: "Para levar com você",
    prompt: "Sem pensar demais: o que você já suspeita que precisa mudar na sua vida?",
    type: "text",
    optional: true,
    helper: "Opcional · sua resposta permanece somente neste dispositivo.",
  },
];

export const scoredQuestionCount = 20;
