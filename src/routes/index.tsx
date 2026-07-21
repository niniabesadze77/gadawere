import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "gadawere. – სასკოლო AI ასისტენტი" },
      {
        name: "description",
        content:
          "სასკოლო AI ასისტენტი ქართულ ენაზე – ქართული, მათემატიკა, ვარჯიშის ზონა.",
      },
      { property: "og:title", content: "gadawere. – სასკოლო AI ასისტენტი" },
      { property: "og:description", content: "სწავლა მარტივია, როცა გაქვს AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Subject = "georgian" | "math" | "physics" | "geography" | "chemistry";

const SUBJECTS: {
  id: Subject;
  label: string;
  emoji: string;
  active: boolean;
  desc: string;
}[] = [
  { id: "georgian", label: "ქართული", emoji: "📖", active: true, desc: "ტექსტი + ვარჯიში" },
  { id: "math", label: "მათემატიკა", emoji: "🧮", active: true, desc: "AI + კალკ. + ვარჯიში" },
  { id: "physics", label: "ფიზიკა", emoji: "⚛️", active: false, desc: "მალე" },
  { id: "geography", label: "გეოგრაფია", emoji: "🌍", active: false, desc: "მალე" },
  { id: "chemistry", label: "ქიმია", emoji: "🧪", active: false, desc: "მალე" },
];

function Home() {
  const [phase, setPhase] = useState<"intro" | "ready">("intro");
  const [selected, setSelected] = useState<Subject | null>(null);

  function advance() {
    if (phase === "intro") setPhase("ready");
  }

  return (
    <div
      onClick={advance}
      onTouchStart={advance}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-violet-50 to-blue-50 text-slate-900"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-200/40 blur-3xl" />

      {/* Logo */}
      <div
        className={`fixed left-1/2 z-30 -translate-x-1/2 transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === "intro"
            ? "top-1/2 -translate-y-1/2 scale-150 duration-700"
            : "top-6 scale-100 duration-[1400ms]"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (phase === "ready") setSelected(null);
          }}
          className="relative block cursor-pointer"
        >
          <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-r from-violet-400 to-blue-400 opacity-40 blur-2xl" />
          <div className="rounded-full border border-violet-200 bg-white/80 px-5 py-2 shadow-lg shadow-violet-200/50 backdrop-blur transition active:scale-95">
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              gadawere.
            </span>
          </div>
        </button>
        {phase === "ready" && !selected && (
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=gadatseresupport@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 block animate-[fadeUp_0.7s_ease-out_both] text-center text-xs font-semibold text-violet-600 transition hover:text-blue-600"
            style={{ animationDelay: "800ms" }}
          >
            support
          </a>
        )}
      </div>

      {/* Intro hint */}
      {phase === "intro" && (
        <div className="fixed inset-x-0 bottom-16 z-20 text-center">
          <p className="animate-pulse text-sm font-semibold text-violet-600">
            შეეხე ეკრანს დასაწყებად
          </p>
        </div>
      )}

      <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-28">
        <div
          className={`transition-all duration-[900ms] ease-out ${
            phase === "ready"
              ? "translate-y-0 opacity-100 delay-500"
              : "pointer-events-none translate-y-6 opacity-0"
          }`}
        >
          {!selected ? (
            <SubjectPicker onPick={(s) => setSelected(s)} />
          ) : (
            <SubjectView subject={selected} onBack={() => setSelected(null)} />
          )}
        </div>

        {phase === "ready" && !selected && (
          <div
            className="mt-16 animate-[fadeUp_0.7s_ease-out_both] text-center"
            style={{ animationDelay: "900ms" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold text-violet-700">გამოგვყევი</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/gadatsere?igsh=bWs3MjU3cW40aXZ3&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-md active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <defs>
                    <linearGradient id="igGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f9ce34" />
                      <stop offset="50%" stopColor="#ee2a7b" />
                      <stop offset="100%" stopColor="#6228d7" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#igGrad)" />
                  <circle cx="12" cy="12" r="4.2" fill="none" stroke="white" strokeWidth="1.8" />
                  <circle cx="17.4" cy="6.6" r="1.2" fill="white" />
                </svg>
                gadatsere
              </a>
              <a
                href="https://www.tiktok.com/@gadatsere?_r=1&_t=ZS-98CJf1RDGit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M16.5 3c.4 2.1 1.7 3.7 3.9 4.1v2.6c-1.5 0-2.9-.4-4-1.1v6.7a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a2.9 2.9 0 1 0 2.1 2.8V3h2.7z"
                    fill="#000"
                  />
                </svg>
                gadatsere
              </a>
            </div>
          </div>
        )}

        <footer
          className={`mt-10 text-center text-xs text-slate-500 transition-opacity duration-700 ${
            phase === "ready" ? "opacity-100 delay-700" : "opacity-0"
          }`}
        >
          © gadawere. · სასკოლო AI ასისტენტი
        </footer>
      </main>

      <BackgroundAnim />
      <GlobalAnim />
    </div>
  );
}

function BackgroundAnim() {
  const effect = useMemo(() => {
    const options = ["snow", "rain", "sun", "petals", "bubbles"] as const;
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  if (effect === "sun") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-yellow-200/50 blur-3xl animate-[sunPulse_6s_ease-in-out_infinite]" />
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="absolute origin-top-right bg-gradient-to-b from-yellow-200/60 to-transparent"
            style={{
              top: "0px",
              right: "0px",
              width: "2px",
              height: "70vh",
              transform: `rotate(${20 + i * 6}deg)`,
              animation: `rayFlicker 3s ${i * 0.15}s ease-in-out infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes sunPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.8;transform:scale(1.08)} }
          @keyframes rayFlicker { 0%,100%{opacity:.15} 50%{opacity:.6} }
        `}</style>
      </div>
    );
  }

  const particleCount = effect === "rain" ? 55 : effect === "snow" ? 45 : 30;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration:
      effect === "rain" ? 0.7 + Math.random() * 0.8 : 6 + Math.random() * 8,
    size:
      effect === "snow"
        ? 6 + Math.random() * 10
        : effect === "petals"
          ? 10 + Math.random() * 8
          : effect === "bubbles"
            ? 8 + Math.random() * 14
            : 1 + Math.random(),
    drift: (Math.random() - 0.5) * 60,
    i,
  }));

  const glyph =
    effect === "snow" ? "❄" : effect === "petals" ? "🌸" : effect === "bubbles" ? "•" : "";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.i}
          className={
            effect === "rain"
              ? "absolute bg-gradient-to-b from-blue-400/70 to-blue-300/0"
              : effect === "bubbles"
                ? "absolute rounded-full border border-blue-300/40 bg-blue-100/30"
                : "absolute select-none"
          }
          style={{
            left: `${p.left}%`,
            top: effect === "bubbles" ? "100%" : "-10%",
            width: effect === "rain" ? "2px" : effect === "bubbles" ? `${p.size}px` : undefined,
            height: effect === "rain" ? `${14 + p.size * 6}px` : effect === "bubbles" ? `${p.size}px` : undefined,
            fontSize: effect === "snow" || effect === "petals" ? `${p.size}px` : undefined,
            color: effect === "snow" ? "rgba(148,163,255,0.75)" : effect === "petals" ? "rgba(236,72,153,0.75)" : undefined,
            animation: `${
              effect === "rain"
                ? "rainFall"
                : effect === "bubbles"
                  ? "bubbleRise"
                  : "flakeFall"
            } ${p.duration}s ${p.delay}s linear infinite`,
            ["--drift" as any]: `${p.drift}px`,
          }}
        >
          {effect === "snow" || effect === "petals" ? glyph : null}
        </span>
      ))}
      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-10vh); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(115vh); opacity: 0; }
        }
        @keyframes flakeFall {
          0% { transform: translate(0, -10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate(var(--drift), 115vh) rotate(360deg); opacity: 0; }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.7; }
          100% { transform: translateY(-120vh) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function GlobalAnim() {
  return (
    <style>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn { from {opacity:0} to {opacity:1} }
      @keyframes pop {
        0% { transform: scale(0.9); opacity: 0; }
        60% { transform: scale(1.04); opacity: 1; }
        100% { transform: scale(1); }
      }
      @keyframes typewriter {
        from { clip-path: inset(0 100% 0 0); }
        to { clip-path: inset(0 0 0 0); }
      }
      @keyframes shine {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  );
}

function SubjectPicker({ onPick }: { onPick: (s: Subject) => void }) {
  return (
    <div>
      <h1 className="text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        აირჩიე{" "}
        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          საგანი
        </span>
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        დააჭირე ბაბლს რომ დაიწყო
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SUBJECTS.map((s, i) => (
          <button
            key={s.id}
            disabled={!s.active}
            onClick={() => s.active && onPick(s.id)}
            style={{ animationDelay: `${i * 90}ms` }}
            className={`group relative overflow-hidden rounded-3xl border p-5 text-left shadow-sm transition-all duration-300 animate-[fadeUp_0.6s_ease-out_both] ${
              s.active
                ? "border-violet-200 bg-white hover:-translate-y-1 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-200/60 active:scale-95"
                : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
            }`}
          >
            {s.active && (
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-violet-300 to-blue-300 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70" />
            )}
            <div className="relative">
              <div className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                {s.emoji}
              </div>
              <div className="mt-3 text-lg font-black text-slate-900">{s.label}</div>
              <div className="mt-1 text-xs text-slate-500">{s.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SubjectView({
  subject,
  onBack,
}: {
  subject: Subject;
  onBack: () => void;
}) {
  const label = SUBJECTS.find((s) => s.id === subject)?.label ?? "";
  return (
    <div className="animate-[fadeUp_0.5s_ease-out_both]">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm transition hover:-translate-x-0.5 hover:bg-violet-50 active:scale-95"
      >
        ← საგნებზე დაბრუნება
      </button>
      <h2 className="mb-4 text-2xl font-black">
        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {label}
        </span>
      </h2>

      {subject === "georgian" && <GeorgianHub />}
      {subject === "math" && <MathHub />}
    </div>
  );
}

/* ---------------- Georgian ---------------- */

function GeorgianHub() {
  const [mode, setMode] = useState<"essay" | "checker" | "practice">("essay");
  return (
    <Panel>
      <div className="flex gap-1.5 rounded-2xl border border-violet-100 bg-violet-50/60 p-1">
        <SegBtn active={mode === "essay"} onClick={() => setMode("essay")}>
          📝 ესსე
        </SegBtn>
        <SegBtn active={mode === "checker"} onClick={() => setMode("checker")}>
          ✍️ შემოწმება
        </SegBtn>
        <SegBtn active={mode === "practice"} onClick={() => setMode("practice")}>
          🏋️ ვარჯიში
        </SegBtn>
      </div>
      <div className="mt-4 animate-[fadeIn_0.4s_ease-out_both]" key={mode}>
        {mode === "essay" && <EssayWriter />}
        {mode === "checker" && <GeorgianChecker />}
        {mode === "practice" && <PracticeZone subject="georgian" />}
      </div>
    </Panel>
  );
}

const WORD_OPTIONS = [100, 250, 500, 1000, 1500, 2000, 3000, 4000, 5000];

function EssayWriter() {
  const [words, setWords] = useState<number>(500);
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function submit() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setEssay("");
    setProgress(0);
    const iv = setInterval(
      () => setProgress((p) => (p < 92 ? p + Math.random() * 4 + 1 : p)),
      250,
    );
    try {
      const res = await fetch("/api/essay-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, words }),
      });
      if (!res.ok) throw new Error((await res.text()) || `შეცდომა (${res.status})`);
      const data = (await res.json()) as { essay: string };
      setProgress(100);
      await new Promise((r) => setTimeout(r, 350));
      setEssay(data.essay);
    } catch (e) {
      setError(e instanceof Error ? e.message : "დაფიქსირდა შეცდომა");
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease-out_both] space-y-4">
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 to-blue-50 p-4 shadow-sm">
        <label className="block px-1 pb-2 text-xs font-bold text-violet-700">
          📏 სიტყვების რაოდენობა
        </label>
        <div className="flex flex-wrap gap-2">
          {WORD_OPTIONS.map((w, i) => (
            <button
              key={w}
              onClick={() => setWords(w)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`animate-[pop_0.4s_ease-out_both] rounded-full border px-3.5 py-1.5 text-sm font-bold shadow-sm transition active:scale-95 ${
                words === w
                  ? "border-transparent bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-violet-300"
                  : "border-violet-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-violet-400"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-violet-200 bg-white p-4 shadow-sm">
        <label className="block px-1 pb-2 text-xs font-bold text-violet-700">
          💡 თემა / აღწერე
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="აღწერე რაზე გინდა ესსე... (მაგ: ჩემი საყვარელი წიგნი, ბუნების დაცვა და ა.შ.)"
          className="w-full resize-y rounded-2xl border border-violet-100 bg-violet-50/40 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={loading || !prompt.trim()}
          className="mt-3 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {loading ? "ვწერ ესსეს..." : "✨ დამიწერე ესსე"}
        </button>
      </div>

      {error && <ErrorNote text={error} />}

      {loading && (
        <div className="animate-[fadeIn_0.3s_ease-out_both] rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-violet-700">
            <span>✍️ ვწერ შენს ესსეს...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 via-blue-500 to-violet-600 bg-[length:200%_100%] animate-[shine_2s_linear_infinite] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {essay && (
        <div className="animate-[fadeUp_0.5s_ease-out_both] rounded-3xl border border-violet-200 bg-white p-5 shadow-md shadow-violet-100">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                📝
              </span>
              შენი ესსე
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(essay)}
              className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-400 active:scale-95"
            >
              📋 კოპირება
            </button>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800 prose-headings:text-slate-900">
            <ReactMarkdown>{essay}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function GeorgianChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => splitCorrected(result), [result]);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult("");
    try {
      const res = await fetch("/api/improve-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error((await res.text()) || `შეცდომა (${res.status})`);
      const data = (await res.json()) as { improved: string };
      setResult(data.improved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "დაფიქსირდა შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease-out_both]">
      <div className="flex justify-end">
        <div className="max-w-full flex-1 rounded-3xl rounded-br-md border border-violet-200 bg-gradient-to-br from-violet-100 to-blue-50 p-3 shadow-sm">
          <label className="block px-1 pb-1 text-xs font-semibold text-violet-700">
            📝 შენი ტექსტი
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="ჩაწერე შენი ტექსტი აქ..."
            className="w-full resize-y rounded-2xl border border-white/60 bg-white/80 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={loading || !text.trim()}
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {loading ? "ვამოწმებ..." : "✨ შემიმოწმე"}
          </button>
        </div>
      </div>

      {error && <ErrorNote text={error} />}

      {loading && (
        <div className="mt-4 flex justify-start">
          <div className="flex gap-1 rounded-2xl rounded-bl-md border border-violet-100 bg-white px-3 py-2.5">
            <Dot /> <Dot delay={150} /> <Dot delay={300} />
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="animate-[fadeUp_0.4s_ease-out_both] rounded-3xl rounded-bl-md border border-violet-200 bg-white p-4 shadow-md shadow-violet-100">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                ✍️
              </span>
              შესწორებული ტექსტი
            </div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">
              {parsed.corrected || <span className="text-slate-400">—</span>}
            </div>
          </div>
          {parsed.notes && (
            <div
              className="animate-[fadeUp_0.5s_ease-out_both] rounded-3xl rounded-bl-md border border-blue-200 bg-blue-50/60 p-4 shadow-md shadow-blue-100"
              style={{ animationDelay: "250ms" }}
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-blue-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                  📌
                </span>
                შენიშვნები
              </div>
              <div className="prose prose-sm max-w-none prose-strong:text-blue-700">
                <ReactMarkdown>{parsed.notes}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function splitCorrected(md: string): { corrected: string; notes: string } {
  if (!md) return { corrected: "", notes: "" };
  // Match "### გასწორებული ტექსტი" ... "### აღმოჩენილი შეცდომები"
  const correctedMatch = md.match(
    /###\s*გასწორებული ტექსტი\s*\n([\s\S]*?)(?=\n###|$)/,
  );
  const notesMatch = md.match(/###\s*აღმოჩენილი შეცდომები\s*\n([\s\S]*)/);
  if (correctedMatch) {
    return {
      corrected: correctedMatch[1].trim(),
      notes: notesMatch ? notesMatch[1].trim() : "",
    };
  }
  return { corrected: md, notes: "" };
}

/* ---------------- Math ---------------- */

function MathHub() {
  const [mode, setMode] = useState<"chat" | "calc" | "photo" | "practice">("chat");
  return (
    <Panel>
      <div className="flex gap-1.5 rounded-2xl border border-violet-100 bg-violet-50/60 p-1">
        <SegBtn active={mode === "chat"} onClick={() => setMode("chat")}>💬 AI</SegBtn>
        <SegBtn active={mode === "calc"} onClick={() => setMode("calc")}>🔢 კალკ.</SegBtn>
        <SegBtn active={mode === "photo"} onClick={() => setMode("photo")}>📸 ფოტო</SegBtn>
        <SegBtn active={mode === "practice"} onClick={() => setMode("practice")}>🏋️</SegBtn>
      </div>
      <div className="mt-4 animate-[fadeIn_0.4s_ease-out_both]" key={mode}>
        {mode === "chat" && <MathChat />}
        {mode === "calc" && <MathCalculator />}
        {mode === "photo" && <MathPhoto />}
        {mode === "practice" && <PracticeZone subject="math" />}
      </div>
    </Panel>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold transition active:scale-95 ${
        active
          ? "bg-white text-violet-700 shadow-sm shadow-violet-200"
          : "text-slate-500 hover:text-violet-600"
      }`}
    >
      {children}
    </button>
  );
}

function MathChat() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const q = input.trim();
    if (!q) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/math-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error((await res.text()) || `შეცდომა (${res.status})`);
      const data = (await res.json()) as { reply: string };
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "დაფიქსირდა შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        ref={scrollRef}
        className="max-h-80 min-h-40 space-y-3 overflow-y-auto rounded-2xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/40 p-3"
      >
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            მოგესალმები! ✨ დამისვი მათემატიკის კითხვა.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex animate-[fadeUp_0.3s_ease-out_both] ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "rounded-br-md bg-gradient-to-br from-violet-600 to-blue-600 text-white"
                  : "rounded-bl-md border border-violet-100 bg-white text-slate-800"
              }`}
            >
              {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-violet-100 bg-white px-3 py-2.5">
              <Dot /> <Dot delay={150} /> <Dot delay={300} />
            </div>
          </div>
        )}
      </div>

      {error && <ErrorNote text={error} />}

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="მაგ. ამოხსენი 2x + 5 = 15"
          className="flex-1 rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-2 w-2 animate-bounce rounded-full bg-violet-400"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function MathCalculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string>("");

  function press(v: string) {
    setExpr((e) => e + v);
  }
  function clear() {
    setExpr("");
    setResult("");
  }
  function back() {
    setExpr((e) => e.slice(0, -1));
  }
  function equals() {
    try {
      const sanitized = expr
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("−", "-")
        .replaceAll("π", "Math.PI")
        .replaceAll("√", "Math.sqrt")
        .replaceAll("^", "**");
      if (
        !/^[-+*/().\d\s\w]+$/.test(
          sanitized.replaceAll("Math.PI", "").replaceAll("Math.sqrt", ""),
        )
      ) {
        throw new Error("invalid");
      }
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict"; return (${sanitized})`)();
      setResult(String(r));
    } catch {
      setResult("შეცდომა");
    }
  }

  const keys: { label: string; onClick: () => void; className?: string }[] = [
    { label: "C", onClick: clear, className: "bg-red-100 text-red-600" },
    { label: "(", onClick: () => press("(") },
    { label: ")", onClick: () => press(")") },
    { label: "⌫", onClick: back, className: "bg-violet-100 text-violet-700" },
    { label: "7", onClick: () => press("7") },
    { label: "8", onClick: () => press("8") },
    { label: "9", onClick: () => press("9") },
    { label: "÷", onClick: () => press("÷"), className: "bg-blue-100 text-blue-700" },
    { label: "4", onClick: () => press("4") },
    { label: "5", onClick: () => press("5") },
    { label: "6", onClick: () => press("6") },
    { label: "×", onClick: () => press("×"), className: "bg-blue-100 text-blue-700" },
    { label: "1", onClick: () => press("1") },
    { label: "2", onClick: () => press("2") },
    { label: "3", onClick: () => press("3") },
    { label: "−", onClick: () => press("−"), className: "bg-blue-100 text-blue-700" },
    { label: "0", onClick: () => press("0") },
    { label: ".", onClick: () => press(".") },
    { label: "π", onClick: () => press("π"), className: "bg-violet-100 text-violet-700" },
    { label: "+", onClick: () => press("+"), className: "bg-blue-100 text-blue-700" },
    { label: "√", onClick: () => press("√("), className: "bg-violet-100 text-violet-700" },
    { label: "^", onClick: () => press("^"), className: "bg-violet-100 text-violet-700" },
    {
      label: "=",
      onClick: equals,
      className: "col-span-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white",
    },
  ];

  return (
    <div>
      <div className="rounded-2xl border border-violet-200 bg-white p-4">
        <div className="min-h-6 break-all text-right text-sm text-slate-500">
          {expr || "0"}
        </div>
        <div className="mt-1 break-all text-right text-2xl font-black text-violet-700">
          {result || " "}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {keys.map((k, i) => (
          <button
            key={i}
            onClick={k.onClick}
            className={`rounded-2xl bg-white p-3 text-lg font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-90 ${
              k.className ?? ""
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MathPhoto() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFile(f: File | undefined) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setSolution("");
    setError(null);
  }

  async function submit() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setSolution("");
    try {
      const res = await fetch("/api/solve-math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: preview }),
      });
      if (!res.ok) throw new Error((await res.text()) || `შეცდომა (${res.status})`);
      const data = (await res.json()) as { solution: string };
      setSolution(data.solution);
    } catch (e) {
      setError(e instanceof Error ? e.message : "დაფიქსირდა შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-blue-50 px-4 py-8 text-center transition hover:-translate-y-0.5 hover:border-violet-500 hover:shadow-md active:scale-[0.98]"
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Math problem"
              className="max-h-64 rounded-2xl object-contain shadow-md"
            />
            {solution && <Sparkles />}
          </div>
        ) : (
          <>
            <span className="text-5xl">📷</span>
            <span className="text-sm font-bold text-violet-700">
              დააჭირე ფოტოს ასარჩევად ან გადასაღებლად
            </span>
            <span className="text-xs text-slate-500">PNG, JPG, WEBP</span>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <button
        onClick={submit}
        disabled={loading || !preview}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        {loading ? "ვხსნი..." : "✨ ამოხსენი მაგალითი"}
      </button>

      {error && <ErrorNote text={error} />}

      {solution && (
        <div className="mt-4 animate-[fadeUp_0.5s_ease-out_both]">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-700">
            <span className="inline-flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
              ✨
            </span>
            AI პასუხი
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-md shadow-violet-100">
            <Markdown>{solution}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}

function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute text-yellow-400"
          style={{
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            animation: `sparkle 1.6s ${i * 0.15}s infinite`,
            fontSize: `${10 + Math.random() * 12}px`,
          }}
        >
          ✨
        </span>
      ))}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.6) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
        }
      `}</style>
    </div>
  );
}

/* ---------------- Practice Zone ---------------- */

type MathQ = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
type GeoQ = {
  id: number;
  question: string;
  correctAnswer: string;
  hint: string;
  explanation: string;
};

function PracticeZone({ subject }: { subject: "math" | "georgian" }) {
  const [grade, setGrade] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [state, setState] = useState<"setup" | "loading" | "quiz" | "done">("setup");
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const maxGrade = subject === "georgian" ? 12 : 12;

  async function start() {
    if (!grade || !level) return;
    setState("loading");
    setError(null);
    setProgress(0);
    // Fake progress while awaiting
    const iv = setInterval(
      () => setProgress((p) => (p < 92 ? p + Math.random() * 6 : p)),
      200,
    );
    try {
      const res = await fetch("/api/practice-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, level }),
      });
      if (!res.ok) throw new Error((await res.text()) || `შეცდომა (${res.status})`);
      const data = (await res.json()) as { questions: any[] };
      const qs = (data.questions || []).slice(0, 10);
      if (qs.length === 0) throw new Error("კითხვები ვერ დაგენერირდა");
      setQuestions(qs);
      setProgress(100);
      setTimeout(() => setState("quiz"), 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : "შეცდომა");
      setState("setup");
    } finally {
      clearInterval(iv);
    }
  }

  function reset() {
    setQuestions([]);
    setState("setup");
    setProgress(0);
  }

  if (state === "loading") return <LoadingCircle percent={progress} />;
  if (state === "quiz")
    return (
      <Quiz
        subject={subject}
        questions={questions}
        onFinish={() => setState("done")}
        onExit={reset}
      />
    );
  if (state === "done")
    return <QuizDone onAgain={reset} />;

  return (
    <div className="animate-[fadeUp_0.4s_ease-out_both] space-y-4">
      <div>
        <div className="mb-2 text-xs font-bold text-violet-700">📚 კლასი</div>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: maxGrade }, (_, i) => i + 1).map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`rounded-xl border py-2 text-sm font-bold transition active:scale-90 ${
                grade === g
                  ? "border-violet-500 bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-md shadow-violet-300"
                  : "border-violet-200 bg-white text-slate-700 hover:border-violet-400"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-bold text-violet-700">⚡ სირთულის დონე (1–10)</div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-xl border py-2 text-sm font-bold transition active:scale-90 ${
                level === l
                  ? "border-blue-500 bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md shadow-blue-300"
                  : "border-blue-200 bg-white text-slate-700 hover:border-blue-400"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorNote text={error} />}

      <button
        onClick={start}
        disabled={!grade || !level}
        className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        🚀 დაიწყე ვარჯიში
      </button>
    </div>
  );
}

function LoadingCircle({ percent }: { percent: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center py-10 animate-[fadeIn_0.3s_ease-out_both]">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={r}
            stroke="#ede9fe"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            stroke="url(#lg)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            style={{ transition: "stroke-dashoffset 300ms ease-out" }}
          />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-violet-700">
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-violet-700">იტვირთება...</p>
    </div>
  );
}

function QuizDone({ onAgain }: { onAgain: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center animate-[pop_0.5s_ease-out_both]">
      <div className="text-6xl">🎉</div>
      <h3 className="text-xl font-black text-slate-900">დაასრულე ვარჯიში!</h3>
      <p className="text-sm text-slate-500">კარგი მუშაობა. სცადე ხელახლა უფრო მაღალ დონეზე.</p>
      <button
        onClick={onAgain}
        className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95"
      >
        🔄 თავიდან
      </button>
    </div>
  );
}

function Quiz({
  subject,
  questions,
  onFinish,
  onExit,
}: {
  subject: "math" | "georgian";
  questions: any[];
  onFinish: () => void;
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const q = questions[idx];
  const isLast = idx >= questions.length - 1;

  function next(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    if (isLast) onFinish();
    else setIdx((i) => i + 1);
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease-out_both]" key={idx}>
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>კითხვა {idx + 1} / {questions.length}</span>
        <span className="text-violet-700">✅ {score}</span>
        <button onClick={onExit} className="text-red-500 hover:underline">
          გამოსვლა
        </button>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-500"
          style={{ width: `${((idx) / questions.length) * 100}%` }}
        />
      </div>
      {subject === "math" ? (
        <MathQuestion q={q as MathQ} onNext={next} />
      ) : (
        <GeorgianQuestion q={q as GeoQ} onNext={next} />
      )}
    </div>
  );
}

function MathQuestion({ q, onNext }: { q: MathQ; onNext: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  const correct = picked === q.correctIndex;

  return (
    <div>
      <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
        <Markdown>{q.question}</Markdown>
      </div>
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const isRight = i === q.correctIndex;
          const isPicked = picked === i;
          const state = !done
            ? "idle"
            : isPicked && isRight
              ? "correct"
              : isPicked && !isRight
                ? "wrong"
                : isRight
                  ? "reveal"
                  : "idle";
          return (
            <button
              key={i}
              disabled={done}
              onClick={() => setPicked(i)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm transition active:scale-[0.98] ${
                state === "correct"
                  ? "border-green-400 bg-green-50 text-green-800 shadow-md shadow-green-100"
                  : state === "wrong"
                    ? "border-red-400 bg-red-50 text-red-800 shadow-md shadow-red-100"
                    : state === "reveal"
                      ? "border-green-300 bg-green-50/50 text-green-700"
                      : "border-violet-200 bg-white text-slate-800 hover:border-violet-400 hover:bg-violet-50"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex-1"><Markdown>{opt}</Markdown></div>
              {state === "correct" && <span>✅</span>}
              {state === "wrong" && <span>❌</span>}
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-4 animate-[fadeUp_0.35s_ease-out_both] space-y-2">
          <div
            className={`rounded-2xl border p-3 text-sm ${
              correct
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800"
            }`}
          >
            <div className="font-bold">
              {correct ? "🎉 სწორია! ყოჩაღ!" : "❌ არასწორია"}
            </div>
            <div className="mt-1 text-slate-700">
              <Markdown>{q.explanation}</Markdown>
            </div>
            {!correct && (
              <div className="mt-2 text-xs text-slate-600">
                💪 ნუ ინერვიულებ, შემდეგზე გამოვა!
              </div>
            )}
          </div>
          <button
            onClick={() => onNext(correct)}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95"
          >
            შემდეგი →
          </button>
        </div>
      )}
    </div>
  );
}

function GeorgianQuestion({ q, onNext }: { q: GeoQ; onNext: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [wrongList, setWrongList] = useState<string[]>([]);
  const [done, setDone] = useState<null | "correct" | "revealed">(null);

  const MAX = 3;

  function normalize(s: string) {
    return s.trim().replace(/\s+/g, " ");
  }

  function check() {
    if (done) return;
    const a = normalize(answer);
    if (!a) return;
    if (a === normalize(q.correctAnswer)) {
      setDone("correct");
      return;
    }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setWrongList((w) => [...w, answer]);
    setAnswer("");
    if (nextAttempts >= MAX) setDone("revealed");
  }

  return (
    <div>
      <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-bold text-blue-600">💡 მინიშნება: {q.hint}</div>
        <div className="mt-2 whitespace-pre-wrap text-base text-slate-900">
          {q.question}
        </div>
      </div>

      <div className="mt-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!done}
          rows={3}
          placeholder="ჩაწერე გასწორებული წინადადება..."
          className="w-full rounded-2xl border border-violet-200 bg-white p-3 text-sm focus:border-violet-400 focus:outline-none disabled:bg-slate-50"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>ცდები: {attempts} / {MAX}</span>
        {!done && (
          <button
            onClick={check}
            disabled={!answer.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            შემოწმება
          </button>
        )}
      </div>

      {wrongList.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {wrongList.map((w, i) => (
            <div
              key={i}
              className="animate-[fadeUp_0.3s_ease-out_both] rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700"
            >
              ❌ „{w}" — არასწორია
            </div>
          ))}
        </div>
      )}

      {done && (
        <div
          className={`mt-3 animate-[fadeUp_0.35s_ease-out_both] rounded-2xl border p-3 text-sm ${
            done === "correct"
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-orange-300 bg-orange-50 text-orange-800"
          }`}
        >
          <div className="font-bold">
            {done === "correct" ? "🎉 სწორია! ყოჩაღ!" : "😅 ამოიწურა ცდები"}
          </div>
          <div className="mt-1 text-slate-700">
            <span className="font-bold text-green-700">სწორი პასუხი: </span>
            {q.correctAnswer}
          </div>
          <div className="mt-2 text-slate-600">
            <Markdown>{q.explanation}</Markdown>
          </div>
          <button
            onClick={() => onNext(done === "correct")}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300 transition hover:brightness-110 active:scale-95"
          >
            შემდეგი →
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Shared ---------------- */

function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:text-violet-700 prose-strong:text-blue-700 prose-p:my-2">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white/70 p-4 shadow-lg shadow-violet-100/50 backdrop-blur sm:p-5">
      {children}
    </div>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {text}
    </p>
  );
}
