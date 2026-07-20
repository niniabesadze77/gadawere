import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "gadawere. – სასკოლო AI ასისტენტი" },
      {
        name: "description",
        content:
          "სასკოლო AI ასისტენტი ქართულ ენაზე – ქართული, მათემატიკა, ფიზიკა, ქიმია, გეოგრაფია.",
      },
      { property: "og:title", content: "gadawere. – სასკოლო AI ასისტენტი" },
      {
        property: "og:description",
        content: "სწავლა მარტივია, როცა გაქვს AI.",
      },
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
  { id: "georgian", label: "ქართული", emoji: "📖", active: true, desc: "ტექსტის შემოწმება" },
  { id: "math", label: "მათემატიკა", emoji: "🧮", active: true, desc: "AI + კალკულატორი + ფოტო" },
  { id: "physics", label: "ფიზიკა", emoji: "⚛️", active: false, desc: "მალე" },
  { id: "geography", label: "გეოგრაფია", emoji: "🌍", active: false, desc: "მალე" },
  { id: "chemistry", label: "ქიმია", emoji: "🧪", active: false, desc: "მალე" },
];

function Home() {
  const [phase, setPhase] = useState<"intro" | "ready">("intro");
  const [selected, setSelected] = useState<Subject | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-violet-50 to-blue-50 text-slate-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-200/40 blur-3xl" />

      {/* Logo */}
      <div
        className={`fixed left-1/2 z-30 -translate-x-1/2 transition-all duration-[900ms] ease-[cubic-bezier(0.6,-0.05,0.2,1.2)] ${
          phase === "intro"
            ? "top-1/2 -translate-y-1/2 scale-150"
            : "top-6 scale-100"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-r from-violet-400 to-blue-400 opacity-40 blur-2xl" />
          <div className="rounded-full border border-violet-200 bg-white/80 px-5 py-2 shadow-lg shadow-violet-200/50 backdrop-blur">
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              gadawere.
            </span>
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-28">
        {/* Ready content – fade in after intro */}
        <div
          className={`transition-all duration-700 ${
            phase === "ready" ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {!selected ? (
            <SubjectPicker onPick={(s) => setSelected(s)} />
          ) : (
            <SubjectView subject={selected} onBack={() => setSelected(null)} />
          )}
        </div>

        <footer
          className={`mt-16 text-center text-xs text-slate-500 transition-opacity duration-700 ${
            phase === "ready" ? "opacity-100" : "opacity-0"
          }`}
        >
          © gadawere. · სასკოლო AI ასისტენტი
        </footer>
      </main>
    </div>
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
              <div className="mt-3 text-lg font-black text-slate-900">
                {s.label}
              </div>
              <div className="mt-1 text-xs text-slate-500">{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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

      {subject === "georgian" && <GeorgianChecker />}
      {subject === "math" && <MathHub />}
    </div>
  );
}

/* ---------------- Georgian ---------------- */

function GeorgianChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <Panel>
      {/* User bubble input */}
      <div className="flex justify-end">
        <div className="max-w-full flex-1 rounded-3xl rounded-br-md border border-violet-200 bg-gradient-to-br from-violet-100 to-blue-50 p-3 shadow-sm">
          <label className="block px-1 pb-1 text-xs font-semibold text-violet-700">
            📝 ჩააკოპირე შენი ტექსტი
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="დაწერე ან ჩააკოპირე ტექსტი აქ..."
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

      {/* AI bubble */}
      {result && (
        <div className="mt-4 flex justify-start animate-[fadeUp_0.4s_ease-out_both]">
          <div className="flex-1 rounded-3xl rounded-bl-md border border-violet-200 bg-white p-4 shadow-md shadow-violet-100">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                ✨
              </span>
              gadawere AI
            </div>
            <div className="prose prose-sm max-w-none prose-headings:text-violet-700 prose-strong:text-blue-700">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ---------------- Math ---------------- */

function MathHub() {
  const [mode, setMode] = useState<"chat" | "calc" | "photo">("chat");
  return (
    <Panel>
      <div className="flex gap-1.5 rounded-2xl border border-violet-100 bg-violet-50/60 p-1">
        <SegBtn active={mode === "chat"} onClick={() => setMode("chat")}>
          💬 Gemini AI
        </SegBtn>
        <SegBtn active={mode === "calc"} onClick={() => setMode("calc")}>
          🔢 კალკ.
        </SegBtn>
        <SegBtn active={mode === "photo"} onClick={() => setMode("photo")}>
          📸 ფოტო
        </SegBtn>
      </div>
      <div className="mt-4">
        {mode === "chat" && <MathChat />}
        {mode === "calc" && <MathCalculator />}
        {mode === "photo" && <MathPhoto />}
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
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "rounded-br-md bg-gradient-to-br from-violet-600 to-blue-600 text-white"
                  : "rounded-bl-md border border-violet-100 bg-white text-slate-800"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
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
      if (!/^[-+*/().\d\s\w]+$/.test(sanitized.replaceAll("Math.PI", "").replaceAll("Math.sqrt", ""))) {
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
            Gemini AI პასუხი
          </div>
          <div className="prose prose-sm max-w-none rounded-2xl border border-violet-200 bg-white p-4 shadow-md shadow-violet-100 prose-headings:text-violet-700 prose-strong:text-blue-700">
            <ReactMarkdown>{solution}</ReactMarkdown>
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

/* ---------------- Shared ---------------- */

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
