import { createFileRoute } from "@tanstack/react-router";

type Body = {
  username?: string;
  pass?: string;
  action?: "stats" | "unban" | "ban";
  target?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalize(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

async function hash(phone: string, pass: string) {
  const data = new TextEncoder().encode(`gw::${phone}::${pass}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/api/public/admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const username = normalize(String(body.username ?? ""));
        const pass = String(body.pass ?? "");
        const action = body.action ?? "stats";

        if (!username || !pass) return json({ error: "unauthorized" }, 401);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: admin } = await supabaseAdmin
          .from("admins")
          .select("username")
          .eq("username", username)
          .maybeSingle();
        if (!admin) return json({ error: "unauthorized" }, 401);

        const { data: user } = await supabaseAdmin
          .from("app_users")
          .select("pass_hash")
          .eq("phone", username)
          .maybeSingle();
        if (!user || user.pass_hash !== (await hash(username, pass)))
          return json({ error: "unauthorized" }, 401);

        const now = new Date();
        const nowIso = now.toISOString();

        if (action === "unban" && body.target) {
          await supabaseAdmin
            .from("strikes")
            .update({ until: nowIso })
            .eq("username", normalize(body.target))
            .gt("until", nowIso);
        }

        if (action === "ban" && body.target) {
          await supabaseAdmin.from("strikes").insert({
            username: normalize(body.target),
            until: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            reason: "manual",
          });
        }

        const online = new Date(now.getTime() - 2 * 60 * 1000).toISOString();

        const [flags, strikes, onlineRes, todayRes, totalUsers] = await Promise.all([
          supabaseAdmin
            .from("flags")
            .select("id, username, text, word, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
          supabaseAdmin
            .from("strikes")
            .select("id, username, until, reason, created_at")
            .gt("until", nowIso)
            .order("until", { ascending: false })
            .limit(50),
          supabaseAdmin
            .from("presence")
            .select("username", { count: "exact", head: true })
            .gt("last_seen", online),
          supabaseAdmin
            .from("visits")
            .select("id", { count: "exact", head: true })
            .eq("day", nowIso.slice(0, 10)),
          supabaseAdmin.from("app_users").select("id", { count: "exact", head: true }),
        ]);

        return json({
          ok: true,
          flags: flags.data ?? [],
          strikes: strikes.data ?? [],
          online: onlineRes.count ?? 0,
          today: todayRes.count ?? 0,
          users: totalUsers.count ?? 0,
        });
      },
    },
  },
});
