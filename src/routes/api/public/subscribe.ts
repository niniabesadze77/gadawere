import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Body = { username?: string; action?: "status" | "request"; plan?: "basic" | "premium" };

export const Route = createFileRoute("/api/public/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const username = String(body.username ?? "").trim().toLowerCase();
        if (!username) return json({ ok: false }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date().toISOString();

        if (body.action === "request") {
          const plan = body.plan === "premium" ? "premium" : "basic";
          const code = `GW-${username.slice(0, 6).toUpperCase()}-${Math.floor(
            1000 + Math.random() * 9000,
          )}`;
          const { data: pending } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("username", username)
            .eq("status", "pending")
            .maybeSingle();

          if (pending) {
            await supabaseAdmin
              .from("subscriptions")
              .update({ plan, payment_code: code })
              .eq("id", pending.id);
          } else {
            await supabaseAdmin
              .from("subscriptions")
              .insert({ username, plan, status: "pending", payment_code: code });
          }
        }

        const { data: active } = await supabaseAdmin
          .from("subscriptions")
          .select("plan, status, payment_code, expires_at")
          .eq("username", username)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const isActive =
          !!active && active.status === "active" && !!active.expires_at && active.expires_at > now;

        return json({ ok: true, sub: active ?? null, active: isActive });
      },
    },
  },
});
