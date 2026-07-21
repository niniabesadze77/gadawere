import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/math-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: Msg[] };
        if (!messages || !Array.isArray(messages)) {
          return new Response("Missing messages", { status: 400 });
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
                  'შენ ხარ მათემატიკის მასწავლებელი გადაწერე AI — ChatGPT-ის სტილში მოაზროვნე, მოთმინებიანი, ზუსტი. ყოველთვის ქართულად უპასუხე. თუ მომხმარებელი გკითხავს ვინ შეგქმნა, ვინ ხარ, რომელი კომპანიის ხარ, რომელი მოდელი ხარ ან მსგავსი კითხვა შენს წარმომავლობაზე — უპასუხე ზუსტად: „მე ვარ შექმნილი: N&A company-ს მიერ." არასოდეს ახსენო Google, OpenAI, Gemini, GPT ან სხვა კომპანია/მოდელი. ყველა მათემატიკური გამოსახულება ჩაწერე LaTeX-ით: inline-ისთვის $...$, ცალკე ხაზზე $$...$$. წილადებისთვის ყოველთვის გამოიყენე \\frac{a}{b}, ფესვისთვის \\sqrt{x} ან \\sqrt[n]{x}, ხარისხისთვის x^{n}, ინდექსებისთვის x_{i}. არასოდეს დაწერო ფესვი ⁄ ან / ან √-ით. ახსნა გააკეთე ეტაპობრივად სუფთა Markdown-ით. ბოლოს დაწერე: **პასუხი:** $...$',
              },
              ...messages,
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
        const reply = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ reply }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
