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

const LangCtx = createContext<{ lang: Lang; t: Dict }>({
  lang: "ka",
  t: DICT.ka as unknown as Dict,
});
const useT = () => useContext(LangCtx);

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
  { id: "snow", icon: "❄️" },
  { id: "rain", icon: "🌧️" },
  { id: "sun", icon: "☀️" },
  { id: "cherry", icon: "🌸" },
  { id: "bubbles", icon: "🫧" },
] as const;

type Weather = (typeof WEATHERS)[number]["id"];

const GEO_LETTERS = "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ".split("");
const EN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MATH_SYMBOLS = [
  "+", "−", "×", "÷", "√", "π", "∑", "∫", "∞", "≈", "≤", "≥", "Δ", "θ", "±",
  "%", "x²", "a/b", "∠", "Ω",
];

type Account = { name: string; surname: string; phone: string; pass: string };

/* ---------------- root ---------------- */

function Home() {
  const [phase, setPhase] = useState<
    "intro" | "auth" | "signing" | "ready"
  >("intro");
  const [account, setAccount] = useState<Account | null>(null);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<Lang>("ka");
  const [weather, setWeather] = useState<Weather>("snow");

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
        {selected && <SubjectGlyphs subject={selected} lang={lang} />}

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
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              {t.brand}
            </span>
          </button>
        </div>

        {/* Intro hint */}
        {phase === "intro" && (
          <div className="fixed inset-x-0 bottom-16 z-20 text-center">
            <p className="animate-[breathe_2.6s_ease-in-out_infinite] text-sm font-semibold text-violet-600">
              {t.tapToStart}
            </p>
          </div>
        )}


        {phase === "auth" && (
          <div onClick={(e) => e.stopPropagation()}>
            <RegisterScreen onDone={onRegistered} />
          </div>
        )}

        {phase === "signing" && <SigningLoader />}

        {showMain && (
          <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-24">
            {!selected && account && (
              <div className="mb-8 text-center">
                <h1
                  className="animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both] text-2xl font-black uppercase tracking-tight sm:text-3xl"
                  style={{ animationDelay: "120ms" }}
                >
                  <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    {t.hello}, {account.name}
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
                <SubjectPicker onPick={(s) => setSelected(s)} />
              ) : (
                <SubjectView subject={selected} onBack={() => setSelected(null)} />
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
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!name.trim() || !surname.trim() || !phone.trim() || !pass) {
      setError(t.fillAll);
      return;
    }
    if (phone.replace(/\D/g, "").length < 6) {
      setError(t.badPhone);
      return;
    }
    if (pass.length < 4) {
      setError(t.shortPass);
      return;
    }
    onDone({
      name: name.trim(),
      surname: surname.trim(),
      phone: phone.trim(),
      pass,
    });
  }

  const field =
    "w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-400";

  return (
    <div className="relative z-20 mx-auto flex min-h-screen max-w-md items-center px-4 pb-10 pt-28">
      <div className="gw-panel w-full animate-[sheetUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both] rounded-[2rem] p-6">
        <h2 className="text-center text-2xl font-black">
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            {t.registerTitle}
          </span>
        </h2>
        <p className="mt-1 text-center text-xs opacity-70">{t.registerSub}</p>

        <div className="mt-6 space-y-3">
          {[
            { v: name, set: setName, ph: t.name, type: "text", d: 0 },
            { v: surname, set: setSurname, ph: t.surname, type: "text", d: 80 },
            { v: phone, set: setPhone, ph: t.phone, type: "tel", d: 160 },
            { v: pass, set: setPass, ph: t.password, type: "password", d: 240 },
          ].map((f, i) => (
            <input
              key={i}
              type={f.type}
              value={f.v}
              onChange={(e) => f.set(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={f.ph}
              style={{ animationDelay: `${f.d}ms` }}
              className={`${field} animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]`}
            />
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-300/60 bg-red-500/10 p-2.5 text-center text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          data-on="true"
          className="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-black"
        >
          {t.createAccount} ✨
        </button>
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

  const particles = useMemo(() => {
    const count =
      effect === "rain" ? 70 : effect === "snow" ? 50 : effect === "cherry" ? 26 : 22;
    return Array.from({ length: count }, (_, i) => ({
      i,
      left: Math.random() * 100,
      delay: Math.random() * 9,
      duration:
        effect === "rain"
          ? 0.6 + Math.random() * 0.7
          : effect === "cherry"
            ? 9 + Math.random() * 9
            : effect === "bubbles"
              ? 9 + Math.random() * 10
              : 7 + Math.random() * 9,
      size:
        effect === "snow"
          ? 6 + Math.random() * 10
          : effect === "cherry"
            ? 9 + Math.random() * 9
            : effect === "bubbles"
              ? 14 + Math.random() * 42
              : 1 + Math.random(),
      drift: (Math.random() - 0.5) * 160,
      spin: 240 + Math.random() * 480,
    }));
  }, [effect]);

  const sunDust = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        dur: 9 + Math.random() * 8,
        delay: Math.random() * 6,
      })),
    [effect],
  );

  if (!mounted) return null;

  const wrap = `pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-all duration-700 ${
    dim ? "opacity-45 blur-[6px]" : "opacity-100"
  }`;

  if (effect === "sun") {
    return (
      <div className={wrap}>
        {/* warm side wash */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,236,170,0.55),rgba(255,246,214,0.22)_35%,transparent_65%)] animate-[sunWash_14s_ease-in-out_infinite]" />
        {/* light source off-screen left */}
        <div className="absolute -left-40 top-[12%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,242,190,0.95),rgba(255,221,120,0.35)_45%,transparent_72%)] animate-[sunPulse_9s_ease-in-out_infinite]" />
        {/* sweeping beams from the side */}
        <div className="absolute -left-32 top-[10%] h-[10rem] w-[10rem]">
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              className="absolute left-0 top-1/2 block origin-left rounded-full"
              style={{
                width: "190vw",
                height: `${16 + (i % 3) * 22}px`,
                background:
                  "linear-gradient(90deg, rgba(255,240,180,0.55), rgba(255,236,160,0.18) 45%, transparent 80%)",
                filter: "blur(10px)",
                transform: `rotate(${8 + i * 5.5}deg)`,
                animation: `beamSweep ${11 + i * 1.3}s ${i * 0.6}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        {sunDust.map((d, i) => (
          <span
            key={`d${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-yellow-200/80"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              animation: `dustFloat ${d.dur}s ${d.delay}s ease-in-out infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes sunPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
          @keyframes sunWash { 0%,100%{opacity:.55} 50%{opacity:.9} }
          @keyframes beamSweep {
            0%,100% { opacity:.25; transform: rotate(var(--r,10deg)) translateY(0) scaleY(.9); }
            50% { opacity:.8; transform: rotate(calc(var(--r,10deg) + 4deg)) translateY(26px) scaleY(1.15); }
          }
          @keyframes dustFloat { 0%,100%{transform:translate(0,0);opacity:.2} 50%{transform:translate(22px,-30px);opacity:.85} }
        `}</style>
      </div>
    );
  }

  const isRain = effect === "rain";
  const glyph = effect === "snow" ? "❄" : effect === "cherry" ? "🌸" : "";

  return (
    <div className={wrap}>
      {particles.map((p) => (
        <span
          key={p.i}
          className={
            isRain
              ? "absolute rounded-full bg-gradient-to-b from-sky-400/70 to-sky-300/0"
              : effect === "bubbles"
                ? "absolute rounded-full"
                : "absolute select-none"
          }
          style={{
            left: `${p.left}%`,
            top: effect === "bubbles" ? "105%" : "-10%",
            width: isRain ? "1.6px" : effect === "bubbles" ? `${p.size}px` : undefined,
            height: isRain
              ? `${16 + p.size * 8}px`
              : effect === "bubbles"
                ? `${p.size}px`
                : undefined,
            fontSize:
              effect === "snow" || effect === "cherry" ? `${p.size}px` : undefined,
            color: effect === "snow" ? "rgba(148,163,255,0.8)" : undefined,
            background:
              effect === "bubbles"
                ? "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(186,230,253,0.45) 42%, rgba(129,180,255,0.18) 72%, rgba(255,255,255,0.05) 100%)"
                : undefined,
            boxShadow:
              effect === "bubbles"
                ? "inset 0 0 12px rgba(255,255,255,0.85), 0 4px 14px rgba(59,130,246,0.18)"
                : undefined,
            border: effect === "bubbles" ? "1px solid rgba(255,255,255,0.7)" : undefined,
            animation: `${
              isRain
                ? "rainFall"
                : effect === "bubbles"
                  ? "bubbleRise"
                  : effect === "cherry"
                    ? "petalFall"
                    : "flakeFall"
            } ${p.duration}s ${p.delay}s ${isRain ? "linear" : "cubic-bezier(0.4,0,0.6,1)"} infinite`,
            ["--drift" as never]: `${p.drift}px`,
            ["--spin" as never]: `${p.spin}deg`,
          }}
        >
          {glyph || null}
        </span>
      ))}
      <style>{`
        @keyframes rainFall {
          0% { transform: translate3d(0,-12vh,0); opacity: 0; }
          8% { opacity: .9; }
          100% { transform: translate3d(-6vw,115vh,0); opacity: 0; }
        }
        @keyframes flakeFall {
          0% { transform: translate3d(0,-10vh,0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translate3d(calc(var(--drift) * .6), 55vh, 0) rotate(calc(var(--spin) * .5)); }
          100% { transform: translate3d(var(--drift),115vh,0) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes petalFall {
          0% { transform: translate3d(0,-10vh,0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 1; }
          35% { transform: translate3d(calc(var(--drift) * .5), 32vh, 0) rotate(120deg) scale(.9); }
          65% { transform: translate3d(calc(var(--drift) * -.4), 66vh, 0) rotate(240deg) scale(1.05); }
          100% { transform: translate3d(var(--drift),115vh,0) rotate(var(--spin)) scale(.95); opacity: 0; }
        }
        @keyframes bubbleRise {
          0% { transform: translate3d(0,0,0) scale(.7); opacity: 0; }
          12% { opacity: .95; }
          50% { transform: translate3d(calc(var(--drift) * .5),-60vh,0) scale(1.05); }
          85% { opacity: .8; }
          100% { transform: translate3d(var(--drift),-125vh,0) scale(1.15); opacity: 0; }
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

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="gw-panel rounded-3xl p-4 sm:p-5">{children}</div>;
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`gw-card rounded-3xl p-4 ${className}`}>{children}</div>;
}

async function friendlyApiError(res: Response, t: { errorGeneric: string; errorBusy: string; errorLimit: string }) {
  let raw = "";
  try {
    raw = await res.text();
  } catch {
    raw = "";
  }
  if (res.status === 429) return t.errorBusy;
  if (res.status === 402 || /not enough credits|payment_required|limit/i.test(raw)) return t.errorLimit;
  return t.errorGeneric;
}

function ErrorNote({ text }: { text: string }) {
  return <p className="gw-note gw-note-bad mt-3 text-sm">{text}</p>;
}
