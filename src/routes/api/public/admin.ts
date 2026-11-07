import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

type Body = {
  username?: string;
  pass?: string;
  action?:
    | "stats"
    | "unban"
    | "ban"
    | "approve"
    | "reject"
    | "make_admin"
    | "remove_admin"
    | "toggle_feature";
  target?: string;
  subId?: string;
  tool?: string;
  enabled?: boolean;
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
        const parsed = z.object({ action: z.enum(["stats", "unban", "ban", "approve", "reject", "make_admin", "remove_admin", "toggle_feature"]).optional(), target: z.string().max(30).optional(), subId: z.string().uuid().optional(), tool: z.enum(["essay", "presentation", "tutor", "leaderboard", "schedule", "pro"]).optional(), enabled: z.boolean().optional() }).safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "invalid_input" }, 400);
        const body: Body = parsed.data;
        const { accountSession } = await import("@/lib/session.server");
        const username = (await accountSession(request)).data.phone;
        const action = body.action ?? "stats";

        if (!username) return json({ error: "unauthorized" }, 401);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: admin } = await supabaseAdmin
          .from("admins")
          .select("username")
          .eq("username", username)
          .maybeSingle();
        if (!admin) return json({ error: "unauthorized" }, 401);

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

        if (action === "make_admin" && body.target) {
          const t = normalizePhone(body.target);
          if (!/^5\d{8}$/.test(t)) return json({ error: "bad_phone" }, 400);
          const { data: target } = await supabaseAdmin.from("app_users").select("phone").eq("phone", t).maybeSingle();
          if (!target) return json({ error: "account_not_found" }, 404);
          const { error } = await supabaseAdmin.from("admins").upsert({ username: t });
          if (error) return json({ error: "server" }, 500);
        }

        if (action === "remove_admin" && body.target) {
          const t = normalize(body.target);
          if (t && t !== username && !["557099944", "555673731"].includes(t)) {
            await supabaseAdmin.from("admins").delete().eq("username", t);
          }
        }

        if (action === "toggle_feature" && body.tool) {
          await supabaseAdmin.from("feature_flags").upsert({
            tool: body.tool,
            enabled: !!body.enabled,
            updated_at: nowIso,
          });
        }

        const online = new Date(now.getTime() - 2 * 60 * 1000).toISOString();

        const [flags, strikes, onlineRes, todayRes, totalUsers, subs, admins, features] =
          await Promise.all([
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
            supabaseAdmin.from("admins").select("username").order("username"),
            supabaseAdmin.from("feature_flags").select("tool, enabled").order("tool"),
          ]);

        return json({
          ok: true,
          flags: flags.data ?? [],
          strikes: strikes.data ?? [],
          subs: subs.data ?? [],
          admins: admins.data ?? [],
          features: features.data ?? [],
          online: onlineRes.count ?? 0,
          today: todayRes.count ?? 0,
          users: totalUsers.count ?? 0,
        });

      },
    },
  },
});
