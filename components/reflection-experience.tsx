"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Share, Trash } from "./icons";
import { questions, scoredQuestionCount, type Question } from "@/lib/questions";
import { buildAssessmentResult, type Answer, type Answers, type AssessmentResult } from "@/lib/results";

type Stage = "landing" | "questions" | "processing" | "result";
type SavedState = { version: 2; stage: Stage; index: number; answers: Answers; completedAt?: string };

const STORAGE_KEY = "lifeturn-direction-v2";
const LEGACY_STORAGE_KEY = "lifeturn-reflection-v1";

function loadSavedState(): { saved: SavedState | null; legacyFound: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const legacyFound = Boolean(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (!raw) return { saved: null, legacyFound };
    const parsed = JSON.parse(raw) as SavedState;
    if (parsed.version !== 2 || !parsed.answers) return { saved: null, legacyFound };
    return {
      saved: { ...parsed, index: Math.min(Math.max(parsed.index ?? 0, 0), questions.length - 1) },
      legacyFound,
    };
  } catch {
    return { saved: null, legacyFound: false };
  }
}

export default function ReflectionExperience() {
  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<Stage>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [completedAt, setCompletedAt] = useState<string>();
  const [legacyFound, setLegacyFound] = useState(false);

  useEffect(() => {
    const { saved, legacyFound: hasLegacy } = loadSavedState();
    queueMicrotask(() => {
      setLegacyFound(hasLegacy && !saved);
      if (saved) {
        setStage(saved.stage === "questions" && Object.keys(saved.answers).length > 0 ? "landing" : saved.stage);
        setIndex(saved.index);
        setAnswers(saved.answers);
        setCompletedAt(saved.completedAt);
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: SavedState = { version: 2, stage, index, answers, completedAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [answers, completedAt, hydrated, index, stage]);

  useEffect(() => {
    if (stage !== "processing") return;
    const timer = window.setTimeout(() => {
      setStage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const restart = (startImmediately = false) => {
    if (Object.keys(answers).length > 0 && !window.confirm("Apagar as respostas salvas e começar do início? Esta ação não pode ser desfeita.")) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setLegacyFound(false);
    setAnswers({});
    setIndex(0);
    setCompletedAt(undefined);
    setStage(startImmediately ? "questions" : "landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) return <main className="min-h-screen" aria-label="Carregando reflexão" />;

  return (
    <div className="paper-noise min-h-screen">
      {stage === "landing" && (
        <Landing
          hasProgress={Object.keys(answers).length > 0}
          legacyFound={legacyFound}
          onStart={() => setStage("questions")}
          onEraseAndStart={() => restart(true)}
        />
      )}
      {stage === "questions" && (
        <QuestionFlow
          key={index}
          index={index}
          answers={answers}
          onAnswer={(id, answer) => setAnswers((current) => ({ ...current, [id]: answer }))}
          onBack={() => index === 0 ? setStage("landing") : setIndex((current) => current - 1)}
          onNext={() => {
            if (index === questions.length - 1) {
              setCompletedAt(new Date().toISOString());
              setStage("processing");
            } else {
              setIndex((current) => current + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onRestart={() => restart(true)}
        />
      )}
      {stage === "processing" && <Processing />}
      {stage === "result" && <Result answers={answers} onRestart={() => restart(true)} />}
    </div>
  );
}

function Landing({ hasProgress, legacyFound, onStart, onEraseAndStart }: { hasProgress: boolean; legacyFound: boolean; onStart: () => void; onEraseAndStart: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-8 pt-8 sm:px-10 sm:pt-12 lg:px-16 lg:pb-8 lg:pt-8">
      <p className="question-enter text-[12px] font-medium uppercase tracking-[.28em] text-[var(--muted)] sm:text-sm">Reflexão · 5 min</p>

      <div className="my-auto grid items-end gap-10 py-14 lg:grid-cols-[1fr_.76fr] lg:gap-16 lg:py-8">
        <section>
          <h1 className="font-editorial question-enter stagger-1 max-w-[900px] text-balance text-[clamp(4rem,8vw,8.5rem)] font-normal leading-[.82] tracking-[-.055em]">
            Para onde sua vida <em className="font-normal not-italic text-[var(--accent)]">vai?</em>
          </h1>
        </section>

        <section className="question-enter stagger-2 max-w-2xl lg:pb-2">
          <p className="text-pretty text-lg leading-relaxed text-[var(--muted)] sm:text-xl lg:text-[1.15rem]">
            Você passa a vida construindo, buscando, resolvendo, conquistando, amando e sobrevivendo. Mas existe uma pergunta que quase nunca fazemos:
          </p>
          <p className="mt-5 text-pretty text-[1.35rem] leading-snug tracking-[-.02em] sm:text-2xl">
            a direção em que estou indo está realmente me dando o que eu esperava?
          </p>
          <p className="mt-6 text-pretty text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Responda pensando na sua vida atual. Nas perguntas de frequência, considere principalmente as últimas quatro semanas.
          </p>

          {legacyFound && (
            <div className="mt-6 rounded-[22px] bg-[var(--paper-deep)] px-5 py-4 text-sm leading-relaxed text-[var(--muted)]">
              O teste foi reformulado e o resultado agora observa uma direção diferente. Por isso, as respostas da versão anterior precisam ser refeitas.
            </div>
          )}

          <div className="question-enter stagger-3 mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:mt-7">
            <button onClick={onStart} className="primary-button flex min-h-14 items-center justify-center gap-4 rounded-full bg-[var(--ink)] py-3.5 pl-6 pr-[22px] text-base font-medium text-white sm:min-h-16 sm:px-8 sm:pr-[30px] sm:text-lg">
              {hasProgress ? "Continuar de onde parei" : "Começar reflexão"}
              <ArrowRight className="size-5" />
            </button>
            {(hasProgress || legacyFound) && (
              <button onClick={onEraseAndStart} className="choice-button soft-card flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--accent)] sm:min-h-16 sm:text-base">
                <Trash className="size-4" /> Apagar e começar
              </button>
            )}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">Cerca de 5 minutos · sem respostas certas ou erradas · salvo somente neste dispositivo.</p>
        </section>
      </div>
    </main>
  );
}

function QuestionFlow({ index, answers, onAnswer, onBack, onNext, onRestart }: {
  index: number;
  answers: Answers;
  onAnswer: (id: string, answer: Answer) => void;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
}) {
  const question = questions[index];
  const answer = answers[question.id];
  const progress = (Math.min(index + 1, scoredQuestionCount) / scoredQuestionCount) * 100;
  const isOpen = question.type === "text";
  const answered = isOpen || (question.type === "multi" ? Array.isArray(answer) && answer.length > 0 : answer !== undefined);
  const manyOptions = (question.options?.length ?? 0) > 7;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-5 pb-10 pt-5 sm:px-10 sm:pb-6 lg:h-dvh lg:overflow-hidden lg:px-16 lg:pb-5">
      <header>
        <div className="flex items-center justify-between text-sm text-[var(--muted)] sm:text-base">
          <button onClick={onBack} className="flex min-h-11 items-center gap-2 rounded-full pr-3 transition-[color] duration-150 hover:text-[var(--ink)]">
            <ArrowLeft className="size-5" /> Voltar
          </button>
          <div className="flex items-center gap-2 sm:gap-5">
            <button onClick={onRestart} className="flex min-h-11 items-center gap-1.5 rounded-full px-1 text-xs transition-[color] duration-150 hover:text-[var(--accent)] sm:gap-2 sm:px-3 sm:text-sm"><Trash className="size-4" /><span className="sm:hidden">Apagar</span><span className="hidden sm:inline">Apagar e começar</span></button>
            <span className="tabular min-w-[4.5rem] text-right">{isOpen ? "Final" : `${index + 1} de ${scoredQuestionCount}`}</span>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--line)] sm:mt-5">
          <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1240px] flex-col justify-center py-9 sm:py-7 lg:grid lg:h-[calc(100dvh-6rem)] lg:min-h-0 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-12 lg:py-4 xl:gap-20">
        <div className="question-enter lg:self-center">
          <p className="mb-4 text-[12px] font-medium uppercase tracking-[.22em] text-[var(--accent)] sm:text-sm">{question.section}</p>
          <h1 className={`font-editorial max-w-[1120px] text-balance font-normal leading-[.96] tracking-[-.04em] ${manyOptions ? "text-[clamp(2.45rem,5.4vw,4rem)] lg:text-[clamp(2.7rem,3.7vw,3.8rem)]" : "text-[clamp(2.6rem,6.3vw,4.6rem)] lg:text-[clamp(3rem,4.2vw,4.5rem)]"}`}>{question.prompt}</h1>
          {question.helper && <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-base">{question.helper}</p>}
        </div>

        <div className="question-enter stagger-1 mt-8 lg:mt-0 lg:self-center">
          {question.type === "single" && <SingleAnswer question={question} answer={answer} onAnswer={onAnswer} compact={manyOptions} />}
          {question.type === "multi" && <MultiAnswer question={question} answer={answer} onAnswer={onAnswer} />}
          {question.type === "range" && <RangeAnswer question={question} answer={answer} onAnswer={onAnswer} />}
          {question.type === "text" && <TextAnswer question={question} answer={answer} onAnswer={onAnswer} />}
          <ContinueButton onClick={onNext} disabled={!answered}>{isOpen && !(typeof answer === "string" && answer.trim()) ? "Ver meu resultado" : index === questions.length - 1 ? "Ver meu resultado" : "Continuar"}</ContinueButton>
        </div>
      </div>
    </main>
  );
}

function SingleAnswer({ question, answer, onAnswer, compact }: { question: Question; answer: Answer | undefined; onAnswer: (id: string, answer: Answer) => void; compact: boolean }) {
  return (
    <div className={`grid gap-2.5 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1"}`}>
      {question.options?.map((option, optionIndex) => {
        const selected = answer === option.key;
        return (
          <button key={`${question.id}-${option.key}-${optionIndex}`} onClick={() => onAnswer(question.id, option.key)} aria-pressed={selected} className={`choice-button soft-card flex w-full items-center justify-between gap-4 rounded-[22px] px-5 text-left text-[15px] leading-snug sm:px-6 sm:text-base ${compact ? "min-h-[52px] py-2.5" : "min-h-[60px] py-3.5 lg:min-h-[58px]"} ${selected ? "bg-[var(--ink)] text-white" : "bg-[var(--surface)] text-[var(--ink)]"}`}>
            <span className="text-pretty">{option.label}</span>
            <SelectionMark selected={selected} />
          </button>
        );
      })}
    </div>
  );
}

function MultiAnswer({ question, answer, onAnswer }: { question: Question; answer: Answer | undefined; onAnswer: (id: string, answer: Answer) => void }) {
  const values = Array.isArray(answer) ? answer : [];
  const max = question.maxSelections ?? Infinity;
  const atLimit = values.length >= max;
  const toggle = (value: string) => {
    if (values.includes(value)) return onAnswer(question.id, values.filter((item) => item !== value));
    if (question.id === "q13-hidden-costs" && ["none", "unsure"].includes(value)) return onAnswer(question.id, [value]);
    const withoutExclusive = question.id === "q13-hidden-costs" ? values.filter((item) => !["none", "unsure"].includes(item)) : values;
    if (withoutExclusive.length >= max) return;
    onAnswer(question.id, [...withoutExclusive, value]);
  };
  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {question.options?.map((option) => {
          const selected = values.includes(option.key);
          const disabled = !selected && atLimit && !(question.id === "q13-hidden-costs" && ["none", "unsure"].includes(option.key));
          return (
            <button key={option.key} onClick={() => toggle(option.key)} disabled={disabled} aria-pressed={selected} className={`choice-button soft-card flex min-h-[50px] items-center justify-between gap-3 rounded-[21px] px-5 py-2.5 text-left text-[15px] leading-snug disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:text-base ${selected ? "bg-[var(--ink)] text-white" : "bg-[var(--surface)]"}`}>
              <span className="text-pretty">{option.label}</span><SelectionMark selected={selected} />
            </button>
          );
        })}
      </div>
      <p className={`mt-3 min-h-5 text-xs transition-[color] duration-150 ${atLimit ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>{atLimit ? `Você escolheu o limite de ${max}. Remova uma resposta para trocar.` : `${values.length} de ${max} selecionadas`}</p>
    </div>
  );
}

function SelectionMark({ selected }: { selected: boolean }) {
  return <span className={`grid size-7 shrink-0 place-items-center rounded-full transition-[opacity,scale,filter] duration-300 ${selected ? "scale-100 bg-white/12 opacity-100 blur-0" : "scale-[.25] opacity-0 blur-[4px]"}`}><Check className="size-4" /></span>;
}

function RangeAnswer({ question, answer, onAnswer }: { question: Question; answer: Answer | undefined; onAnswer: (id: string, answer: Answer) => void }) {
  const min = question.min ?? 0;
  const max = question.max ?? 100;
  const selected = typeof answer === "number";
  const value = selected ? answer : Math.round((min + max) / 2);
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div className="soft-card rounded-[30px] bg-[var(--surface)] p-6 sm:p-9 lg:p-10">
      <div className={`font-editorial tabular mb-7 text-center text-6xl font-normal sm:text-7xl ${selected ? "text-[var(--accent)]" : "text-[var(--muted)]/45"}`}>{selected ? `${value}${question.valueSuffix ?? ""}` : "—"}</div>
      <input aria-label={question.prompt} type="range" min={min} max={max} step={question.step ?? 1} value={value} onInput={(event) => onAnswer(question.id, Number(event.currentTarget.value))} onChange={(event) => onAnswer(question.id, Number(event.target.value))} style={{ "--range-progress": `${progress}%` } as React.CSSProperties} />
      <div className="mt-5 flex justify-between gap-6 text-xs text-[var(--muted)] sm:text-sm"><span>{question.minLabel}</span><span className="text-right">{question.maxLabel}</span></div>
      {!selected && <p className="mt-5 text-center text-xs text-[var(--muted)]">Mova o controle para registrar sua resposta.</p>}
    </div>
  );
}

function TextAnswer({ question, answer, onAnswer }: { question: Question; answer: Answer | undefined; onAnswer: (id: string, answer: Answer) => void }) {
  const value = typeof answer === "string" ? answer : "";
  return (
    <div>
      <textarea value={value} onChange={(event) => onAnswer(question.id, event.target.value)} rows={4} maxLength={300} placeholder="Escreva o que vier à mente…" className="soft-card min-h-40 w-full resize-none rounded-[28px] bg-[var(--surface)] p-5 text-base leading-relaxed outline-none transition-[box-shadow] duration-150 placeholder:text-[var(--muted)]/60 focus:shadow-[0_0_0_2px_var(--accent)] sm:min-h-48 sm:p-7 sm:text-lg" />
      <div className="mt-2 flex justify-between text-xs text-[var(--muted)]"><span>Você pode deixar em branco</span><span className="tabular">{value.length}/300</span></div>
    </div>
  );
}

function ContinueButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="primary-button mt-5 flex min-h-14 items-center gap-3 rounded-full bg-[var(--ink)] py-3 pl-6 pr-[22px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-16 sm:px-8 sm:pr-[30px] sm:text-lg">
      {children}<ArrowRight className="size-5" />
    </button>
  );
}

function Processing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1100px] flex-col items-center justify-center px-6 py-16 text-center" aria-live="polite">
      <div className="processing-mark" aria-hidden="true"><span /><span /><span /></div>
      <p className="question-enter mt-10 text-sm font-medium uppercase tracking-[.24em] text-[var(--accent)]">Olhando a direção por trás das respostas</p>
      <h1 className="font-editorial question-enter stagger-1 mt-5 max-w-4xl text-balance text-[clamp(3.2rem,7vw,6.8rem)] font-normal leading-[.88] tracking-[-.05em]">O que está recebendo mais da sua vida?</h1>
      <p className="question-enter stagger-2 mt-7 max-w-xl text-pretty text-base leading-relaxed text-[var(--muted)] sm:text-lg">Comparando o que você busca, o que recebe e o que pode estar ficando para trás.</p>
    </main>
  );
}

function Result({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const result = useMemo(() => buildAssessmentResult(answers), [answers]);
  const openAnswer = typeof answers["q21-open-change"] === "string" ? (answers["q21-open-change"] as string).trim() : "";
  const [shareState, setShareState] = useState("Compartilhar reflexão");

  const shareResult = async () => {
    setShareState("Criando imagem…");
    try {
      const blob = await createShareImage(result);
      const file = new File([blob], "para-onde-minha-vida-vai.png", { type: "image/png" });
      const shareData = { title: "Para onde minha vida vai?", text: `${result.contradiction} Próximo passo: ${result.nextStep}.`, files: [file] };
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData);
        setShareState("Imagem compartilhada");
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
        setShareState("Imagem salva");
      }
    } catch (error) {
      setShareState((error as DOMException).name === "AbortError" ? "Compartilhar reflexão" : "Tentar novamente");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-6 sm:px-10 sm:pt-9 lg:px-16 lg:pb-24">
      <header className="flex items-center justify-between">
        <p className="text-[12px] font-medium uppercase tracking-[.25em] text-[var(--muted)] sm:text-sm">Sua reflexão</p>
        <button onClick={onRestart} className="flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-[var(--muted)] transition-[color] duration-150 hover:text-[var(--accent)]"><Trash className="size-4" /> Apagar e começar</button>
      </header>

      <section className="question-enter mx-auto max-w-[1240px] pb-12 pt-14 sm:pt-20 lg:pb-16 lg:pt-24">
        <p className="text-sm font-medium uppercase tracking-[.22em] text-[var(--accent)]">Sua direção atual</p>
        <h1 className="font-editorial mt-4 max-w-5xl text-balance text-[clamp(3.5rem,8vw,8rem)] font-normal leading-[.82] tracking-[-.05em]">{result.primaryDirection}</h1>
        {result.secondaryDirection && <p className="mt-6 text-lg text-[var(--muted)] sm:text-xl">Direção secundária: <strong className="font-medium text-[var(--ink)]">{result.secondaryDirection}</strong></p>}
        <p className="mt-8 max-w-4xl text-pretty text-lg leading-relaxed text-[var(--muted)] sm:text-2xl">{result.currentDirectionSummary}</p>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-5 border-t border-[var(--line)] py-12 sm:py-16 lg:grid-cols-2">
        <ReflectionCard eyebrow="O que você parece buscar" title={listForDisplay(result.desiredReturns)} text={result.seekingSummary} />
        <ReflectionCard eyebrow="O que parece estar recebendo" title="O retorno percebido" text={result.actualReturnSummary} />
        <ReflectionCard eyebrow="O possível custo oculto" title="O que pode estar ficando para trás" text={result.hiddenCostSummary} className="lg:col-span-2" />
      </section>

      <section className="mx-auto max-w-[1240px] rounded-[34px] bg-[var(--ink)] px-6 py-10 text-white sm:rounded-[48px] sm:px-12 sm:py-14 lg:px-16 lg:py-16">
        <p className="text-sm uppercase tracking-[.22em] text-[var(--accent-soft)]">A principal contradição</p>
        <h2 className="font-editorial mt-5 max-w-5xl text-balance text-[clamp(2.7rem,5.2vw,5.4rem)] font-normal leading-[.92] tracking-[-.04em]">{result.contradiction}</h2>
        <p className="mt-7 max-w-3xl text-pretty text-sm leading-relaxed text-white/58 sm:text-base">Esta é uma hipótese construída pela combinação das suas respostas, não uma definição sobre você.</p>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-6 py-12 sm:py-16 lg:grid-cols-[.72fr_1.28fr] lg:items-stretch">
        <article className="soft-card rounded-[30px] bg-[var(--paper-deep)] p-7 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[.2em] text-[var(--accent)]">Seu próximo passo</p>
          <h2 className="font-editorial mt-4 text-balance text-[clamp(3rem,5vw,5rem)] font-normal leading-[.88] tracking-[-.04em]">{result.nextStep}</h2>
        </article>
        <article className="soft-card rounded-[30px] bg-[var(--surface)] p-7 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[.2em] text-[var(--accent)]">Um convite para os próximos sete dias</p>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-[var(--ink)] sm:text-2xl">{result.sevenDayInvitation}</p>
        </article>
      </section>

      {openAnswer && (
        <section className="mx-auto max-w-[1240px] border-t border-[var(--line)] py-12 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-medium uppercase tracking-[.22em] text-[var(--accent)]">Suas próprias palavras</p><h2 className="font-editorial mt-3 text-balance text-[clamp(2.7rem,5vw,4.75rem)] font-normal leading-[.9] tracking-[-.04em]">O que você já percebeu</h2></div>
            <p className="rounded-full bg-[var(--paper-deep)] px-4 py-2 text-xs font-medium text-[var(--muted)] sm:text-sm">Privado · somente neste dispositivo</p>
          </div>
          <article className="soft-card mt-8 rounded-[28px] bg-[var(--surface)] p-6 sm:p-9"><p className="whitespace-pre-wrap break-words text-pretty text-lg leading-relaxed sm:text-xl">{openAnswer}</p></article>
        </section>
      )}

      <section className="mx-auto grid max-w-[1240px] gap-8 border-t border-[var(--line)] py-12 sm:py-16 lg:grid-cols-[1fr_.72fr] lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[.22em] text-[var(--accent)]">Confiança nesta interpretação</p>
          <div className="mt-4 flex items-end gap-4"><strong className="font-editorial tabular text-7xl font-normal leading-none text-[var(--ink)] sm:text-8xl">{result.confidence}%</strong><span className="mb-2 text-sm text-[var(--muted)]">nunca tratamos a leitura como certeza</span></div>
          <div className="mt-6 h-2 max-w-2xl overflow-hidden rounded-full bg-[var(--line)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${result.confidence}%` }} /></div>
        </div>
        <p className="text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-base">{result.confidenceExplanation}</p>
      </section>

      <section className="mx-auto max-w-[1240px] overflow-hidden rounded-[34px] bg-[var(--ink)] px-6 py-10 text-white sm:rounded-[48px] sm:px-12 sm:py-14 lg:px-16 lg:py-16">
        <p className="text-sm uppercase tracking-[.22em] text-[var(--accent-soft)]">Uma pergunta para continuar</p>
        <h2 className="font-editorial mt-5 max-w-5xl text-balance text-[clamp(2.35rem,4.4vw,4.75rem)] font-normal leading-[.95] tracking-[-.035em]">Se suas conquistas ficassem aqui, o que permaneceria em quem você se tornou?</h2>
        <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row">
          <button onClick={shareResult} className="primary-button flex min-h-14 items-center gap-3 rounded-full bg-[var(--surface)] py-3 pl-6 pr-[22px] font-medium text-[var(--ink)] hover:bg-white sm:min-h-16 sm:px-8 sm:pr-[30px]"><Share className="size-5" /> {shareState}</button>
          <button onClick={onRestart} className="flex min-h-14 items-center gap-3 rounded-full px-5 text-white/75 transition-[color,scale] duration-150 hover:text-white active:scale-[.96]"><Trash className="size-5" /> Apagar e começar</button>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/50">A imagem inclui somente sua direção, a contradição resumida e o próximo passo. Nenhuma resposta privada é incluída.</p>
      </section>
    </main>
  );
}

function ReflectionCard({ eyebrow, title, text, className = "" }: { eyebrow: string; title: string; text: string; className?: string }) {
  return <article className={`soft-card rounded-[28px] bg-[var(--surface)] p-6 sm:p-9 ${className}`}><p className="text-xs font-medium uppercase tracking-[.18em] text-[var(--accent)]">{eyebrow}</p><h2 className="font-editorial mt-3 text-balance text-3xl font-normal leading-none tracking-[-.025em] sm:text-4xl">{title}</h2><p className="mt-5 max-w-4xl text-pretty text-base leading-relaxed text-[var(--muted)] sm:text-lg">{text}</p></article>;
}

function listForDisplay(items: string[]) {
  return items.map((item) => item[0].toUpperCase() + item.slice(1)).join(" · ");
}

async function createShareImage(result: AssessmentResult): Promise<Blob> {
  await document.fonts.ready;
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas indisponível"));

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, "#fbf5ec");
    gradient.addColorStop(1, "#efe3d4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = "#d97850";
    ctx.fillRect(90, 110, 92, 8);
    ctx.fillStyle = "#746b62";
    ctx.font = "500 26px Inter, Arial, sans-serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("MINHA DIREÇÃO ATUAL", 90, 180);

    ctx.fillStyle = "#261b15";
    ctx.font = "400 116px Belleza, Georgia, serif";
    wrapCanvasText(ctx, result.primaryDirection, 90, 390, 900, 116);

    ctx.fillStyle = "#d97850";
    ctx.font = "500 25px Inter, Arial, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("A CONTRADIÇÃO QUE POSSO OBSERVAR", 90, 780);
    ctx.fillStyle = "#261b15";
    ctx.font = "400 68px Belleza, Georgia, serif";
    ctx.letterSpacing = "0px";
    wrapCanvasText(ctx, result.contradiction, 90, 900, 900, 74);

    ctx.strokeStyle = "#d8cbbb";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(90, 1450); ctx.lineTo(990, 1450); ctx.stroke();

    ctx.fillStyle = "#746b62";
    ctx.font = "500 25px Inter, Arial, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("MEU PRÓXIMO PASSO", 90, 1535);
    ctx.fillStyle = "#d97850";
    ctx.font = "400 84px Belleza, Georgia, serif";
    ctx.letterSpacing = "0px";
    wrapCanvasText(ctx, result.nextStep, 90, 1655, 900, 88);

    ctx.fillStyle = "#746b62";
    ctx.font = "400 27px Inter, Arial, sans-serif";
    ctx.fillText(window.location.host || "lifeturn.vercel.app", 90, 1830);
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Não foi possível gerar a imagem")), "image/png", .96);
  });
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, currentY);
}
