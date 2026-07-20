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
                  "შენ ხარ ქართული ენის რედაქტორი. მომხმარებელი მოგცემს ესეს ან ტექსტს ქართულად. გააუმჯობესე მისი სტილი, გრამატიკა, სიცხადე და თანმიმდევრულობა. შეინარჩუნე ავტორის აზრი და ტონი. დააბრუნე მხოლოდ გაუმჯობესებული ტექსტი Markdown-ის გარეშე, დამატებითი კომენტარების გარეშე.",
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
