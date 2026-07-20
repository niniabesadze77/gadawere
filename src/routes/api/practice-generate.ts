import { createFileRoute } from "@tanstack/react-router";

type Body = {
  subject: "math" | "georgian";
  grade: number;
  level: number;
};

export const Route = createFileRoute("/api/practice-generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { subject, grade, level } = (await request.json()) as Body;
        if (!subject || !grade || !level) {
          return new Response("Missing fields", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const seed = Math.random().toString(36).slice(2, 10);

        const system =
          subject === "math"
            ? `შენ ხარ მათემატიკის ტესტების გენერატორი. მოამზადე ზუსტად 10 კითხვა ${grade}-ე კლასის მოსწავლისთვის, სირთულის დონე ${level}/10. ყოველი კითხვისთვის მიეცი 4 ვარიანტი (ერთი სწორი). ფორმულები ჩაწერე LaTeX-ით ($...$). დააბრუნე მკაცრი JSON ფორმატით:
{"questions":[{"id":1,"question":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"რატომ არის სწორი"}, ...]}
კითხვები უნდა იყოს მრავალფეროვანი და უნიკალური (seed: ${seed}). არაფერი დაწერო JSON-ის გარეთ.`
            : `შენ ხარ ქართული ენის მასწავლებელი. მოამზადე ზუსტად 10 გრამატიკული სავარჯიშო წინადადება ${grade}-ე კლასის მოსწავლისთვის, სირთულის დონე ${level}/10. თითოეულ წინადადებაში იყოს შეცდომა: ან გამოტოვებული მძიმე/წერტილი, ან არასწორად დაწერილი სიტყვა. მოსწავლემ უნდა ჩაწეროს გასწორებული ვერსია. დააბრუნე მკაცრი JSON:
{"questions":[{"id":1,"question":"შეცდომიანი წინადადება","correctAnswer":"სწორი წინადადება","hint":"რას ეძებ (მაგ: მძიმე, წერტილი, ორთოგრაფია)","explanation":"რატომ არის ეს სწორი"}, ...]}
წინადადებები უნიკალური და მრავალფეროვანი (seed: ${seed}). არაფერი დაწერო JSON-ის გარეთ.`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5.5",
            messages: [
              { role: "system", content: system },
              { role: "user", content: "დააგენერირე ტესტი JSON-ით." },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          return new Response(await res.text(), { status: res.status });
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const raw = data.choices?.[0]?.message?.content ?? "{}";
        return new Response(raw, {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
