import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Body = {
  username?: string;
  action?: "list" | "add" | "delete";
  id?: string;
  weekday?: number;
  start_time?: string;
  subject?: string;
  note?: string;
};

export const Route = createFileRoute("/api/public/schedule")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const username = String(body.username ?? "").trim().toLowerCase();
        if (!username) return json({ ok: false, items: [] }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const action = body.action ?? "list";

        if (action === "add" && body.subject) {
          await supabaseAdmin.from("schedule").insert({
            username,
            weekday: Math.max(0, Math.min(6, Number(body.weekday ?? 1))),
            start_time: String(body.start_time ?? "09:00").slice(0, 5),
            subject: String(body.subject).slice(0, 60),
            note: String(body.note ?? "").slice(0, 120),
          });
        }

        if (action === "delete" && body.id) {
          await supabaseAdmin
            .from("schedule")
            .delete()
            .eq("username", username)
            .eq("id", body.id);
        }

        const { data } = await supabaseAdmin
          .from("schedule")
          .select("id, weekday, start_time, subject, note")
          .eq("username", username)
          .order("weekday", { ascending: true })
          .order("start_time", { ascending: true });

        return json({ ok: true, items: data ?? [] });
      },
    },
  },
});
