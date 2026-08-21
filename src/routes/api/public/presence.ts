import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/presence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { username?: string };
        const username = String(body.username ?? "").trim().toLowerCase();
        if (!username) return json({ ok: true, blocked: false });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date().toISOString();

        await supabaseAdmin
          .from("presence")
          .upsert({ username, last_seen: now }, { onConflict: "username" });
        await supabaseAdmin
          .from("visits")
          .upsert(
            { username, day: now.slice(0, 10) },
            { onConflict: "username,day", ignoreDuplicates: true },
          );

        const { data: active } = await supabaseAdmin
          .from("strikes")
          .select("until")
          .eq("username", username)
          .gt("until", now)
          .order("until", { ascending: false })
          .limit(1)
          .maybeSingle();

        return json({ ok: true, blocked: !!active, until: active?.until ?? null });
      },
    },
  },
});
