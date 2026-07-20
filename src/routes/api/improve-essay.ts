import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/improve-essay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text } = (await request.json()) as { text?: string };
        if (!text || typeof text !== "string") {
          return new Response("Missing text", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5.5",
            messages: [
              {
                role: "system",
                content:
                  "შენ ხარ ქართული ენის მკაცრი რედაქტორი. მომხმარებელი მოგცემს ტექსტს ქართულად. შენი ამოცანა: 1) დაასწორე გრამატიკული და ორთოგრაფიული შეცდომები. 2) დასვი სწორად მძიმეები, წერტილები და სხვა სასვენი ნიშნები. 3) დააბრუნე პასუხი ზუსტად ამ Markdown ფორმატით (სხვა არაფერი): \n\n### გასწორებული ტექსტი\n<აქ ჩასვი მთელი გასწორებული ტექსტი>\n\n### აღმოჩენილი შეცდომები\n- **„არასწორი“ → „სწორი“** — მოკლე ახსნა რატომ\n- ... (თითო ბულეტი თითო შეცდომაზე)\n\nთუ შეცდომა არ არის, დაწერე: „შეცდომები ვერ ვიპოვე ✨“",
              },
              { role: "user", content: text },
            ],
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          return new Response(errText, { status: res.status });
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const improved = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ improved }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
