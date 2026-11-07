import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

type Body = {
  mode: "register" | "login";
  phone: string;
  pass: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
};

async function hash(phone: string, pass: string) {
  const data = new TextEncoder().encode(`gw::${phone}::${pass}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { accountSession } = await import("@/lib/session.server");
        const session = await accountSession(request);
        const phone = session.data.phone;
        if (!phone) return json({ ok: false }, 401);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: user } = await supabaseAdmin.from("app_users").select("phone, first_name").eq("phone", phone).maybeSingle();
        if (!user) { await session.clear(); return json({ ok: false }, 401); }
        const { data: admin, error } = await supabaseAdmin.from("admins").select("username").eq("username", phone).maybeSingle();
        if (error) return json({ error: "server" }, 503);
        return json({ ok: true, phone, firstName: user.first_name, isAdmin: !!admin });
      },
      DELETE: async ({ request }) => {
        const { accountSession } = await import("@/lib/session.server");
        await (await accountSession(request)).clear();
        return json({ ok: true });
      },
      POST: async ({ request }) => {
        const parsed = z.object({ mode: z.enum(["register", "login"]), phone: z.string().max(30), pass: z.string().min(4).max(128), firstName: z.string().max(100).optional(), lastName: z.string().max(100).optional(), birthDate: z.string().max(20).optional() }).safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "missing" }, 400);
        const body: Partial<Body> = parsed.data;
        const mode = body.mode === "login" ? "login" : "register";
        const phone = normalizePhone(String(body.phone ?? ""));
        const pass = String(body.pass ?? "");

        if (!/^5\d{8}$/.test(phone)) return json({ error: "bad_phone" }, 400);
        if (pass.length < 4) return json({ error: "short_pass" }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const pass_hash = await hash(phone, pass);

        const { data: existing, error: readErr } = await supabaseAdmin
          .from("app_users")
          .select("id, pass_hash, first_name, last_name")
          .eq("phone", phone)
          .maybeSingle();

        if (readErr) return json({ error: "server" }, 500);

        if (mode === "register") {
          if (existing) return json({ error: "taken" }, 409);
          const firstName = String(body.firstName ?? "").trim();
          const lastName = String(body.lastName ?? "").trim();
          const birthDate = String(body.birthDate ?? "").trim();
          if (!firstName || !lastName || !birthDate) return json({ error: "missing" }, 400);

          const { error } = await supabaseAdmin.from("app_users").insert({
            phone,
            pass_hash,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
          });
          if (error) {
            return json({ error: error.code === "23505" ? "taken" : "server" }, 409);
          }
          const { accountSession } = await import("@/lib/session.server");
          await (await accountSession(request)).update({ phone });
          const { data: admin } = await supabaseAdmin.from("admins").select("username").eq("username", phone).maybeSingle();
          return json({ ok: true, phone, firstName, isAdmin: !!admin });
        }

        if (!existing || existing.pass_hash !== pass_hash) {
          return json({ error: "bad_credentials" }, 401);
        }
        const { accountSession } = await import("@/lib/session.server");
        await (await accountSession(request)).update({ phone });
        const { data: admin, error: adminError } = await supabaseAdmin.from("admins").select("username").eq("username", phone).maybeSingle();
        if (adminError) return json({ error: "server" }, 503);
        return json({ ok: true, phone, firstName: existing.first_name ?? "", isAdmin: !!admin });
      },
    },
  },
});
