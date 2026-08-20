import { useRef, useState } from "react";
import { ShadeSlider, Wheel, hexToHsva, hsvaToHex } from "@uiw/react-color";
import { Card, ErrorNote, friendlyApiError, useT } from "@/lib/ui";
import { ProgressRing } from "@/components/EssayStudio";
import { downloadHtml, exportPptx, printPdf } from "@/lib/deckExport";


type PhotoItem = { url: string; note: string };

type Slide = {
  title: string;
  bullets: string[];
  note?: string;
  emoji?: string;
  photo?: number | null;
};

type Theme = {
  bg: string;
  accent: string;
  text: string;
  font: string;
  gradient?: string;
};

type Deck = { title: string; subtitle?: string; theme: Theme; slides: Slide[] };

const FONTS = [
  "Inter",
  "Georgia",
  "'Playfair Display', Georgia, serif",
  "'Fira Sans', sans-serif",
  "'Courier New', monospace",
  "Verdana",
];

const SLIDE_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];

export function PresentationStudio() {
  const { t, lang } = useT();
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState(6);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [asking, setAsking] = useState(false);
  const [auto, setAuto] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () =>
        setPhotos((p) => [...p, { url: String(reader.result), note: "" }]);
      reader.readAsDataURL(f);
    });
  }

  async function generate() {
    setAsking(false);
    setLoading(true);
    setError(null);
    setProgress(0);
    const iv = setInterval(
      () => setProgress((p) => (p < 94 ? p + Math.random() * 2.4 + 0.5 : p)),
      320,
    );
    try {
      const res = await fetch("/api/public/presentation-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          slides,
          lang,
          autoVisuals: auto,
          photos: photos.map((p, i) => ({ index: i, note: p.note })),
        }),
      });
      if (!res.ok) throw new Error(await friendlyApiError(res, t));
      const data = (await res.json()) as Deck;
      setProgress(100);
      await new Promise((r) => setTimeout(r, 500));
      setDeck({
        title: data.title ?? topic,
        subtitle: data.subtitle ?? "",
        theme: {
          bg: data.theme?.bg || "#ffffff",
          accent: data.theme?.accent || "#7c3aed",
          text: data.theme?.text || "#111827",
          font: data.theme?.font || "Inter",
          gradient: data.theme?.gradient,
        },
        slides: (data.slides ?? []).map((s) => ({
          title: s.title ?? "",
          bullets: Array.isArray(s.bullets) ? s.bullets : [],
          note: s.note,
          emoji: s.emoji,
          photo: typeof s.photo === "number" ? s.photo : null,
        })),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric);
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  }

  if (loading)
    return <ProgressRing percent={progress} title={t.presBuilding} steps={t.presSteps} />;

  if (deck)
    return (
      <DeckEditor
        deck={deck}
        setDeck={setDeck}
        photos={photos}
        onRestart={() => setDeck(null)}
      />
    );

  return (
    <div className="space-y-4">
      <div className="relative animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2.5rem] bg-[conic-gradient(from_0deg,rgba(167,139,250,0.28),rgba(96,165,250,0.28),rgba(244,182,255,0.28),rgba(167,139,250,0.28))] blur-2xl animate-[auraSpin_16s_linear_infinite]" />
        <Card className="relative rounded-[2rem]">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="inline-flex h-7 w-7 animate-[floaty_4s_ease-in-out_infinite] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm text-white">
              💬
            </span>
            <span className="text-xs font-bold text-violet-600">{t.presBubble}</span>
          </div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            placeholder={t.presPlaceholder}
            className="w-full resize-y rounded-[1.5rem] border border-violet-100 bg-white/70 p-3.5 text-sm outline-none transition-all duration-300 focus:border-violet-400 focus:shadow-[0_12px_34px_-18px_rgba(109,40,217,0.55)]"
          />
        </Card>
      </div>

      <Card
        className="animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
      >
        <label className="block px-1 pb-2 text-xs font-bold text-violet-600">
          {t.presSlides}
        </label>
        <div className="flex flex-wrap gap-2">
          {SLIDE_OPTIONS.map((n, i) => (
            <button
              key={n}
              type="button"
              onClick={() => setSlides(n)}
              data-on={slides === n}
              style={{ animationDelay: `${i * 40}ms` }}
              className="gw-opt animate-[pop_0.4s_ease-out_both] h-10 w-10 rounded-full text-sm font-bold"
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      <Card className="animate-[fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
        <label className="block px-1 pb-2 text-xs font-bold text-violet-600">
          {t.presPhotos}
        </label>

        <div className="space-y-3">
          {photos.map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-3 animate-[fadeUp_0.45s_ease-out_both]"
            >
              <div className="relative shrink-0">
                <img
                  src={p.url}
                  alt={`slide ${i + 1}`}
                  className="h-20 w-20 rounded-2xl object-cover shadow-[0_10px_24px_-14px_rgba(76,29,149,0.7)]"
                />
                <button
                  type="button"
                  aria-label="remove"
                  onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                  className="gw-glass absolute -right-2 -top-2 h-6 w-6 rounded-full text-[11px] font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="relative flex-1">
                <span className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 rounded-[2px] bg-white/80 border-b border-l border-violet-100" />
                <textarea
                  value={p.note}
                  onChange={(e) =>
                    setPhotos((ps) =>
                      ps.map((q, j) => (j === i ? { ...q, note: e.target.value } : q)),
                    )
                  }
                  rows={3}
                  placeholder={t.presPhotoNote}
                  className="w-full resize-y rounded-2xl border border-violet-100 bg-white/75 p-2.5 text-xs outline-none transition focus:border-violet-400"
                />
              </div>
            </div>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addPhotos(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="gw-glass mt-3 w-full rounded-2xl border-2 border-dashed border-violet-200 px-4 py-3 text-xs font-bold text-violet-600 transition hover:-translate-y-0.5"
        >
          ＋ {t.presAddPhoto}
        </button>
      </Card>

      {error && <ErrorNote text={error} />}

      <button
        type="button"
        onClick={() => setAsking(true)}
        disabled={!topic.trim()}
        data-on="true"
        className="w-full rounded-2xl px-4 py-3.5 text-sm font-black transition-transform duration-300 hover:-translate-y-0.5"
      >
        {t.presGenerate}
      </button>

      {asking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out_both]">
          <div className="gw-panel w-full max-w-sm rounded-[2rem] p-6 animate-[pop_0.45s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 animate-[floaty_4s_ease-in-out_infinite] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-lg text-white">
                🤖
              </span>
              <h4 className="text-sm font-black">{t.presAskTitle}</h4>
            </div>
            <p className="mt-3 text-sm font-semibold opacity-80">{t.presAskText}</p>

            <button
              type="button"
              onClick={() => setAuto(!auto)}
              className="gw-glass mt-4 flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-bold"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                  auto
                    ? "border-violet-500 bg-gradient-to-br from-violet-500 to-blue-500 text-white"
                    : "border-violet-200"
                }`}
              >
                {auto ? "✓" : ""}
              </span>
              {t.presAutoLabel}
            </button>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="gw-glass flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold"
              >
                {t.close}
              </button>
              <button
                type="button"
                onClick={generate}
                data-on="true"
                className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-black"
              >
                {t.presContinue} ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- editor ---------------- */

function DeckEditor({
  deck,
  setDeck,
  photos,
  onRestart,
}: {
  deck: Deck;
  setDeck: (d: Deck) => void;
  photos: PhotoItem[];
  onRestart: () => void;
}) {
  const { t } = useT();
  const [panel, setPanel] = useState(false);
  const [target, setTarget] = useState<"bg" | "accent" | "text">("bg");
  const [fmt, setFmt] = useState<"pptx" | "pdf" | "html">("pptx");
  const [busy, setBusy] = useState(false);

  const theme = deck.theme;
  const setTheme = (patch: Partial<Theme>) =>
    setDeck({ ...deck, theme: { ...theme, ...patch } });

  function updateSlide(i: number, patch: Partial<Slide>) {
    setDeck({
      ...deck,
      slides: deck.slides.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    });
  }

  async function download() {
    setBusy(true);
    try {
      if (fmt === "pptx") await exportPptx(deck, photos);
      else if (fmt === "html") downloadHtml(buildHtml(deck, photos), deck.title);
      else printPdf(buildHtml(deck, photos));
    } finally {
      setBusy(false);
    }
  }

  const current = theme[target];

  return (
    <div className="space-y-4 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-black">
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            {t.presReady}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setPanel(!panel)}
          className="gw-glass ml-auto rounded-full px-3 py-1.5 text-[11px] font-bold"
        >
          {t.presCustomize}
        </button>
      </div>

      <Card className="rounded-[1.75rem]">
        <label className="block px-1 pb-2 text-xs font-bold text-violet-600">
          {t.presFormat}
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pptx", t.fmtPptx],
              ["pdf", t.fmtPdf],
              ["html", t.fmtHtml],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFmt(k)}
              data-on={fmt === k}
              className="gw-opt rounded-full px-3.5 py-1.5 text-[11px] font-bold"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          data-on="true"
          className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-black transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {t.presDownload}
        </button>
        {fmt === "pdf" && (
          <p className="mt-2 px-1 text-[11px] font-semibold opacity-60">
            {t.presPdfHint}
          </p>
        )}
      </Card>

      <p className="text-[11px] font-semibold opacity-60">{t.presEditHint}</p>



      {panel && (
        <Card className="animate-[fadeUp_0.4s_ease-out_both]">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["bg", t.presBg],
                ["accent", t.presAccent],
                ["text", t.presTextColor],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTarget(k)}
                data-on={target === k}
                className="gw-opt inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/70"
                  style={{ background: theme[k] }}
                />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center gap-3">
            <Wheel
              color={hexToHsva(current)}
              width={190}
              height={190}
              onChange={(c) => setTheme({ [target]: hsvaToHex(c.hsva) } as Partial<Theme>)}
            />
            <ShadeSlider
              hsva={hexToHsva(current)}
              width={190}
              onChange={(s) =>
                setTheme({
                  [target]: hsvaToHex({ ...hexToHsva(current), ...s }),
                } as Partial<Theme>)
              }
            />
            <div className="flex items-center gap-2">
              <span
                className="h-7 w-7 rounded-full border border-white/70 shadow"
                style={{ background: current }}
              />
              <input
                value={current}
                onChange={(e) => setTheme({ [target]: e.target.value } as Partial<Theme>)}
                className="w-28 rounded-xl border border-violet-100 bg-white/80 px-3 py-1.5 text-center text-xs font-bold uppercase outline-none focus:border-violet-400"
              />
            </div>
          </div>

          <label className="mt-5 block px-1 pb-2 text-xs font-bold text-violet-600">
            {t.presFont}
          </label>
          <div className="flex flex-wrap gap-2">
            {FONTS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTheme({ font: f })}
                data-on={theme.font === f}
                className="gw-opt rounded-full px-3 py-1.5 text-xs font-bold"
                style={{ fontFamily: f }}
              >
                Aa
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {deck.slides.map((s, i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 70}ms` }}
            className="animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
          >
            <SlideCard
              index={i}
              slide={s}
              deck={deck}
              photos={photos}
              onChange={(patch) => updateSlide(i, patch)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="gw-glass w-full rounded-2xl px-4 py-2.5 text-xs font-bold"
      >
        {t.again}
      </button>
    </div>
  );
}

function SlideCard({
  index,
  slide,
  deck,
  photos,
  onChange,
}: {
  index: number;
  slide: Slide;
  deck: Deck;
  photos: PhotoItem[];
  onChange: (p: Partial<Slide>) => void;
}) {
  const { t } = useT();
  const th = deck.theme;
  const photo =
    typeof slide.photo === "number" ? photos[slide.photo]?.url : undefined;

  return (
    <div
      className="relative overflow-hidden rounded-[1.5rem] shadow-[0_26px_60px_-30px_rgba(30,27,75,0.75)] ring-1 ring-black/5"
      style={{
        background: th.bg,
        fontFamily: th.font,
        color: th.text,
        aspectRatio: "16 / 9",
        containerType: "inline-size",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full"
        style={{ width: "0.9cqw", background: th.gradient || th.accent }}
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: th.accent }}
      />
      <div
        className="relative flex h-full flex-col"
        style={{ padding: "4.2cqw 4.6cqw 3.4cqw 5.6cqw" }}
      >
        <div
          className="flex items-center gap-2 font-bold uppercase tracking-[0.22em] opacity-55"
          style={{ fontSize: "1.5cqw" }}
        >
          <span>
            {t.slide} {index + 1}
          </span>
          <span className="opacity-90">{slide.emoji}</span>
        </div>

        <h3
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange({ title: e.currentTarget.textContent ?? "" })}
          className="font-black leading-[1.1] tracking-tight outline-none"
          style={{ color: th.accent, fontSize: "4.4cqw", marginTop: "1cqw" }}
        />
        <span
          className="block rounded-full"
          style={{
            background: th.accent,
            opacity: 0.85,
            height: "0.45cqw",
            width: "7cqw",
            marginTop: "1.4cqw",
          }}
        />

        <div
          className={`flex min-h-0 flex-1 ${photo ? "" : "flex-col"}`}
          style={{ gap: "3cqw", marginTop: "2.4cqw" }}
        >
          <ul className="min-w-0 flex-1 overflow-hidden" style={{ display: "grid", gap: "1.6cqw", alignContent: "start" }}>
            {slide.bullets.map((b, i) => (
              <li
                key={i}
                className="flex leading-[1.35]"
                style={{ fontSize: "2.35cqw", gap: "1.4cqw" }}
              >
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    background: th.accent,
                    height: "0.8cqw",
                    width: "0.8cqw",
                    marginTop: "0.9cqw",
                  }}
                />
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange({
                      bullets: slide.bullets.map((x, j) =>
                        j === i ? (e.currentTarget.textContent ?? "") : x,
                      ),
                    })
                  }
                  className="flex-1 outline-none"
                >
                  {b}
                </span>
              </li>
            ))}
          </ul>

          {photo && (
            <img
              src={photo}
              alt=""
              className="h-full shrink-0 rounded-xl object-cover"
              style={{ width: "34%" }}
            />
          )}
        </div>
        {slide.note && (
          <p
            className="line-clamp-2 italic opacity-55"
            style={{ fontSize: "1.7cqw", marginTop: "2cqw" }}
          >
            {slide.note}
          </p>
        )}
      </div>
    </div>
  );
}

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtml(deck: Deck, photos: PhotoItem[]) {
  const th = deck.theme;
  const slides = deck.slides
    .map((s, i) => {
      const img =
        typeof s.photo === "number" && photos[s.photo]
          ? `<img src="${photos[s.photo]!.url}" alt="" />`
          : "";
      return `<section class="slide">
  <div class="bar"></div>
  <div class="inner">
    <div class="tag">${esc(s.emoji ?? "")} ${i + 1}</div>
    <h2>${esc(s.title)}</h2>
    <span class="rule"></span>
    <div class="body${img ? " split" : ""}">
      <ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      ${img}
    </div>
    ${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}
  </div>
  <div class="pg">${i + 1}</div>
</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(deck.title)}</title>
<style>
  @page { size: 297mm 167mm; margin: 0; }
  * { box-sizing: border-box; }
  body { margin:0; background:#0f172a; font-family:${th.font}; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .deck { max-width: 1120px; margin: 0 auto; padding: 28px 16px 40px; }
  .cover { background:${th.bg}; color:${th.text}; border-radius:20px; padding:70px 56px; margin-bottom:26px; position:relative; overflow:hidden; page-break-after:always; }
  .cover:before { content:""; position:absolute; left:0; top:0; bottom:0; width:10px; background:${th.gradient || th.accent}; }
  h1 { font-size:44px; margin:0 0 10px; letter-spacing:-.02em; }
  .sub { color:${th.accent}; margin:0; font-size:18px; }
  .slide { position:relative; background:${th.bg}; color:${th.text}; border-radius:20px; overflow:hidden; margin-bottom:26px; box-shadow:0 20px 50px -25px rgba(0,0,0,.8); page-break-after:always; aspect-ratio: 16/9; }
  .bar { position:absolute; left:0; top:0; bottom:0; width:10px; background:${th.gradient || th.accent}; }
  .inner { padding:40px 48px 34px 58px; }
  .tag { font-size:11px; letter-spacing:.22em; text-transform:uppercase; opacity:.55; }
  h2 { color:${th.accent}; font-size:32px; margin:6px 0 0; letter-spacing:-.02em; }
  .rule { display:block; width:52px; height:4px; border-radius:4px; background:${th.accent}; margin:12px 0 18px; }
  .body { display:flex; gap:26px; }
  .body ul { flex:1; }
  .body.split img { width:38%; align-self:stretch; }
  img { object-fit:cover; border-radius:14px; max-height:330px; }
  ul { margin:0; padding-left:20px; line-height:1.75; font-size:18px; }
  li { margin-bottom:6px; }
  li::marker { color:${th.accent}; }
  .note { font-size:13px; font-style:italic; opacity:.55; margin-top:18px; }
  .pg { position:absolute; right:26px; bottom:18px; font-size:12px; color:${th.accent}; }
  @media print { body { background:#fff; } .deck { padding:0; max-width:none; } .slide, .cover { box-shadow:none; margin:0; border-radius:0; } }
</style></head>
<body><div class="deck">
<section class="cover">
  <h1>${esc(deck.title)}</h1>
  <p class="sub">${esc(deck.subtitle ?? "")}</p>
</section>
${slides}
</div></body></html>`;
}

