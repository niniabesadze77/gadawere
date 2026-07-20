import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "gadawere. – სასკოლო AI ასისტენტი" },
      {
        name: "description",
        content:
          "სასკოლო AI ასისტენტი ქართულ ენაზე. გააუმჯობესე ესეს ტექსტი და ამოხსენი მათემატიკის ამოცანები ფოტოდან.",
      },
      { property: "og:title", content: "gadawere. – სასკოლო AI ასისტენტი" },
      {
        property: "og:description",
        content:
          "სწავლა მარტივია, როცა გაქვს AI. ესეს რედაქტორი და მათემატიკის ამოხსნა ფოტოდან.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Tab = "essay" | "math";

function Home() {
  const [tab, setTab] = useState<Tab>("essay");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
            <span className="text-lg font-black tracking-tight text-white">
              gadawere.
            </span>
            <span className="text-fuchsia-300">Multi-AI Powered ⚡</span>
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            სასკოლო AI ასისტენტი
          </h1>
          <p className="mt-4 text-lg font-semibold text-fuchsia-200">
            სწავლა მარტივია, როცა გაქვს AI.
          </p>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            გააუმჯობესე ესეს ტექსტი ან გადაუღე ფოტო მათემატიკის მაგალითს და
            მიიღე ზუსტი ამოხსნა.
          </p>
        </header>

        <div className="mt-8 flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur">
          <TabButton active={tab === "essay"} onClick={() => setTab("essay")}>
            ✍️ ესეს რედაქტორი
          </TabButton>
          <TabButton active={tab === "math"} onClick={() => setTab("math")}>
            📸 მათემატიკის ამოხსნა
          </TabButton>
        </div>

        <div className="mt-6">
          {tab === "essay" ? <EssayEditor /> : <MathSolver />}
        </div>

        <footer className="mt-12 text-center text-xs text-slate-400">
          © gadawere. · სასკოლო AI ასისტენტი
        </footer>
      </div>
    </div>
  );
}

function TabButton({
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
      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/20"
          : "text-slate-300 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
      {children}
    </div>
  );
}

function EssayEditor() {
  const [text, setText] = useState("");
  const [improved, setImproved] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setImproved("");
    try {
      const res = await fetch("/api/improve-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `შეცდომა (${res.status})`);
      }
      const data = (await res.json()) as { improved: string };
      setImproved(data.improved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "დაფიქსირდა შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <label className="block text-sm font-semibold text-slate-200">
        ჩასვი შენი ესე ან ტექსტი
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="დაიწყე წერა აქ..."
        className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={loading || !text.trim()}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "მუშავდება..." : "✨ ტექსტის გაუმჯობესება"}
      </button>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {improved && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-fuchsia-200">
            გაუმჯობესებული ვერსია:
          </p>
          <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-fuchsia-400/20 bg-slate-950/50 p-4 text-sm leading-relaxed text-slate-100">
            {improved}
          </div>
        </div>
      )}
    </Card>
  );
}

function MathSolver() {
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
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `შეცდომა (${res.status})`);
      }
      const data = (await res.json()) as { solution: string };
      setSolution(data.solution);
    } catch (e) {
      setError(e instanceof Error ? e.message : "დაფიქსირდა შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <label className="block text-sm font-semibold text-slate-200">
        ატვირთე ან გადაუღე ფოტო ამოცანას
      </label>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 px-4 py-8 text-center transition hover:border-fuchsia-400/60 hover:bg-slate-950/60"
      >
        {preview ? (
          <img
            src={preview}
            alt="Selected math problem"
            className="max-h-64 rounded-xl object-contain"
          />
        ) : (
          <>
            <span className="text-4xl">📷</span>
            <span className="text-sm font-semibold text-slate-200">
              დააჭირე ფოტოს ასარჩევად ან გადასაღებლად
            </span>
            <span className="text-xs text-slate-400">PNG, JPG, WEBP</span>
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
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "ვხსნი..." : "🧮 ამოხსენი მაგალითი"}
      </button>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {solution && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-fuchsia-200">
            💡 ეტაპობრივი ამოხსნა:
          </p>
          <div className="prose prose-invert prose-sm mt-2 max-w-none rounded-2xl border border-fuchsia-400/20 bg-slate-950/50 p-4 text-slate-100">
            <ReactMarkdown>{solution}</ReactMarkdown>
          </div>
        </div>
      )}
    </Card>
  );
}
