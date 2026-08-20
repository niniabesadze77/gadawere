import { createFileRoute } from "@tanstack/react-router";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { DICT, type Dict, type Lang } from "@/lib/i18n";
import {
  Card,
  ErrorNote,
  LangCtx,
  Panel,
  friendlyApiError,
  useT,
} from "@/lib/ui";
import { EssayStudio } from "@/components/EssayStudio";
import { PresentationStudio } from "@/components/PresentationStudio";

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

/* ---------------- i18n context ---------------- */



/* ---------------- constants ---------------- */

type Subject = "georgian" | "math" | "physics" | "geography" | "chemistry";

const SUBJECTS: { id: Subject; emoji: string; active: boolean }[] = [
  { id: "georgian", emoji: "📖", active: true },
  { id: "math", emoji: "🧮", active: true },
  { id: "physics", emoji: "⚛️", active: false },
  { id: "geography", emoji: "🌍", active: false },
  { id: "chemistry", emoji: "🧪", active: false },
];

const WEATHERS = [
  { id: "aurora", icon: "🌌" },
  { id: "waves", icon: "🌊" },
  { id: "minimal", icon: "◻️" },
] as const;


type Weather = (typeof WEATHERS)[number]["id"];

const GEO_LETTERS = "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ".split("");
const EN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MATH_SYMBOLS = [
  "+", "−", "×", "÷", "√", "π", "∑", "∫", "∞", "≈", "≤", "≥", "Δ", "θ", "±",
  "%", "x²", "a/b", "∠", "Ω",
];

type Tool = "essay" | "presentation" | "soon";

const TOOLS: { id: Tool; emoji: string; active: boolean }[] = [
  { id: "essay", emoji: "📝", active: true },
  { id: "presentation", emoji: "🖼️", active: true },
  { id: "soon", emoji: "✨", active: false },
];

type Account = { phone: string };

/* ---------------- typing logo ---------------- */

function playKeyClick(ac: AudioContext) {
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1650 + Math.random() * 350, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.045);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

function TypedBrand({ text, onDone }: { text: string; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const acRef = useRef<AudioContext | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) acRef.current = new Ctx();
    const resume = () => void acRef.current?.resume();
    window.addEventListener("pointerdown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      void acRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (count >= text.length) {
      if (doneRef.current) return;
      doneRef.current = true;
      const id = setTimeout(onDone, 380);
      return () => clearTimeout(id);
    }
    const id = setTimeout(
      () => {
        const ac = acRef.current;
        if (ac && ac.state === "running") playKeyClick(ac);
        setCount((c) => c + 1);
      },
      count === 0 ? 320 : 95 + Math.random() * 55,
    );
    return () => clearTimeout(id);
  }, [count, text, onDone]);

  return (
    <span className="relative inline-flex items-baseline whitespace-nowrap text-3xl font-black tracking-tight sm:text-4xl">
      {/* invisible sizer keeps the box width stable so nothing shifts while typing */}
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0 flex items-baseline whitespace-nowrap bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
        {text.slice(0, count)}
        <span
          aria-hidden="true"
          className="ml-[3px] inline-block h-[1em] w-[3px] animate-[breathe_1s_ease-in-out_infinite] self-center rounded-full bg-violet-500"
        />
      </span>
    </span>
  );
}


/* ---------------- root ---------------- */


function Home() {
  const [phase, setPhase] = useState<
    "intro" | "auth" | "signing" | "ready"
  >("intro");
  const [account, setAccount] = useState<Account | null>(null);
  const [selected, setSelected] = useState<Tool | null>(null);
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<Lang>("ka");
  const [weather, setWeather] = useState<Weather>("aurora");

  const t = (DICT[lang] as unknown) as Dict;

  useEffect(() => {
    const savedTheme = localStorage.getItem("gw-theme");
    const savedLang = localStorage.getItem("gw-lang") as Lang | null;
    const savedWeather = localStorage.getItem("gw-weather") as Weather | null;
    const savedAcc = localStorage.getItem("gw-account");
    setDark(savedTheme === "dark");
    if (savedLang === "en" || savedLang === "ka") setLang(savedLang);
    if (savedAcc) {
      try {
        setAccount(JSON.parse(savedAcc) as Account);
      } catch {
        /* ignore */
      }
    }
    if (savedWeather && WEATHERS.some((w) => w.id === savedWeather)) {
      setWeather(savedWeather);
    } else {
      const pick = WEATHERS[Math.floor(Math.random() * WEATHERS.length)].id;
      setWeather(pick);
      localStorage.setItem("gw-weather", pick);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("gw-theme", dark ? "dark" : "light");
  }, [dark]);

  function advance() {
    if (phase === "intro") setPhase(account ? "ready" : "auth");
  }

  function onRegistered(acc: Account) {
    localStorage.setItem("gw-account", JSON.stringify(acc));
    setAccount(acc);
    setPhase("signing");
    setTimeout(() => setPhase("ready"), 2200);
  }

  function logout() {
    localStorage.removeItem("gw-account");
    setAccount(null);
    setSelected(null);
    setMenu(false);
    setPhase("auth");
  }

  const showMain = phase === "ready";

  return (
    <LangCtx.Provider value={{ lang, t }}>
      <div className="gw-root relative min-h-screen overflow-hidden text-slate-900">
        {/* Background layers — always behind everything */}
        <BackgroundAnim effect={weather} dim={!!selected} />
        {selected && (
          <SubjectGlyphs
            subject={selected === "presentation" ? "math" : "georgian"}
            lang={lang}
          />
        )}

        <div className="pointer-events-none fixed -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="pointer-events-none fixed -right-24 top-40 -z-10 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl" />


        {showMain && (
          <SettingsMenu
            open={menu}
            setOpen={setMenu}
            dark={dark}
            setDark={setDark}
            lang={lang}
            setLang={(l) => {
              setLang(l);
              localStorage.setItem("gw-lang", l);
            }}
            weather={weather}
            setWeather={(w) => {
              setWeather(w);
              localStorage.setItem("gw-weather", w);
            }}
          />
        )}

        {showMain && account && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="gw-glass fixed left-4 top-5 z-50 rounded-full px-3 py-1.5 text-[11px] font-bold"
          >
            ⎋ {t.logout}
          </button>
        )}

        {/* Logo */}
        <div
          className={`fixed left-1/2 z-30 -translate-x-1/2 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase === "intro"
              ? "top-1/2 -translate-y-1/2 scale-125"
              : "top-6 scale-100"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (phase === "intro") advance();
              else if (showMain) setSelected(null);
            }}
            data-plain
            className={`relative block cursor-pointer px-5 py-2 transition-all duration-700 ${
              phase === "intro"
                ? "gw-glass animate-[floaty_5s_ease-in-out_infinite] rounded-full px-10 py-8 shadow-[0_20px_60px_-20px_rgba(109,40,217,0.55)]"
                : "rounded-full bg-transparent"
            }`}
          >
            {phase === "intro" && (
              <>
                <span className="pointer-events-none absolute inset-0 animate-[ripple_3s_ease-out_infinite] rounded-full border border-violet-400/50" />
                <span
                  className="pointer-events-none absolute inset-0 animate-[ripple_3s_ease-out_infinite] rounded-full border border-blue-400/40"
                  style={{ animationDelay: "1.5s" }}
                />
              </>
            )}
            <div className="absolute inset-0 -z-10 animate-[glowPulse_5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-400 to-blue-400 opacity-40 blur-2xl" />
            {phase === "intro" ? (
              <TypedBrand text={t.brand} onDone={advance} />
            ) : (
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
                {t.brand}
              </span>
            )}

          </button>
        </div>

        {phase === "auth" && <RegisterScreen onDone={onRegistered} />}


        {phase === "signing" && <SigningLoader />}

        {showMain && (
          <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-24 md:max-w-4xl md:px-8 lg:max-w-5xl xl:max-w-6xl">
            {!selected && account && (
              <div className="mb-8 text-center">
                <h1
                  className="animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both] text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl"
                  style={{ animationDelay: "120ms" }}
                >
                  <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    {t.hello}, {account.phone}
                  </span>

                </h1>
                <a
                  href="mailto:gadatseresupport@gmail.com"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 inline-block animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both] text-xs font-semibold text-violet-600 transition hover:text-blue-600"
                  style={{ animationDelay: "320ms" }}
                >
                  {t.support}
                </a>
              </div>
            )}

            <div className="animate-[fadeUp_0.9s_cubic-bezier(0.16,1,0.3,1)_both]">
              {!selected ? (
                <ToolPicker onPick={(s) => setSelected(s)} />
              ) : (
                <ToolView tool={selected} onBack={() => setSelected(null)} />
              )}
            </div>

            {!selected && (
              <>
                <div
                  className="mt-16 animate-[fadeUp_0.9s_cubic-bezier(0.16,1,0.3,1)_both] text-center"
                  style={{ animationDelay: "700ms" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm font-bold text-violet-700">{t.followUs}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="https://www.instagram.com/gadatsere?igsh=bWs3MjU3cW40aXZ3&utm_source=qr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gw-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-500 hover:-translate-y-0.5"
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
                      className="gw-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-500 hover:-translate-y-0.5"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path
                          d="M16.5 3c.4 2.1 1.7 3.7 3.9 4.1v2.6c-1.5 0-2.9-.4-4-1.1v6.7a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a2.9 2.9 0 1 0 2.1 2.8V3h2.7z"
                          fill="currentColor"
                        />
                      </svg>
                      gadatsere
                    </a>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <InstallApp />
                </div>
              </>
            )}

            <footer className="mt-10 text-center text-xs text-slate-500">
              {t.footer}
            </footer>
          </main>
        )}

        <GlobalAnim />
      </div>
    </LangCtx.Provider>
  );
}

/* ---------------- registration ---------------- */

function RegisterScreen({ onDone }: { onDone: (a: Account) => void }) {
  const { t } = useT();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    if (!phone.trim() || !pass) {
      setError(t.fillAll);
      return;
    }
    if (phone.trim().length < 3) {
      setError(t.badPhone);
      return;
    }
    if (pass.length < 4) {
      setError(t.shortPass);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/public/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, phone: phone.trim(), pass }),
      });
      const data = (await res.json()) as { ok?: boolean; phone?: string; error?: string };
      if (!res.ok || !data.ok) {
        const map: Record<string, string> = {
          taken: t.phoneTaken,
          bad_credentials: t.wrongCreds,
          bad_phone: t.badPhone,
          short_pass: t.shortPass,
        };
        setError(map[data.error ?? ""] ?? t.connErr);
        return;
      }
      onDone({ phone: data.phone ?? phone.trim() });
    } catch {
      setError(t.connErr);
    } finally {
      setBusy(false);
    }
  }

  const field =
    "peer w-full rounded-2xl border border-white/70 bg-white/60 px-4 pb-2.5 pt-6 text-sm font-semibold outline-none backdrop-blur-md transition-all duration-300 focus:border-violet-400 focus:bg-white/85 focus:shadow-[0_10px_30px_-12px_rgba(109,40,217,0.45)]";

  const fields = [
    { v: phone, set: setPhone, ph: t.phone, type: "text", icon: "👤", d: 0 },
    { v: pass, set: setPass, ph: t.password, type: "password", icon: "🔒", d: 90 },
  ];


  return (
    <div className="relative z-20 mx-auto flex min-h-screen max-w-md items-center px-4 pb-10 pt-28">
      <div className="relative w-full animate-[sheetUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* soft aura behind the card */}
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] bg-[conic-gradient(from_0deg,rgba(167,139,250,0.35),rgba(96,165,250,0.35),rgba(244,182,255,0.35),rgba(167,139,250,0.35))] blur-3xl animate-[auraSpin_18s_linear_infinite]" />

        <div className="gw-panel relative overflow-hidden rounded-[2.25rem] p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-blue-400/25 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <div className="animate-[floaty_5s_ease-in-out_infinite] rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 px-4 py-3 text-2xl shadow-[0_16px_40px_-16px_rgba(79,70,229,0.8)]">
              ✨
            </div>
            <h2 className="mt-4 text-center text-[1.7rem] font-black leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-600 bg-clip-text text-transparent">
                {mode === "register" ? t.registerTitle : t.loginTitle}
              </span>
            </h2>
            <p className="mt-1.5 text-center text-xs font-medium opacity-70">
              {mode === "register" ? t.registerSub : t.loginSub}
            </p>

            <div className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
          </div>

          <div className="relative mt-6 space-y-3.5">
            {fields.map((f, i) => (
              <div
                key={i}
                className="relative animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: `${f.d}ms` }}
              >
                <input
                  type={f.type}
                  value={f.v}
                  onChange={(e) => f.set(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder=" "
                  className={field}
                />
                <span className="pointer-events-none absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wide text-violet-500/80">
                  {f.icon} {f.ph}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 animate-[pop_0.35s_ease-out_both] rounded-xl border border-red-300/60 bg-red-500/10 p-2.5 text-center text-xs font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={busy}
            data-on="true"
            className="mt-6 w-full rounded-2xl px-4 py-3.5 text-sm font-black tracking-wide transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? "..." : mode === "register" ? `${t.createAccount} ✨` : t.signIn}
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode((m) => (m === "register" ? "login" : "register"));
            }}
            className="mt-3 w-full bg-transparent text-center text-xs font-semibold text-violet-600 underline-offset-4 hover:underline"
          >
            {mode === "register" ? t.haveAccount : t.noAccount}
          </button>

        </div>
      </div>
    </div>

  );
}

function SigningLoader() {
  const { t } = useT();
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 animate-[fadeIn_0.4s_ease-out_both]">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-[spin_1.6s_linear_infinite] rounded-full border-4 border-violet-200 border-t-violet-600" />
        <div className="absolute inset-3 animate-[spin_2.4s_linear_infinite_reverse] rounded-full border-4 border-blue-200 border-b-blue-500" />
      </div>
      <p className="animate-[breathe_2s_ease-in-out_infinite] text-sm font-bold text-violet-600">
        {t.preparing}
      </p>
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-violet-100">
        <div className="h-full w-1/3 animate-[loadSlide_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-600 to-blue-600" />
      </div>
    </div>
  );
}

/* ---------------- settings ---------------- */

function SettingsMenu({
  open,
  setOpen,
  dark,
  setDark,
  lang,
  setLang,
  weather,
  setWeather,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  weather: Weather;
  setWeather: (w: Weather) => void;
}) {
  const { t } = useT();
  return (
    <>
      <button
        type="button"
        aria-label={t.menu}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="gw-glass fixed right-4 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-500"
      >
        <span className="relative block h-4 w-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute left-0 block h-[2px] w-5 rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={
                open
                  ? {
                      top: "7px",
                      transform:
                        i === 1 ? "scaleX(0)" : `rotate(${i === 0 ? 45 : -45}deg)`,
                      opacity: i === 1 ? 0 : 1,
                    }
                  : { top: `${i * 7}px` }
              }
            />
          ))}
        </span>
      </button>

      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
        className={`fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        onClick={(e) => e.stopPropagation()}
        className={`gw-panel fixed right-3 top-20 z-50 max-h-[75vh] w-[min(19rem,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl p-4 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-8 opacity-0"
        }`}
      >
        <p className="text-xs font-black uppercase tracking-wider text-violet-500">
          {t.languageTitle}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLang("ka")}
            data-on={lang === "ka"}
            className="gw-opt rounded-2xl px-3 py-2.5 text-sm font-bold"
          >
            🇬🇪 ქართული
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            data-on={lang === "en"}
            className="gw-opt rounded-2xl px-3 py-2.5 text-sm font-bold"
          >
            🇬🇧 English
          </button>
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-wider text-violet-500">
          {t.theme}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDark(false)}
            data-on={!dark}
            className="gw-opt rounded-2xl px-3 py-2.5 text-sm font-bold"
          >
            {t.light}
          </button>
          <button
            type="button"
            onClick={() => setDark(true)}
            data-on={dark}
            className="gw-opt rounded-2xl px-3 py-2.5 text-sm font-bold"
          >
            {t.dark}
          </button>
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-wider text-violet-500">
          {t.weatherTitle}
        </p>
        <div className="mt-2 grid gap-2">
          {WEATHERS.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWeather(w.id)}
              data-on={weather === w.id}
              style={{ animationDelay: `${i * 45}ms` }}
              className={`gw-opt flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-bold ${
                open ? "animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]" : ""
              }`}
            >
              <span className="text-lg">{w.icon}</span>
              {t.weathers[w.id]}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

/* ---------------- background ---------------- */

function BackgroundAnim({ effect, dim }: { effect: Weather; dim: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const wrap = `pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-[opacity,filter] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
    dim ? "opacity-50 blur-[10px]" : "opacity-100"
  }`;

  return (
    <div className={wrap}>
      {/* soft, minimal wash — two slow, very subtle tints */}
      {effect !== "minimal" && (
        <>
          <span
            className="absolute -left-[15%] -top-[18%] h-[62vmax] w-[62vmax] rounded-full opacity-40 blur-[120px]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(167,139,250,0.35), rgba(167,139,250,0) 70%)",
              animation: "auroraDrift 42s ease-in-out infinite",
            }}
          />
          <span
            className="absolute -right-[18%] bottom-[-20%] h-[58vmax] w-[58vmax] rounded-full opacity-35 blur-[130px]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(96,165,250,0.32), rgba(96,165,250,0) 70%)",
              animation: "auroraDrift 54s ease-in-out infinite reverse",
            }}
          />
        </>
      )}

      {effect === "waves" && (
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(99,102,241,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.10) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.6),transparent_65%)]" />


      <style>{`
        @keyframes auroraDrift {
          0%   { transform: translate3d(0,0,0) scale(1); }
          33%  { transform: translate3d(6vw,4vh,0) scale(1.08); }
          66%  { transform: translate3d(-4vw,-3vh,0) scale(0.96); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes waveSlide {
          from { transform: translateX(0); }
          to   { transform: translateX(-1440px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="auroraDrift"], [style*="waveSlide"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}


function SubjectGlyphs({ subject, lang }: { subject: Subject; lang: Lang }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pool =
    subject === "math"
      ? MATH_SYMBOLS
      : lang === "en"
        ? EN_LETTERS
        : GEO_LETTERS;

  const items = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        i,
        glyph: pool[Math.floor(Math.random() * pool.length)],
        left: 6 + Math.random() * 80,
        top: 8 + Math.random() * 76,
        delay: (i * 1.5) % 12,
        dur: 8 + Math.random() * 5,
        size: 70 + Math.random() * 110,
      })),
    [subject, lang],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {items.map((it) => (
        <span
          key={it.i}
          className="absolute font-black text-violet-500/25"
          style={{
            left: `${it.left}%`,
            top: `${it.top}%`,
            fontSize: `${it.size}px`,
            animation: `glyphPulse ${it.dur}s ${it.delay}s ease-in-out infinite`,
          }}
        >
          {it.glyph}
        </span>
      ))}
      <style>{`
        @keyframes glyphPulse {
          0% { opacity: 0; transform: scale(.55); filter: blur(2px); }
          35% { opacity: .55; transform: scale(1); filter: blur(0); }
          65% { opacity: .5; transform: scale(1.12); }
          100% { opacity: 0; transform: scale(1.4); filter: blur(3px); }
        }
      `}</style>
    </div>
  );
}

function GlobalAnim() {
  return (
    <style>{`
      @keyframes fadeUp { from { opacity: 0; transform: translate3d(0,16px,0); } to { opacity: 1; transform: translate3d(0,0,0); } }
      @keyframes fadeIn { from {opacity:0} to {opacity:1} }
      @keyframes pop { 0% { transform: scale(0.92); opacity: 0; } 60% { transform: scale(1.03); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes shine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      @keyframes breathe { 0%, 100% { opacity: .55; transform: scale(.99); } 50% { opacity: 1; transform: scale(1.01); } }
      @keyframes glowPulse { 0%, 100% { opacity: .28; transform: scale(1); } 50% { opacity: .5; transform: scale(1.08); } }
      @keyframes sheetUp { from { opacity: 0; transform: translate3d(0,44px,0) scale(.97); } to { opacity: 1; transform: translate3d(0,0,0) scale(1); } }
      @keyframes loadSlide { 0% { transform: translateX(-110%);} 100% { transform: translateX(320%);} }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes ripple { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(1.55); opacity: 0; } }
      @keyframes auraSpin { to { transform: rotate(360deg); } }

    `}</style>
  );
}

/* ---------------- PWA install ---------------- */

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function InstallApp() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"android" | "ios">("android");
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);
    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) setTab("ios");
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") return;
      return;
    }
    setOpen(true);
  }

  return (
    <div
      className="mt-8 animate-[fadeUp_0.9s_cubic-bezier(0.16,1,0.3,1)_both] text-center"
      style={{ animationDelay: "850ms" }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="gw-glass group inline-flex items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
      >
        <img
          src="/pwa-icon-512.png"
          alt=""
          width={26}
          height={26}
          className="h-[26px] w-[26px] rounded-lg opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
        <span>{t.install}</span>
        <span className="text-xs opacity-60 transition-transform duration-500 group-hover:translate-x-0.5">
          ↓
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 p-3 backdrop-blur-sm animate-[fadeIn_0.35s_ease-out_both] sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="gw-panel w-full max-w-md animate-[sheetUp_0.55s_cubic-bezier(0.16,1,0.3,1)_both] rounded-3xl p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <img
                src="/pwa-icon-512.png"
                alt="app icon"
                width={48}
                height={48}
                loading="lazy"
                className="h-12 w-12 rounded-xl shadow-md"
              />
              <div>
                <p className="text-base font-black">{t.install}</p>
                <p className="text-xs opacity-60">{t.installSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="gw-glass ml-auto flex h-8 w-8 items-center justify-center rounded-full text-sm"
                aria-label={t.close}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-full p-1">
              {(["android", "ios"] as const).map((tb) => (
                <button
                  key={tb}
                  type="button"
                  onClick={() => setTab(tb)}
                  data-on={tab === tb}
                  className="gw-opt rounded-full px-3 py-2 text-sm font-bold"
                >
                  {tb === "android" ? "🤖 Android" : "🍎 iPhone / iPad"}
                </button>
              ))}
            </div>

            <ol key={tab} className="mt-4 space-y-2">
              {(tab === "android" ? t.androidSteps : t.iosSteps).map((step, i) => (
                <li
                  key={i}
                  style={{ animationDelay: `${i * 110}ms` }}
                  className="gw-glass flex animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both] items-start gap-3 rounded-2xl p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-xs font-black text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- tools ---------------- */

function ToolPicker({ onPick }: { onPick: (s: Tool) => void }) {
  const { t } = useT();
  return (
    <div>
      <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
        {t.toolsA}{" "}
        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {t.toolsB}
        </span>
      </h2>
      <p className="mt-2 text-center text-sm text-slate-500">{t.toolsHint}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TOOLS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            disabled={!s.active}
            onClick={() => s.active && onPick(s.id)}
            style={{ animationDelay: `${i * 90}ms` }}
            className={`gw-glass group relative overflow-hidden rounded-3xl p-5 text-left transition-all duration-500 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both] ${
              s.active ? "hover:-translate-y-1" : "cursor-not-allowed opacity-60"
            }`}
          >
            <div className="relative">
              <div className="text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                {s.emoji}
              </div>
              <div className="mt-3 text-lg font-black">{t.tools[s.id].label}</div>
              <div className="mt-1 text-xs opacity-70">{t.tools[s.id].desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolView({ tool, onBack }: { tool: Tool; onBack: () => void }) {
  const { t } = useT();
  return (
    <div className="animate-[sheetUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
      <button
        type="button"
        onClick={onBack}
        className="gw-glass mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
      >
        {t.backToTools}
      </button>
      <h2 className="mb-4 text-2xl font-black">
        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {tool === "essay" ? t.essayStudio : t.presStudio}
        </span>
      </h2>
      <Panel>
        <div key={tool} className="animate-[fadeIn_0.45s_ease-out_both]">
          {tool === "essay" && <EssayStudio />}
          {tool === "presentation" && <PresentationStudio />}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- subjects ---------------- */

function SubjectPicker({ onPick }: { onPick: (s: Subject) => void }) {
  const { t } = useT();
  return (
    <div>
      <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
        {t.chooseA}{" "}
        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {t.chooseB}
        </span>
      </h2>
      <p className="mt-2 text-center text-sm text-slate-500">{t.tapBubble}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SUBJECTS.map((s, i) => (
          <button
            key={s.id}
            disabled={!s.active}
            onClick={() => s.active && onPick(s.id)}
            style={{ animationDelay: `${i * 90}ms` }}
            className={`gw-glass group relative overflow-hidden rounded-3xl p-5 text-left transition-all duration-500 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both] ${
              s.active ? "hover:-translate-y-1" : "cursor-not-allowed opacity-60"
            }`}
          >
            <div className="relative">
              <div className="text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                {s.emoji}
              </div>
              <div className="mt-3 text-lg font-black">{t.subjects[s.id].label}</div>
              <div className="mt-1 text-xs opacity-70">{t.subjects[s.id].desc}</div>
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
  const { t } = useT();
  return (
    <div className="animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
      <button
        onClick={onBack}
        className="gw-glass mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
      >
        {t.backToSubjects}
      </button>
      <h2 className="mb-4 text-2xl font-black">
        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {t.subjects[subject].label}
        </span>
      </h2>

      {subject === "georgian" && <GeorgianHub />}
      {subject === "math" && <MathHub />}
    </div>
  );
}

/* ---------------- Language subject ---------------- */

function GeorgianHub() {
  const { t } = useT();
  const [mode, setMode] = useState<"essay" | "checker" | "practice">("essay");
  return (
    <Panel>
      <div className="flex gap-1.5 rounded-2xl border border-violet-100/60 p-1">
        <SegBtn active={mode === "essay"} onClick={() => setMode("essay")}>
          {t.tabEssay}
        </SegBtn>
        <SegBtn active={mode === "checker"} onClick={() => setMode("checker")}>
          {t.tabChecker}
        </SegBtn>
        <SegBtn active={mode === "practice"} onClick={() => setMode("practice")}>
          {t.tabPractice}
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
  const { t, lang } = useT();
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
      const res = await fetch("/api/public/essay-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, words, lang }),
      });
      if (!res.ok) throw new Error(await friendlyApiError(res, t));
      const data = (await res.json()) as { essay: string };
      setProgress(100);
      await new Promise((r) => setTimeout(r, 350));
      setEssay(data.essay);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric);
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease-out_both] space-y-4">
      <Card>
        <label className="block px-1 pb-2 text-xs font-bold text-violet-600">
          {t.wordCount}
        </label>
        <div className="flex flex-wrap gap-2">
          {WORD_OPTIONS.map((w, i) => (
            <button
              key={w}
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

      <Card>
        <label className="block px-1 pb-2 text-xs font-bold text-violet-600">
          {t.topic}
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder={t.essayPlaceholder}
          className="w-full resize-y rounded-2xl border border-violet-100 bg-white/70 p-3 text-sm outline-none focus:border-violet-400"
        />
        <button
          onClick={submit}
          disabled={loading || !prompt.trim()}
          data-on="true"
          className="mt-3 w-full rounded-2xl px-4 py-2.5 text-sm font-bold"
        >
          {loading ? t.writing : t.writeEssay}
        </button>
      </Card>

      {error && <ErrorNote text={error} />}

      {loading && (
        <Card>
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-violet-600">
            <span>{t.writingEssay}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 via-blue-500 to-violet-600 bg-[length:200%_100%] animate-[shine_2s_linear_infinite] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>
      )}

      {essay && (
        <Card className="animate-[fadeUp_0.5s_ease-out_both]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                📝
              </span>
              {t.yourEssay}
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(essay)}
              className="gw-glass rounded-full px-2.5 py-1 text-[11px] font-semibold"
            >
              {t.copy}
            </button>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            <ReactMarkdown>{essay}</ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}

function GeorgianChecker() {
  const { t, lang } = useT();
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
      const res = await fetch("/api/public/improve-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (!res.ok) throw new Error(await friendlyApiError(res, t));
      const data = (await res.json()) as { improved: string };
      setResult(data.improved);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease-out_both]">
      <Card>
        <label className="block px-1 pb-1 text-xs font-semibold text-violet-600">
          {t.yourText}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={t.textPlaceholder}
          className="w-full resize-y rounded-2xl border border-violet-100 bg-white/70 p-3 text-sm outline-none focus:border-violet-400"
        />
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          data-on="true"
          className="mt-2 w-full rounded-2xl px-4 py-2.5 text-sm font-bold"
        >
          {loading ? t.checking : t.check}
        </button>
      </Card>

      {error && <ErrorNote text={error} />}

      {loading && (
        <div className="mt-4 flex justify-start">
          <div className="gw-glass flex gap-1 rounded-2xl px-3 py-2.5">
            <Dot /> <Dot delay={150} /> <Dot delay={300} />
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <Card className="animate-[fadeUp_0.4s_ease-out_both]">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                ✍️
              </span>
              {t.correctedText}
            </div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {parsed.corrected || "—"}
            </div>
          </Card>
          {parsed.notes && (
            <Card className="animate-[fadeUp_0.5s_ease-out_both]">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-blue-600">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                  📌
                </span>
                {t.notes}
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{parsed.notes}</ReactMarkdown>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function splitCorrected(md: string): { corrected: string; notes: string } {
  if (!md) return { corrected: "", notes: "" };
  const correctedMatch =
    md.match(/###\s*გასწორებული ტექსტი\s*\n([\s\S]*?)(?=\n###|$)/) ||
    md.match(/###\s*Corrected text\s*\n([\s\S]*?)(?=\n###|$)/i);
  const notesMatch =
    md.match(/###\s*აღმოჩენილი შეცდომები\s*\n([\s\S]*)/) ||
    md.match(/###\s*Mistakes found\s*\n([\s\S]*)/i);
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
  const { t } = useT();
  const [mode, setMode] = useState<"chat" | "calc" | "photo" | "practice">("chat");
  return (
    <Panel>
      <div className="flex gap-1.5 rounded-2xl border border-violet-100/60 p-1">
        <SegBtn active={mode === "chat"} onClick={() => setMode("chat")}>
          {t.tabAI}
        </SegBtn>
        <SegBtn active={mode === "calc"} onClick={() => setMode("calc")}>
          {t.tabCalc}
        </SegBtn>
        <SegBtn active={mode === "photo"} onClick={() => setMode("photo")}>
          {t.tabPhoto}
        </SegBtn>
        <SegBtn active={mode === "practice"} onClick={() => setMode("practice")}>
          🏋️
        </SegBtn>
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
      data-on={active}
      className="gw-opt flex-1 rounded-xl px-2 py-2 text-xs font-bold"
    >
      {children}
    </button>
  );
}

type Msg = { role: "user" | "assistant"; content: string };

function MathChat() {
  const { t, lang } = useT();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gw-mathchat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved) as Msg[]);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, loading]);

  function persist(next: Msg[]) {
    localStorage.setItem("gw-mathchat", JSON.stringify(next));
  }

  async function send() {
    const q = input.trim();
    if (!q) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    persist(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/math-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      if (!res.ok) throw new Error(await friendlyApiError(res, t));
      const data = (await res.json()) as { reply: string };
      const after: Msg[] = [...next, { role: "assistant", content: data.reply }];
      setMessages(after);
      persist(after);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        ref={scrollRef}
        className="max-h-80 min-h-40 space-y-3 overflow-y-auto rounded-2xl border border-violet-100/60 p-3"
      >
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm opacity-60">{t.chatEmpty}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex animate-[fadeUp_0.3s_ease-out_both] ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === "user"
                  ? "rounded-br-md bg-gradient-to-br from-violet-600 to-blue-600 text-white"
                  : "gw-glass rounded-bl-md"
              }`}
            >
              {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="gw-glass flex gap-1 rounded-2xl px-3 py-2.5">
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
          placeholder={t.chatPlaceholder}
          className="flex-1 rounded-2xl border border-violet-200 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-violet-400"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          data-on="true"
          className="rounded-2xl px-4 py-2.5 text-sm font-bold"
        >
          ➤
        </button>
      </div>

      {messages.length > 0 && (
        <button
          onClick={() => {
            setMessages([]);
            localStorage.removeItem("gw-mathchat");
          }}
          className="gw-glass mt-2 rounded-full px-3 py-1 text-[11px] font-semibold"
        >
          {t.clearChat}
        </button>
      )}
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
  const { t } = useT();
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
      const r = Function(`"use strict"; return (${sanitized})`)();
      setResult(String(r));
    } catch {
      setResult(t.errorGeneric);
    }
  }

  const keys: { label: string; onClick: () => void; wide?: boolean }[] = [
    { label: "C", onClick: clear },
    { label: "(", onClick: () => press("(") },
    { label: ")", onClick: () => press(")") },
    { label: "⌫", onClick: back },
    { label: "7", onClick: () => press("7") },
    { label: "8", onClick: () => press("8") },
    { label: "9", onClick: () => press("9") },
    { label: "÷", onClick: () => press("÷") },
    { label: "4", onClick: () => press("4") },
    { label: "5", onClick: () => press("5") },
    { label: "6", onClick: () => press("6") },
    { label: "×", onClick: () => press("×") },
    { label: "1", onClick: () => press("1") },
    { label: "2", onClick: () => press("2") },
    { label: "3", onClick: () => press("3") },
    { label: "−", onClick: () => press("−") },
    { label: "0", onClick: () => press("0") },
    { label: ".", onClick: () => press(".") },
    { label: "π", onClick: () => press("π") },
    { label: "+", onClick: () => press("+") },
    { label: "√", onClick: () => press("√(") },
    { label: "^", onClick: () => press("^") },
    { label: "=", onClick: equals, wide: true },
  ];

  return (
    <div>
      <Card>
        <div className="min-h-6 break-all text-right text-sm opacity-60">
          {expr || "0"}
        </div>
        <div className="mt-1 break-all text-right text-2xl font-black text-violet-600">
          {result || " "}
        </div>
      </Card>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {keys.map((k, i) => (
          <button
            key={i}
            onClick={k.onClick}
            data-on={k.wide ? true : undefined}
            className={`rounded-2xl p-3 text-lg font-bold ${k.wide ? "col-span-2" : ""}`}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MathPhoto() {
  const { t, lang } = useT();
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
      const res = await fetch("/api/public/solve-math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: preview, lang }),
      });
      if (!res.ok) throw new Error(await friendlyApiError(res, t));
      const data = (await res.json()) as { solution: string };
      setSolution(data.solution);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="gw-glass flex w-full flex-col items-center justify-center gap-2 rounded-3xl px-4 py-8 text-center"
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="problem"
              className="max-h-64 rounded-2xl object-contain shadow-md"
            />
            {solution && <Sparkles />}
          </div>
        ) : (
          <>
            <span className="text-5xl">📷</span>
            <span className="text-sm font-bold">{t.photoHint}</span>
            <span className="text-xs opacity-60">{t.fileTypes}</span>
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
        data-on="true"
        className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-bold"
      >
        {loading ? t.solving : t.solve}
      </button>

      {error && <ErrorNote text={error} />}

      {solution && (
        <div className="mt-4 animate-[fadeUp_0.5s_ease-out_both]">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-600">
            <span className="inline-flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
              ✨
            </span>
            {t.aiAnswer}
          </div>
          <Card>
            <Markdown>{solution}</Markdown>
          </Card>
        </div>
      )}
    </div>
  );
}

function Sparkles() {
  const [items] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      top: Math.random() * 90,
      left: Math.random() * 90,
      delay: i * 0.15,
      size: 10 + Math.random() * 12,
    })),
  );
  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((s, i) => (
        <span
          key={i}
          className="absolute text-yellow-400"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animation: `sparkle 1.6s ${s.delay}s infinite`,
            fontSize: `${s.size}px`,
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
  const { t, lang } = useT();
  const [grade, setGrade] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [state, setState] = useState<"setup" | "loading" | "quiz" | "done">("setup");
  const [questions, setQuestions] = useState<(MathQ | GeoQ)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function start() {
    if (!grade || !level) return;
    setState("loading");
    setError(null);
    setProgress(0);
    const iv = setInterval(
      () => setProgress((p) => (p < 92 ? p + Math.random() * 6 : p)),
      200,
    );
    try {
      const res = await fetch("/api/public/practice-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, level, lang }),
      });
      if (!res.ok) throw new Error(await friendlyApiError(res, t));
      const data = (await res.json()) as { questions: (MathQ | GeoQ)[] };
      const qs = (data.questions || []).slice(0, 10);
      if (qs.length === 0) throw new Error(t.genFail);
      setQuestions(qs);
      setProgress(100);
      setTimeout(() => setState("quiz"), 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric);
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
  if (state === "done") return <QuizDone onAgain={reset} />;

  return (
    <div className="animate-[fadeUp_0.4s_ease-out_both] space-y-4">
      <div>
        <div className="mb-2 text-xs font-bold text-violet-600">{t.grade}</div>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              data-on={grade === g}
              className="gw-opt rounded-xl py-2 text-sm font-bold"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-bold text-violet-600">{t.level}</div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              data-on={level === l}
              className="gw-opt rounded-xl py-2 text-sm font-bold"
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
        data-on="true"
        className="w-full rounded-2xl px-4 py-3 text-sm font-bold"
      >
        {t.startPractice}
      </button>
    </div>
  );
}

function LoadingCircle({ percent }: { percent: number }) {
  const { t } = useT();
  const r = 46;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center py-10 animate-[fadeIn_0.3s_ease-out_both]">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} stroke="#ede9fe" strokeWidth="10" fill="none" />
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
          <span className="text-lg font-black text-violet-600">
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-violet-600">{t.loading}</p>
    </div>
  );
}

function QuizDone({ onAgain }: { onAgain: () => void }) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center animate-[pop_0.5s_ease-out_both]">
      <div className="text-6xl">🎉</div>
      <h3 className="text-xl font-black">{t.finished}</h3>
      <p className="text-sm opacity-70">{t.goodWork}</p>
      <button onClick={onAgain} data-on="true" className="rounded-2xl px-6 py-2.5 text-sm font-bold">
        {t.again}
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
  questions: (MathQ | GeoQ)[];
  onFinish: () => void;
  onExit: () => void;
}) {
  const { t } = useT();
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
      <div className="mb-3 flex items-center justify-between text-xs font-bold opacity-70">
        <span>
          {t.question} {idx + 1} / {questions.length}
        </span>
        <span className="text-violet-600">✅ {score}</span>
        <button onClick={onExit} className="gw-glass rounded-full px-2.5 py-1 text-[11px]">
          {t.exit}
        </button>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-500"
          style={{ width: `${(idx / questions.length) * 100}%` }}
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
  const { t } = useT();
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  const correct = picked === q.correctIndex;

  return (
    <div>
      <Card>
        <Markdown>{q.question}</Markdown>
      </Card>
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
              data-state={state}
              className="gw-answer flex w-full items-center gap-3 rounded-2xl p-3 text-left text-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-black">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex-1">
                <Markdown>{opt}</Markdown>
              </div>
              {state === "correct" && <span>✅</span>}
              {state === "wrong" && <span>❌</span>}
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-4 animate-[fadeUp_0.35s_ease-out_both] space-y-2">
          <div className={`gw-note ${correct ? "gw-note-ok" : "gw-note-bad"}`}>
            <div className="font-bold">{correct ? t.correctYes : t.correctNo}</div>
            <div className="mt-1">
              <Markdown>{q.explanation}</Markdown>
            </div>
            {!correct && <div className="mt-2 text-xs opacity-80">{t.dontWorry}</div>}
          </div>
          <button
            onClick={() => onNext(correct)}
            data-on="true"
            className="w-full rounded-2xl px-4 py-2.5 text-sm font-bold"
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  );
}

function GeorgianQuestion({ q, onNext }: { q: GeoQ; onNext: (correct: boolean) => void }) {
  const { t } = useT();
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
      <Card>
        <div className="text-xs font-bold text-blue-500">
          {t.hintLabel} {q.hint}
        </div>
        <div className="mt-2 whitespace-pre-wrap text-base">{q.question}</div>
      </Card>

      <div className="mt-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!done}
          rows={3}
          placeholder={t.answerPlaceholder}
          className="w-full rounded-2xl border border-violet-200 bg-white/70 p-3 text-sm outline-none focus:border-violet-400"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs opacity-70">
        <span>
          {t.attempts}: {attempts} / {MAX}
        </span>
        {!done && (
          <button
            onClick={check}
            disabled={!answer.trim()}
            data-on="true"
            className="rounded-xl px-4 py-2 text-xs font-bold"
          >
            {t.checkBtn}
          </button>
        )}
      </div>

      {wrongList.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {wrongList.map((w, i) => (
            <div
              key={i}
              className="gw-note gw-note-bad animate-[fadeUp_0.3s_ease-out_both] text-xs"
            >
              ❌ „{w}" {t.wrongSuffix}
            </div>
          ))}
        </div>
      )}

      {done && (
        <div
          className={`gw-note mt-3 animate-[fadeUp_0.35s_ease-out_both] ${
            done === "correct" ? "gw-note-ok" : "gw-note-warn"
          }`}
        >
          <div className="font-bold">
            {done === "correct" ? t.correctYes : t.outOfAttempts}
          </div>
          <div className="mt-1">
            <span className="font-bold">{t.correctAnswer}</span>
            {q.correctAnswer}
          </div>
          <div className="mt-2">
            <Markdown>{q.explanation}</Markdown>
          </div>
          <button
            onClick={() => onNext(done === "correct")}
            data-on="true"
            className="mt-3 w-full rounded-2xl px-4 py-2.5 text-sm font-bold"
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Shared ---------------- */

function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-p:my-2">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

