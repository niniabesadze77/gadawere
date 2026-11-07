import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function normalize(raw: string) {
  return raw.trim().replace(/[^\d+]/g, "");
}

export const Route = createFileRoute("/api/public/config")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { accountSession } = await import("@/lib/session.server");
        const username = (await accountSession(request)).data.phone ?? "";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [flags, admin] = await Promise.all([
          supabaseAdmin.from("feature_flags").select("tool, enabled"),
          username
            ? supabaseAdmin.from("admins").select("username").eq("username", username).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        if (flags.error || ("error" in admin && admin.error)) return json({ error: "server" }, 503);
        const disabled = (flags.data ?? []).filter((f) => !f.enabled && f.tool !== "admin").map((f) => f.tool);
        return json({ ok: true, isAdmin: !!admin.data, disabled });
      },
    },
  },
});
