import { createFileRoute } from "@tanstack/react-router";

type Body = {
  username?: string;
  pass?: string;
  action?: "stats" | "unban" | "ban" | "approve" | "reject";
  target?: string;
  subId?: string;
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

        if (!pass) return json({ error: "unauthorized" }, 401);

        const panelPass = process.env["ADMIN_PANEL_PASSWORD"] ?? "";
        const master = panelPass.length > 0 && pass === panelPass;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (!master) {
          if (!username) return json({ error: "unauthorized" }, 401);

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
        }

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

        if (action === "approve" && body.subId) {
          const { data: sub } = await supabaseAdmin
            .from("subscriptions")
            .select("id, plan")
            .eq("id", body.subId)
            .maybeSingle();
          if (sub) {
            const days = sub.plan === "premium" ? 365 : 30;
            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: "active",
                expires_at: new Date(now.getTime() + days * 86400000).toISOString(),
              })
              .eq("id", sub.id);
          }
        }

        if (action === "reject" && body.subId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "rejected" })
            .eq("id", body.subId);
        }

        const online = new Date(now.getTime() - 2 * 60 * 1000).toISOString();

        const [flags, strikes, onlineRes, todayRes, totalUsers, subs] = await Promise.all([

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
          supabaseAdmin
            .from("subscriptions")
            .select("id, username, plan, status, payment_code, expires_at, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        return json({
          ok: true,
          flags: flags.data ?? [],
          strikes: strikes.data ?? [],
          subs: subs.data ?? [],
          online: onlineRes.count ?? 0,
          today: todayRes.count ?? 0,
          users: totalUsers.count ?? 0,
        });

      },
    },
  },
});
