import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/solve-math")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { imageDataUrl } = (await request.json()) as { imageDataUrl?: string };
        if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
          return new Response("Missing imageDataUrl", { status: 400 });
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
                  "შენ ხარ მათემატიკის მასწავლებელი გადაწერე AI. მოსწავლე გამოგიგზავნის ფოტოს ამოცანით. ამოიცანი და ამოხსენი ქართულად ეტაპობრივად. ყველა ფორმულა ჩაწერე LaTeX-ით ($...$ ან $$...$$). წილადი = \\frac{a}{b}, ფესვი = \\sqrt{x}, ხარისხი = x^{n}. დაასრულე ასე: `### ✨ საბოლოო პასუხი` და შემდეგ $ პასუხი $ **გამოკვეთილად**.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "ამოხსენი ეს მაგალითი ეტაპობრივად." },
                  { type: "image_url", image_url: { url: imageDataUrl } },
                ],
              },
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
        const solution = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ solution }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
