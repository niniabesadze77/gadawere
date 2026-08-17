import { createFileRoute } from "@tanstack/react-router";

type Photo = { index: number; note: string };

type Body = {
  topic: string;
  slides: number;
  lang?: string;
  autoVisuals?: boolean;
  photos?: Photo[];
};

export const Route = createFileRoute("/api/public/presentation-generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const topic = (body.topic ?? "").trim();
        const count = Math.min(Math.max(Number(body.slides) || 5, 1), 10);
        const photos = Array.isArray(body.photos) ? body.photos : [];
        const langEn = body.lang === "en";

        if (!topic) return new Response("Missing topic", { status: 400 });

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const language = langEn ? "English" : "Georgian (ქართული)";

        const photoLines = photos.length
          ? photos
              .map(
                (p) =>
                  `- photo #${p.index + 1}: ${p.note?.trim() || "(no note — decide yourself what this slide says)"}`,
              )
              .join("\n")
          : "(the user uploaded no photos)";

        const system = `You are a world-class presentation designer and copywriter.
Write ALL user-visible text in ${language}, flawless grammar, professional and engaging.
If asked who created you, answer: "I was created by: N&A company."

Return ONLY valid JSON (no markdown fences, no commentary) with this exact shape:
{
  "title": "deck title",
  "subtitle": "one short line",
  "theme": {
    "bg": "#hex background",
    "accent": "#hex accent",
    "text": "#hex readable text colour on bg",
    "font": "one of: Inter, Georgia, 'Playfair Display', 'Fira Sans', 'Courier New', Verdana",
    "gradient": "a css linear-gradient() string used as slide background decoration"
  },
  "slides": [
    {
      "title": "slide title",
      "bullets": ["3 to 5 short, punchy points"],
      "note": "one sentence of speaker notes",
      "emoji": "single decorative emoji",
      "photo": null
    }
  ]
}

Rules:
- Exactly ${count} slides. First slide is a title/intro slide, last slide is a conclusion.
- "photo" is the zero-based index of an uploaded photo that belongs to that slide, or null.
- Uploaded photos MUST each be used on exactly one slide, and that slide's text must match the user's note for the photo.
- Pick a beautiful, harmonious colour theme with strong contrast${body.autoVisuals ? " — the user allowed you to choose all visuals, be creative and elegant" : " — keep it clean and neutral"}.`;

        const user = `Topic: ${topic}
Slides requested: ${count}
Uploaded photos and their notes:
${photoLines}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          }),
        });

        if (!res.ok) return new Response(await res.text(), { status: res.status });

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        let raw = data.choices?.[0]?.message?.content ?? "";
        raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start >= 0 && end > start) raw = raw.slice(start, end + 1);

        try {
          const deck = JSON.parse(raw);
          return new Response(JSON.stringify(deck), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response("Bad AI response", { status: 502 });
        }
      },
    },
  },
});
