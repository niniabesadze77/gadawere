import { useEffect, useRef, useState } from "react";
import { Card, useT } from "@/lib/ui";

type Msg = { role: "user" | "assistant"; content: string };

type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognition(lang: string): SR | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => SR }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => SR }).webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = false;
  rec.interimResults = false;
  return rec;
}

export default function VoiceTutor() {
  const { t, lang } = useT();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [typed, setTyped] = useState("");
  const recRef = useRef<SR | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const locale = lang === "en" ? "en-US" : "ka-GE";

  useEffect(() => {
    setSupported(!!getRecognition(locale));
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [locale]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  function speak(text: string) {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = locale;
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      synth.speak(u);
    } catch {
      /* ignore */
    }
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: clean }];
    setMsgs(next);
    setTyped("");
    setBusy(true);
    try {
      const res = await fetch("/api/public/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      if (!res.ok) throw new Error("bad");
      const data = (await res.json()) as { reply?: string };
      const reply = data.reply ?? "";
      setMsgs([...next, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      setMsgs([...next, { role: "assistant", content: t.errorGeneric }]);
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecognition(locale);
    if (!rec) return setSupported(false);
    recRef.current = rec;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      void send(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    window.speechSynthesis?.cancel();
    setListening(true);
    rec.start();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm opacity-70">{t.tutorHint}</p>

      <Card className="max-h-[52vh] min-h-[180px] space-y-3 overflow-y-auto">
        {msgs.length === 0 && <p className="text-sm opacity-55">{t.tutorEmpty}</p>}
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`animate-[fadeUp_0.45s_cubic-bezier(0.16,1,0.3,1)_both] ${
              m.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block max-w-[85%] rounded-3xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                  : "gw-glass"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {busy && <p className="text-sm opacity-60">…</p>}
        <div ref={endRef} />
      </Card>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleMic}
          disabled={busy || !supported}
          className={`relative h-20 w-20 rounded-full text-3xl transition-all duration-500 disabled:opacity-50 ${
            listening ? "scale-110" : ""
          }`}
        >
          {listening && (
            <span className="pointer-events-none absolute inset-0 animate-[ripple_1.6s_ease-out_infinite] rounded-full border-2 border-violet-400/60" />
          )}
          🎙️
        </button>
        {speaking && (
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis?.cancel();
              setSpeaking(false);
            }}
            className="gw-glass rounded-full px-3 py-2 text-xs font-bold"
          >
            ⏹ {t.tutorStop}
          </button>
        )}
      </div>
      <p className="text-center text-xs opacity-60">
        {listening ? t.tutorListening : supported ? t.tutorTap : t.tutorNoMic}
      </p>

      <div className="flex gap-2">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void send(typed)}
          placeholder={t.tutorType}
          className="gw-input flex-1 rounded-2xl px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          disabled={busy || !typed.trim()}
          onClick={() => void send(typed)}
          className="gw-btn rounded-2xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
