import { createFileRoute } from "@tanstack/react-router";

const BAD_WORDS = [
  // ka
  "ყლე",
  "მუტელ",
  "ძუკნ",
  "ბოზ",
  "შეშ",
  "ქინძ",
  "გეი",
  "დედაშენ",
  "დედაშ",
  "მამაშენ",
  "ჩემი ყლე",
  "მუძლ",
  "კუტ",
  "ჯიგრ",
  "ვირიშვილ",
  "მაწუწნ",
  "გავეშ",
  "ტრაკ",
  // en
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "dick",
  "whore",
  "slut",
  "bastard",
  "nigger",
  "faggot",
  "retard",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function findBadWord(text: string) {
  const t = text.toLowerCase();
  return BAD_WORDS.find((w) => t.includes(w)) ?? null;
}

export const Route = createFileRoute("/api/public/moderate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { username?: string; text?: string };
        const username = String(body.username ?? "").trim().toLowerCase();
        const text = String(body.text ?? "");
        if (!username) return json({ ok: true, blocked: false });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // existing active strike?
        const { data: active } = await supabaseAdmin
          .from("strikes")
          .select("until")
          .eq("username", username)
          .gt("until", new Date().toISOString())
          .order("until", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (active) return json({ ok: false, blocked: true, until: active.until });

        const word = text ? findBadWord(text) : null;
        if (!word) return json({ ok: true, blocked: false });

        const until = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        await supabaseAdmin.from("flags").insert({ username, text: text.slice(0, 500), word });
        await supabaseAdmin.from("strikes").insert({ username, until, reason: "bad_language" });

        return json({ ok: false, blocked: true, until, flagged: true });
      },
    },
  },
});
