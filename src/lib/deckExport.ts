export type ExportSlide = {
  title: string;
  bullets: string[];
  note?: string;
  emoji?: string;
  photo?: number | null;
};

export type ExportTheme = {
  bg: string;
  accent: string;
  text: string;
  font: string;
  gradient?: string;
};

export type ExportDeck = {
  title: string;
  subtitle?: string;
  theme: ExportTheme;
  slides: ExportSlide[];
};

export type ExportPhoto = { url: string; note: string };

export function safeFileName(name: string) {
  return (name || "presentation").replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "presentation";
}

function hex(c: string, fallback: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec((c || "").trim());
  return m ? m[1].toUpperCase() : fallback;
}

function pptFont(font: string) {
  const f = (font || "").replace(/['"]/g, "");
  if (/playfair/i.test(f)) return "Georgia";
  if (/fira/i.test(f)) return "Arial";
  if (/courier/i.test(f)) return "Courier New";
  if (/georgia|verdana/i.test(f)) return f;
  return "Calibri";
}

/** Real PowerPoint (.pptx) export — 16:9 keynote-style layout. */
export async function exportPptx(deck: ExportDeck, photos: ExportPhoto[]) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "gadawere.";
  pptx.title = deck.title;

  const bg = hex(deck.theme.bg, "FFFFFF");
  const accent = hex(deck.theme.accent, "7C3AED");
  const text = hex(deck.theme.text, "111827");
  const face = pptFont(deck.theme.font);

  // Cover slide
  const cover = pptx.addSlide();
  cover.background = { color: bg };
  cover.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.28,
    h: 5.63,
    fill: { color: accent },
  });
  cover.addText(deck.title || "", {
    x: 0.9,
    y: 1.75,
    w: 8.4,
    h: 1.3,
    fontSize: 40,
    bold: true,
    color: text,
    fontFace: face,
  });
  if (deck.subtitle)
    cover.addText(deck.subtitle, {
      x: 0.95,
      y: 3.0,
      w: 8.4,
      h: 0.6,
      fontSize: 18,
      color: accent,
      fontFace: face,
    });
  cover.addText("gadawere.", {
    x: 0.95,
    y: 4.75,
    w: 4,
    h: 0.4,
    fontSize: 11,
    color: accent,
    fontFace: face,
  });

  deck.slides.forEach((s, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: bg };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.12,
      fill: { color: accent },
    });
    slide.addText(`${s.emoji ? s.emoji + "  " : ""}${s.title ?? ""}`, {
      x: 0.6,
      y: 0.5,
      w: 8.8,
      h: 0.9,
      fontSize: 28,
      bold: true,
      color: accent,
      fontFace: face,
    });

    const photoUrl =
      typeof s.photo === "number" && photos[s.photo] ? photos[s.photo].url : null;
    const textW = photoUrl ? 5.0 : 8.8;

    const bullets = (s.bullets ?? []).filter(Boolean);
    if (bullets.length)
      slide.addText(
        bullets.map((b) => ({
          text: b,
          options: { bullet: { code: "25CF" }, breakLine: true },
        })),
        {
          x: 0.7,
          y: 1.65,
          w: textW,
          h: 3.0,
          fontSize: 16,
          color: text,
          fontFace: face,
          lineSpacingMultiple: 1.4,
          valign: "top",
        },
      );

    if (photoUrl)
      slide.addImage({
        data: photoUrl,
        x: 6.0,
        y: 1.6,
        w: 3.4,
        h: 2.6,
        sizing: { type: "cover", w: 3.4, h: 2.6 },
      });

    slide.addText(`${i + 1}`, {
      x: 9.1,
      y: 5.0,
      w: 0.6,
      h: 0.3,
      fontSize: 10,
      color: accent,
      align: "right",
      fontFace: face,
    });

    if (s.note) slide.addNotes(s.note);
  });

  await pptx.writeFile({ fileName: `${safeFileName(deck.title)}.pptx` });
}

export function downloadHtml(html: string, title: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${safeFileName(title)}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** PDF via the browser print dialog (Save as PDF) on a print-ready deck page. */
export function printPdf(html: string) {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
  return true;
}
