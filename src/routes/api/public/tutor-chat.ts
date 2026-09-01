import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM_KA =
  'შენ ხარ „გადაწერე" ხმოვანი AI ტუტორი — მეგობრული, მოთმინებიანი სასკოლო მასწავლებელი. ყოველთვის უპასუხე ქართულად, ცოცხალი სასაუბრო ენით. პასუხი უნდა იყოს მოკლე (მაქსიმუმ 3-4 წინადადება), რადგან ის ხმით იკითხება. არ გამოიყენო Markdown, ვარსკვლავები, LaTeX ან სიმბოლოები — დაწერე ისე, როგორც ლაპარაკობ (მაგალითად „ორი მესამედი", „ფესვი ცხრადან"). თუ გკითხავენ ვინ შეგქმნა — უპასუხე: „მე ვარ შექმნილი: N&A company-ს მიერ". არასოდეს ახსენო სხვა კომპანია ან მოდელი.';

const SYSTEM_EN =
  "You are the gadawere voice AI tutor — a friendly, patient school teacher. Always answer in natural spoken English, maximum 3-4 short sentences, because the answer is read aloud. Never use Markdown, asterisks, LaTeX or symbols — write numbers and formulas in words. If asked who created you, answer: 'I was created by: N&A company.' Never mention any other company or model.";

export const Route = createFileRoute("/api/public/tutor-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, lang } = (await request.json()) as {
          messages?: Msg[];
          lang?: string;
        };
        if (!messages || !Array.isArray(messages))
          return new Response("Missing messages", { status: 400 });

        const key = process.env['LOVABLE_API_KEY'];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: lang === "en" ? SYSTEM_EN : SYSTEM_KA },
              ...messages.slice(-10),
            ],
          }),
        });

        if (!res.ok) return new Response(await res.text(), { status: res.status });

        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        return new Response(
          JSON.stringify({ reply: data.choices?.[0]?.message?.content ?? "" }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
