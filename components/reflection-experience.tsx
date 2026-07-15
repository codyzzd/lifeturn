"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Share, Trash } from "./icons";
import { dimensionLabels, questions, type Dimension, type Question } from "@/lib/questions";
import { calculateScores, getBand, getGrowthAreas, getHighlights, getPattern, type Answer, type DimensionScores } from "@/lib/results";

type Stage = "landing" | "questions" | "result";
type SavedState = { version: 1; stage: Stage; index: number; answers: Record<string, Answer>; completedAt?: string };

const STORAGE_KEY = "lifeturn-reflection-v1";
const dimensions = Object.keys(dimensionLabels) as Dimension[];

function loadSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (parsed.version !== 1 || !parsed.answers) return null;
    return { ...parsed, index: Math.min(Math.max(parsed.index ?? 0, 0), questions.length - 1) };
  } catch {
    return null;
  }
}

export default function ReflectionExperience() {
  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<Stage>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [completedAt, setCompletedAt] = useState<string>();

  useEffect(() => {
    const saved = loadSavedState();
    queueMicrotask(() => {
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
    const state: SavedState = { version: 1, stage, index, answers, completedAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [answers, completedAt, hydrated, index, stage]);

  const restart = (startImmediately = false) => {
    if (Object.keys(answers).length > 0 && !window.confirm("Apagar as respostas salvas e começar do início? Esta ação não pode ser desfeita.")) return;
    localStorage.removeItem(STORAGE_KEY);
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
          onBack={() => {
            if (index === 0) setStage("landing");
            else setIndex((current) => current - 1);
          }}
          onNext={() => {
            if (index === questions.length - 1) {
              setCompletedAt(new Date().toISOString());
              setStage("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              setIndex((current) => current + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onRestart={() => restart(true)}
        />
      )}
      {stage === "result" && <Result answers={answers} completedAt={completedAt} onRestart={() => restart(true)} />}
    </div>
  );
}

function Landing({ hasProgress, onStart, onEraseAndStart }: { hasProgress: boolean; onStart: () => void; onEraseAndStart: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-8 pt-8 sm:px-10 sm:pt-12 lg:px-16 lg:pb-8 lg:pt-8">
      <p className="question-enter text-[12px] font-medium uppercase tracking-[.28em] text-[var(--muted)] sm:text-sm">Reflexão · 5 min</p>

      <div className="my-auto grid items-end gap-10 py-14 lg:grid-cols-[1fr_.76fr] lg:gap-16 lg:py-8">
        <section>
          <h1 className="font-editorial question-enter stagger-1 max-w-[980px] text-balance text-[clamp(3.65rem,8vw,8rem)] font-normal leading-[.82] tracking-[-.055em]">
            No que sua vida está transformando <em className="font-normal not-italic text-[var(--accent)]">você?</em>
          </h1>
        </section>

        <section className="question-enter stagger-2 max-w-2xl lg:pb-2">
          <p className="text-pretty text-lg leading-relaxed text-[var(--muted)] sm:text-xl lg:text-[1.15rem]">
            Você vive, trabalha, ama, sofre, descansa, erra, conquista e recomeça. Mas existe uma pergunta que quase nunca fazemos:
          </p>
          <p className="mt-5 text-pretty text-[1.35rem] leading-snug tracking-[-.02em] sm:text-2xl">
            quem estou me tornando por causa da vida que estou vivendo?
          </p>
          <p className="mt-6 text-pretty text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Esta reflexão observa hábitos, prioridades, relações, desejos e padrões — sem respostas certas, diagnósticos ou julgamentos.
          </p>

          <div className="question-enter stagger-3 mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:mt-6">
            <button onClick={onStart} className="primary-button flex min-h-14 items-center justify-center gap-4 rounded-full bg-[var(--ink)] py-3.5 pl-6 pr-[22px] text-base font-medium text-white sm:min-h-16 sm:px-8 sm:pr-[30px] sm:text-lg">
              {hasProgress ? "Continuar de onde parei" : "Começar reflexão"}
              <ArrowRight className="size-5" />
            </button>
            {hasProgress && (
              <button onClick={onEraseAndStart} className="choice-button soft-card flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--accent)] sm:min-h-16 sm:text-base">
                <Trash className="size-4" /> Apagar e começar
              </button>
            )}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] sm:text-base">Seu progresso fica salvo neste dispositivo.</p>
        </section>
      </div>
    </main>
  );
}

function QuestionFlow({ index, answers, onAnswer, onBack, onNext, onRestart }: {
  index: number;
  answers: Record<string, Answer>;
  onAnswer: (id: string, answer: Answer) => void;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
}) {
  const question = questions[index];
  const answer = answers[question.id];
  const progress = ((index + 1) / questions.length) * 100;
  const advancing = useRef(false);
  const optionCount = question.options?.length ?? 0;
  const hasManyOptions = optionCount > 7;

  const chooseAndAdvance = (value: number) => {
    if (advancing.current) return;
    onAnswer(question.id, value);
    advancing.current = true;
    window.setTimeout(onNext, 220);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-5 pb-10 pt-5 sm:h-dvh sm:min-h-0 sm:overflow-hidden sm:px-10 sm:pb-5 sm:pt-5 lg:px-16">
      <header>
        <div className="flex items-center justify-between text-sm text-[var(--muted)] sm:text-base">
          <button onClick={onBack} className="flex min-h-11 items-center gap-2 rounded-full pr-3 transition-[color] duration-150 hover:text-[var(--ink)]">
            <ArrowLeft className="size-5" /> Voltar
          </button>
          <div className="flex items-center gap-2 sm:gap-5">
            <button onClick={onRestart} className="flex min-h-11 items-center gap-1.5 rounded-full px-1 text-xs text-[var(--muted)] transition-[color] duration-150 hover:text-[var(--accent)] sm:gap-2 sm:px-3 sm:text-sm"><Trash className="size-4" /><span className="sm:hidden">Apagar</span><span className="hidden sm:inline">Apagar e começar</span></button>
            <span className="tabular min-w-[4.25rem] text-right">{index + 1} de {questions.length}</span>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--line)] sm:mt-6">
          <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1240px] flex-col justify-center py-10 sm:h-[calc(100dvh-6.75rem)] sm:min-h-0 sm:py-5 lg:grid lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-14 lg:py-5 xl:gap-20">
        <div className="question-enter lg:self-center">
          <p className="mb-5 text-[12px] font-medium uppercase tracking-[.22em] text-[var(--accent)] sm:mb-5 sm:text-sm">{question.eyebrow}</p>
          <h1 className="font-editorial max-w-[1120px] text-balance text-[clamp(2.55rem,6.3vw,4.6rem)] font-normal leading-[.95] tracking-[-.04em] lg:text-[clamp(3rem,4.3vw,4.5rem)]">{question.prompt}</h1>
          {question.helper && <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-base">{question.helper}</p>}
        </div>

        <div className="question-enter stagger-1 mt-10 sm:mt-8 lg:mt-0 lg:self-center">
          {question.type === "single" && (
            <div className={`grid gap-3 ${hasManyOptions ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1"}`}>
              {question.options?.map((option, optionIndex) => {
                const selected = answer === option.value || (question.scored === false && answer === option.key);
                const isLastOddOption = !hasManyOptions && optionCount % 2 === 1 && optionIndex === optionCount - 1;
                return (
                  <button
                    key={option.label}
                    onClick={() => {
                      if (question.scored === false) {
                        onAnswer(question.id, option.key ?? option.label);
                        window.setTimeout(onNext, 220);
                      } else chooseAndAdvance(option.value);
                    }}
                    className={`choice-button soft-card flex min-h-[64px] w-full items-center justify-between rounded-[24px] px-5 py-4 text-left text-base sm:min-h-[60px] sm:rounded-[24px] sm:px-6 sm:py-3 sm:text-lg lg:min-h-[64px] lg:px-7 ${isLastOddOption ? "sm:col-span-2 lg:col-span-1" : ""} ${selected ? "bg-[var(--ink)] text-white" : "bg-[var(--surface)] text-[var(--ink)]"}`}
                    aria-pressed={selected}
                  >
                    <span>{option.label}</span>
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full transition-[opacity,scale,filter] duration-300 ${selected ? "scale-100 bg-white/12 opacity-100 blur-0" : "scale-[.25] opacity-0 blur-[4px]"}`}><Check className="size-4" /></span>
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "multi" && <MultiAnswer question={question} answer={answer} onAnswer={onAnswer} onNext={onNext} />}
          {question.type === "range" && <RangeAnswer question={question} answer={answer} onAnswer={onAnswer} onNext={onNext} />}
          {question.type === "text" && <TextAnswer question={question} answer={answer} onAnswer={onAnswer} onNext={onNext} />}
        </div>
      </div>
    </main>
  );
}

function MultiAnswer({ question, answer, onAnswer, onNext }: { question: Question; answer: Answer | undefined; onAnswer: (id: string, answer: Answer) => void; onNext: () => void }) {
  const values = Array.isArray(answer) ? answer : [];
  const toggle = (value: string) => {
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    onAnswer(question.id, next);
  };
  return (
    <>
      <div className="flex flex-wrap gap-3">
        {question.options?.map((option) => {
          const value = option.key ?? option.label;
          const selected = values.includes(value);
          return <button key={value} onClick={() => toggle(value)} aria-pressed={selected} className={`choice-button soft-card min-h-14 rounded-full px-5 py-3 text-sm sm:px-6 sm:text-base ${selected ? "bg-[var(--ink)] text-white" : "bg-[var(--surface)]"}`}>{option.label}</button>;
        })}
      </div>
      <ContinueButton onClick={onNext} disabled={values.length === 0}>Continuar</ContinueButton>
    </>
  );
}

function RangeAnswer({ question, answer, onAnswer, onNext }: { question: Question; answer: Answer | undefined; onAnswer: (id: string, answer: Answer) => void; onNext: () => void }) {
  const min = question.min ?? 0;
  const max = question.max ?? 100;
  const value = typeof answer === "number" ? answer : Math.round((min + max) / 2);
  const progress = ((value - min) / (max - min)) * 100;
  const display = max === 100 ? `${value}%` : value;
  useEffect(() => {
    if (typeof answer !== "number") onAnswer(question.id, value);
  }, [answer, onAnswer, question.id, value]);
  return (
    <div className="soft-card rounded-[30px] bg-[var(--surface)] p-6 sm:p-9 lg:p-10">
      <div className="font-editorial tabular mb-7 text-center text-6xl font-normal text-[var(--accent)] sm:text-7xl">{display}</div>
      <input aria-label={question.prompt} type="range" min={min} max={max} step={question.step ?? 1} value={value} onChange={(event) => onAnswer(question.id, Number(event.target.value))} style={{ "--range-progress": `${progress}%` } as React.CSSProperties} />
      <div className="mt-5 flex justify-between gap-6 text-xs text-[var(--muted)] sm:text-sm"><span>{question.minLabel}</span><span className="text-right">{question.maxLabel}</span></div>
      <ContinueButton onClick={onNext}>Continuar</ContinueButton>
    </div>
  );
}

function TextAnswer({ question, answer, onAnswer, onNext }: { question: Question; answer: Answer | undefined; onAnswer: (id: string, answer: Answer) => void; onNext: () => void }) {
  const value = typeof answer === "string" ? answer : "";
  return (
    <div>
      <textarea value={value} onChange={(event) => onAnswer(question.id, event.target.value)} rows={4} maxLength={700} placeholder="Escreva o que vier à mente…" className="soft-card min-h-40 w-full resize-none rounded-[28px] bg-[var(--surface)] p-5 text-base leading-relaxed outline-none transition-[box-shadow] duration-150 placeholder:text-[var(--muted)]/60 focus:shadow-[0_0_0_2px_var(--accent)] sm:min-h-48 sm:p-7 sm:text-lg" />
      <div className="mt-2 flex justify-between text-xs text-[var(--muted)]"><span>{question.optional ? "Você pode pular esta pergunta" : ""}</span><span className="tabular">{value.length}/700</span></div>
      <ContinueButton onClick={onNext}>{value.trim() ? "Continuar" : "Pular"}</ContinueButton>
    </div>
  );
}

function ContinueButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="primary-button mt-7 flex min-h-14 items-center gap-3 rounded-full bg-[var(--ink)] py-3 pl-6 pr-[22px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-16 sm:px-8 sm:pr-[30px] sm:text-lg">
      {children}<ArrowRight className="size-5" />
    </button>
  );
}

function Result({ answers, completedAt, onRestart }: { answers: Record<string, Answer>; completedAt?: string; onRestart: () => void }) {
  const { dimensions: scores, overall } = useMemo(() => calculateScores(answers), [answers]);
  const writtenReflections = useMemo(() => questions.flatMap((question) => {
    const answer = answers[question.id];
    if (question.type !== "text" || typeof answer !== "string" || !answer.trim()) return [];
    return [{ id: question.id, prompt: question.prompt, answer: answer.trim() }];
  }), [answers]);
  const band = getBand(overall);
  const highlights = getHighlights(scores);
  const growthAreas = getGrowthAreas(scores);
  const [shareState, setShareState] = useState("Compartilhar resultado");

  const shareResult = async () => {
    setShareState("Criando imagem…");
    try {
      const blob = await createShareImage(band.title, overall);
      const file = new File([blob], "minha-direcao-atual.png", { type: "image/png" });
      const shareData = { title: "No que minha vida está me transformando?", text: `${band.title} — uma reflexão sobre minha direção atual.`, files: [file] };
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
      if ((error as DOMException).name === "AbortError") setShareState("Compartilhar resultado");
      else setShareState("Tentar novamente");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-6 sm:px-10 sm:pt-9 lg:px-16 lg:pb-24">
      <header className="flex items-center justify-between">
        <p className="text-[12px] font-medium uppercase tracking-[.25em] text-[var(--muted)] sm:text-sm">Sua reflexão</p>
        <button onClick={onRestart} className="flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-[var(--muted)] transition-[color] duration-150 hover:text-[var(--accent)]"><Trash className="size-4" /> Apagar e começar</button>
      </header>

      <section className="question-enter mx-auto max-w-[1240px] pb-10 pt-14 sm:pt-20 lg:pt-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-[.22em] text-[var(--accent)]">Sua direção atual</p>
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_280px] lg:gap-20">
          <div>
            <h1 className="font-editorial max-w-5xl text-balance text-[clamp(3.5rem,8vw,8rem)] font-normal leading-[.8] tracking-[-.05em]">{band.title}</h1>
            <p className="mt-7 max-w-3xl text-pretty text-base leading-relaxed text-[var(--muted)] sm:text-xl">{band.description}</p>
          </div>
          <div className="lg:text-right">
            <p className="text-sm text-[var(--muted)]">Sua pontuação geral</p>
            <p className="font-editorial tabular mt-1 text-7xl leading-none text-[var(--accent)] sm:text-8xl">{overall}<span className="text-4xl text-[var(--muted)]">/100</span></p>
          </div>
        </div>

        <DirectionScale score={overall} />
        <p className="mt-5 max-w-4xl text-pretty text-sm leading-relaxed text-[var(--muted)]">Sua nota é a média das oito dimensões, todas com o mesmo peso. Gostar da vida que leva influencia apenas parte de Propósito; isso não compensa notas baixas em Amor, Presença, Equilíbrio ou Responsabilidade. O resultado não mede seu valor como pessoa nem representa um diagnóstico{completedAt ? "." : "."}</p>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-5 border-t border-[var(--line)] py-12 sm:py-16 lg:grid-cols-[.84fr_1.16fr] lg:gap-8">
        <Radar scores={scores} />
        <div className="grid gap-5">
          <InsightCard eyebrow="O que parece fortalecer você" title={highlights.strongest.map((item) => item.label).join(" · ")} text="Estas são as dimensões que aparecem com mais consistência nas suas respostas. Elas podem ser pontos de apoio para trabalhar o restante." />
          <InsightCard eyebrow="O que merece sua atenção" title={highlights.attention.map((item) => item.label).join(" · ")} text="Não são falhas pessoais. São áreas em que pequenas escolhas conscientes talvez produzam uma mudança importante." accent />
          <InsightCard eyebrow="Um padrão que talvez passe despercebido" title="Forças e tensões podem coexistir" text={getPattern(scores)} />
        </div>
      </section>

      {writtenReflections.length > 0 && <WrittenReflections reflections={writtenReflections} />}

      <GrowthPath areas={growthAreas} overall={overall} />

      <section className="mx-auto max-w-[1240px] overflow-hidden rounded-[34px] bg-[var(--ink)] px-6 py-10 text-white sm:rounded-[48px] sm:px-12 sm:py-14 lg:px-16 lg:py-16">
        <p className="text-sm uppercase tracking-[.22em] text-[var(--accent-soft)]">Uma pergunta para continuar</p>
        <h2 className="font-editorial mt-5 max-w-5xl text-balance text-[clamp(2.8rem,6vw,6.2rem)] font-normal leading-[.9] tracking-[-.04em]">O que ainda precisa crescer em você para que sua vida não apenas funcione para você, mas também faça bem às pessoas que ama e à pessoa que está se tornando?</h2>
        <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row">
          <button onClick={shareResult} className="primary-button flex min-h-14 items-center gap-3 rounded-full bg-[var(--surface)] py-3 pl-6 pr-[22px] font-medium text-[var(--ink)] hover:bg-white sm:min-h-16 sm:px-8 sm:pr-[30px]"><Share className="size-5" /> {shareState}</button>
          <button onClick={onRestart} className="flex min-h-14 items-center gap-3 rounded-full px-5 text-white/75 transition-[color,scale] duration-150 hover:text-white active:scale-[.96]"><Trash className="size-5" /> Apagar e começar</button>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/50">A imagem mostra somente sua faixa de resultado e uma frase curta. Nenhuma resposta privada é incluída.</p>
      </section>
    </main>
  );
}

function GrowthPath({ areas, overall }: { areas: ReturnType<typeof getGrowthAreas>; overall: number }) {
  return (
    <section className="mx-auto max-w-[1240px] border-t border-[var(--line)] py-12 sm:py-16" aria-labelledby="growth-path-title">
      <div className="grid gap-8 lg:grid-cols-[1fr_.78fr] lg:items-end lg:gap-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-[.22em] text-[var(--accent)]">Como avançar da sua nota atual</p>
          <h2 id="growth-path-title" className="font-editorial mt-3 max-w-3xl text-balance text-[clamp(2.75rem,5vw,4.75rem)] font-normal leading-[.88] tracking-[-.04em]">Seu caminho mais direto para crescer</h2>
        </div>
        <div className="rounded-[24px] bg-[var(--paper-deep)] p-5 sm:p-6">
          <p className="text-sm font-medium text-[var(--ink)]">O que significa chegar perto de 100?</p>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted)]">Não significa ser perfeito. Significa responder de forma consistentemente saudável nas oito áreas. Partindo de <strong className="tabular font-semibold text-[var(--ink)]">{overall}/100</strong>, o caminho mais útil é fortalecer primeiro as dimensões abaixo.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {areas.map((area, index) => (
          <article key={area.key} className="soft-card flex h-full flex-col rounded-[28px] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.16em] text-[var(--accent)]">Prioridade {String(index + 1).padStart(2, "0")}</p>
                <h3 className="font-editorial mt-2 text-balance text-3xl font-normal leading-none tracking-[-.025em] sm:text-4xl">{area.label}</h3>
              </div>
              <p className="font-editorial tabular shrink-0 text-4xl leading-none text-[var(--accent)]">{area.score}<span className="text-xl text-[var(--muted)]">/100</span></p>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden="true">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${area.score}%` }} />
            </div>
            <p className="tabular mt-2 text-xs text-[var(--muted)]">Espaço de crescimento nesta dimensão: {area.gap} pontos</p>

            <p className="mt-6 text-xs font-medium uppercase tracking-[.14em] text-[var(--muted)]">Uma nota mais alta representa</p>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--ink)] sm:text-base">{area.meaning}</p>

            <div className="mt-6 rounded-[18px] bg-[var(--paper)] p-4 sm:p-5 lg:mt-auto lg:translate-y-2">
              <p className="text-xs font-medium uppercase tracking-[.14em] text-[var(--accent)]">Próximo passo nesta semana</p>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted)]">{area.action}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WrittenReflections({ reflections }: { reflections: { id: string; prompt: string; answer: string }[] }) {
  return (
    <section className="mx-auto max-w-[1240px] border-t border-[var(--line)] py-12 sm:py-16" aria-labelledby="written-reflections-title">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[.22em] text-[var(--accent)]">Reflexões pessoais</p>
          <h2 id="written-reflections-title" className="font-editorial mt-3 text-balance text-[clamp(2.75rem,5vw,4.75rem)] font-normal leading-[.88] tracking-[-.04em]">Suas próprias palavras</h2>
        </div>
        <p className="rounded-full bg-[var(--paper-deep)] px-4 py-2 text-xs font-medium text-[var(--muted)] sm:text-sm">Privado · somente neste dispositivo</p>
      </div>

      <div className={`grid gap-4 ${reflections.length > 1 ? "lg:grid-cols-2" : ""}`}>
        {reflections.map((reflection, index) => (
          <article key={reflection.id} className={`soft-card rounded-[28px] bg-[var(--surface)] p-6 sm:rounded-[32px] sm:p-8 ${reflections.length === 3 && index === 2 ? "lg:col-span-2" : ""}`}>
            <p className="max-w-3xl text-pretty text-sm font-medium leading-relaxed text-[var(--muted)] sm:text-base">{reflection.prompt}</p>
            <p className="mt-5 max-w-4xl whitespace-pre-wrap break-words text-pretty text-lg leading-relaxed text-[var(--ink)] sm:text-xl">{reflection.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DirectionScale({ score }: { score: number }) {
  return (
    <div className="mt-12 sm:mt-16">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-[#8f7769] via-[var(--accent-soft)] to-[var(--accent)]">
        <div className="absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--surface)] shadow-[0_0_0_2px_var(--ink),0_5px_14px_rgba(38,27,21,.2)] transition-[left] duration-500" style={{ left: `clamp(14px, ${score}%, calc(100% - 14px))` }}><span className="sr-only">Posição aproximada: {score} de 100</span></div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] leading-tight text-[var(--muted)] sm:text-sm"><span>Preso em padrões</span><span className="text-center">Em transformação</span><span className="text-right">Crescimento consciente</span></div>
    </div>
  );
}

function Radar({ scores }: { scores: DimensionScores }) {
  const center = 150;
  const radius = 106;
  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / dimensions.length;
    const distance = radius * (value / 100);
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
  };
  const polygon = dimensions.map((dimension, index) => point(index, scores[dimension])).join(" ");
  return (
    <div className="soft-card rounded-[32px] bg-[var(--surface)] p-5 sm:p-8">
      <p className="text-sm font-medium uppercase tracking-[.2em] text-[var(--muted)]">Suas oito dimensões</p>
      <svg viewBox="0 0 300 300" className="mx-auto mt-4 aspect-square w-full max-w-[420px] overflow-visible" role="img" aria-label="Gráfico das oito dimensões">
        {[25, 50, 75, 100].map((level) => <polygon key={level} points={dimensions.map((_, index) => point(index, level)).join(" ")} fill="none" stroke="var(--line)" strokeWidth="1" />)}
        {dimensions.map((_, index) => <line key={index} x1={center} y1={center} x2={point(index, 100).split(",")[0]} y2={point(index, 100).split(",")[1]} stroke="var(--line)" strokeWidth="1" />)}
        <polygon points={polygon} fill="rgba(217,120,80,.24)" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
        {dimensions.map((dimension, index) => { const [cx, cy] = point(index, scores[dimension]).split(","); return <circle key={dimension} cx={cx} cy={cy} r="4" fill="var(--ink)" />; })}
      </svg>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {dimensions.map((dimension) => (
          <div key={dimension} className="rounded-[18px] bg-[var(--paper)] p-3.5 sm:p-4" aria-label={`${dimensionLabels[dimension]}: ${scores[dimension]} de 100`}>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <span className="text-pretty text-sm font-medium leading-snug text-[var(--ink)] sm:text-[15px]">{dimensionLabels[dimension]}</span>
              <strong className="font-editorial tabular shrink-0 text-2xl font-normal leading-none text-[var(--accent)]">{scores[dimension]}</strong>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${scores[dimension]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ eyebrow, title, text, accent = false }: { eyebrow: string; title: string; text: string; accent?: boolean }) {
  return <article className={`soft-card rounded-[28px] p-6 sm:p-8 ${accent ? "bg-[var(--paper-deep)]" : "bg-[var(--surface)]"}`}><p className="text-xs font-medium uppercase tracking-[.18em] text-[var(--accent)]">{eyebrow}</p><h3 className="font-editorial mt-3 text-balance text-3xl font-normal leading-none tracking-[-.025em] sm:text-4xl">{title}</h3><p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-base">{text}</p></article>;
}

function createShareImage(title: string, score: number): Promise<Blob> {
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
    ctx.font = "500 26px Arial, sans-serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("REFLEXÃO PESSOAL", 90, 180);

    ctx.fillStyle = "#261b15";
    ctx.font = "500 105px Georgia, serif";
    wrapCanvasText(ctx, "No que minha vida está me transformando?", 90, 390, 900, 105);

    ctx.fillStyle = "#d97850";
    ctx.font = "italic 500 76px Georgia, serif";
    ctx.fillText("Minha direção atual", 90, 850);

    ctx.fillStyle = "#261b15";
    ctx.font = "600 82px Georgia, serif";
    wrapCanvasText(ctx, title, 90, 980, 900, 90);

    ctx.fillStyle = "#746b62";
    ctx.font = "400 34px Arial, sans-serif";
    wrapCanvasText(ctx, "Minhas respostas sugerem uma direção — não uma verdade absoluta. Mudar continua sendo possível.", 90, 1280, 860, 52);

    ctx.strokeStyle = "#d8cbbb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 1530);
    ctx.lineTo(990, 1530);
    ctx.stroke();

    ctx.fillStyle = "#261b15";
    ctx.font = "500 30px Arial, sans-serif";
    ctx.fillText("Pontuação opcional", 90, 1610);
    ctx.fillStyle = "#d97850";
    ctx.font = "500 92px Georgia, serif";
    ctx.fillText(`${score} / 100`, 90, 1720);

    ctx.fillStyle = "#746b62";
    ctx.font = "400 27px Arial, sans-serif";
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
