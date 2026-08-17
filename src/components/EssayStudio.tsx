import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, ErrorNote, friendlyApiError, useT } from "@/lib/ui";

const WORD_OPTIONS = [100, 250, 500, 1000, 1500, 2000, 3000, 4000, 5000];

export function EssayStudio() {
  const { t, lang } = useT();
  const [words, setWords] = useState(500);
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setEssay("");
    setProgress(0);
    const iv = setInterval(
      () => setProgress((p) => (p < 94 ? p + Math.random() * 3 + 0.7 : p)),
      280,
    );
    try {
      const res = await fetch("/api/public/essay-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, words, lang }),
      });
      if (!res.ok) throw new Error(await friendlyApiError(res, t));
      const data = (await res.json()) as { essay: string };
      setProgress(100);
      await new Promise((r) => setTimeout(r, 500));
      setEssay(data.essay);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric);
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  }

  if (loading || progress === 100) {
    if (loading)
      return (
        <ProgressRing percent={progress} title={t.essayPrep} steps={t.essaySteps} />
      );
  }

  return (
    <div className="space-y-4">
      <Card className="animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
        <label className="block px-1 pb-2 text-xs font-bold text-violet-600">
          {t.wordCount}
        </label>
        <div className="flex flex-wrap gap-2">
          {WORD_OPTIONS.map((w, i) => (
            <button
              key={w}
              type="button"
              onClick={() => setWords(w)}
              data-on={words === w}
              style={{ animationDelay: `${i * 40}ms` }}
              className="gw-opt animate-[pop_0.4s_ease-out_both] rounded-full px-3.5 py-1.5 text-sm font-bold"
            >
              {w}
            </button>
          ))}
        </div>
      </Card>

      <div
        className="relative animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{ animationDelay: "120ms" }}
      >
        <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2.5rem] bg-[conic-gradient(from_0deg,rgba(167,139,250,0.28),rgba(96,165,250,0.28),rgba(244,182,255,0.28),rgba(167,139,250,0.28))] blur-2xl animate-[auraSpin_16s_linear_infinite]" />
        <Card className="relative overflow-hidden rounded-[2rem]">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="inline-flex h-7 w-7 animate-[floaty_4s_ease-in-out_infinite] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm text-white">
              💬
            </span>
            <span className="text-xs font-bold text-violet-600">{t.essayBubble}</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder={t.essayPlaceholder}
            className="w-full resize-y rounded-[1.5rem] border border-violet-100 bg-white/70 p-3.5 text-sm outline-none transition-all duration-300 focus:border-violet-400 focus:shadow-[0_12px_34px_-18px_rgba(109,40,217,0.55)]"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!prompt.trim()}
            data-on="true"
            className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-black transition-transform duration-300 hover:-translate-y-0.5"
          >
            {t.writeEssay}
          </button>
        </Card>
      </div>

      {error && <ErrorNote text={error} />}

      {essay && (
        <Card className="animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                📝
              </span>
              {t.yourEssay}
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(essay)}
              className="gw-glass rounded-full px-2.5 py-1 text-[11px] font-semibold"
            >
              {t.copy}
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{essay}</ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}

export function ProgressRing({
  percent,
  title,
  steps,
}: {
  percent: number;
  title: string;
  steps: readonly string[];
}) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setStep((s) => (s + 1) % steps.length), 2600);
    return () => clearInterval(iv);
  }, [steps.length]);

  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-[fadeIn_0.4s_ease-out_both]">
      <div className="relative h-40 w-40">
        <div className="absolute inset-0 animate-[glowPulse_4s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-violet-400 to-blue-400 opacity-30 blur-2xl" />
        <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
          <circle cx="65" cy="65" r={r} stroke="rgba(139,92,246,0.15)" strokeWidth="9" fill="none" />
          <circle
            cx="65"
            cy="65"
            r={r}
            stroke="url(#ringGrad)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (percent / 100) * c}
            style={{ transition: "stroke-dashoffset 420ms cubic-bezier(0.16,1,0.3,1)" }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-black text-transparent">
            {Math.round(percent)}%
          </span>
        </div>
      </div>

      <p className="mt-6 text-center text-base font-black">
        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {title}
        </span>
      </p>
      <p
        key={step}
        className="mt-2 h-5 animate-[fadeUp_0.5s_ease-out_both] text-center text-xs font-semibold opacity-70"
      >
        {steps[step]}
      </p>

      <div className="mt-5 flex gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step ? "w-6 bg-violet-500" : "w-1.5 bg-violet-300/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
