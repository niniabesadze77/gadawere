import { createFileRoute } from "@tanstack/react-router";

type Body = {
  prompt: string;
  words: number;
};

export const Route = createFileRoute("/api/essay-generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt, words } = (await request.json()) as Body;
        if (!prompt || typeof prompt !== "string" || !words) {
          return new Response("Missing fields", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const system = `შენ ხარ ქართული ენის გამოცდილი მწერალი და ესეისტი. დაწერე ესსე ქართულ ენაზე მოცემულ თემაზე. მოთხოვნები:
- სიგრძე: დაახლოებით ${words} სიტყვა (მიახლოვება ±10%).
- უშეცდომო ქართული, სწორი გრამატიკა, პუნქტუაცია და ორთოგრაფია.
- ლოგიკური სტრუქტურა: შესავალი, ძირითადი ნაწილი (რამდენიმე აბზაცი), დასკვნა.
- ცოცხალი, ბუნებრივი ენა, არა ხელოვნური.
- დააბრუნე მხოლოდ ესსეს ტექსტი, სათაურით ზემოთ (# სათაური). არაფერი დამატებითი კომენტარი.`;

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
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!res.ok) {
          return new Response(await res.text(), { status: res.status });
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const essay = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ essay }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
