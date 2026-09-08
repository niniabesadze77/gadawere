import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalize(raw: string) {
  return raw.trim().replace(/[^\d+]/g, "");
}

export const Route = createFileRoute("/api/public/config")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { username?: string };
        const username = normalize(String(body.username ?? ""));

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [flags, admin] = await Promise.all([
          supabaseAdmin.from("feature_flags").select("tool, enabled"),
          username
            ? supabaseAdmin.from("admins").select("username").eq("username", username).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        const disabled = (flags.data ?? []).filter((f) => !f.enabled).map((f) => f.tool);
        return json({ ok: true, isAdmin: !!admin.data, disabled });
      },
    },
  },
});
