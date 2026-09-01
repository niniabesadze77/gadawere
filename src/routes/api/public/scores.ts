import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Body = {
  username?: string;
  action?: "add" | "board";
  subject?: string;
  correct?: number;
  total?: number;
};

export const Route = createFileRoute("/api/public/scores")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const username = String(body.username ?? "").trim().toLowerCase();
        const action = body.action ?? "board";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "add" && username) {
          await supabaseAdmin.from("scores").insert({
            username,
            subject: String(body.subject ?? "general").slice(0, 40),
            correct: Math.max(0, Math.min(100, Number(body.correct ?? 0))),
            total: Math.max(0, Math.min(100, Number(body.total ?? 0))),
          });
        }

        const { data } = await supabaseAdmin
          .from("scores")
          .select("username, correct, total")
          .order("created_at", { ascending: false })
          .limit(2000);

        const agg = new Map<string, { username: string; correct: number; total: number }>();
        for (const row of data ?? []) {
          const cur = agg.get(row.username) ?? { username: row.username, correct: 0, total: 0 };
          cur.correct += row.correct;
          cur.total += row.total;
          agg.set(row.username, cur);
        }
        const board = [...agg.values()]
          .sort((a, b) => b.correct - a.correct || a.total - b.total)
          .slice(0, 50);

        const meIndex = board.findIndex((r) => r.username === username);

        return json({ ok: true, board, rank: meIndex >= 0 ? meIndex + 1 : null });
      },
    },
  },
});
