import { createFileRoute } from "@tanstack/react-router";

type Body = { mode: "register" | "login"; phone: string; pass: string };

function normalizePhone(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

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
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/account")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Partial<Body>;
        const mode = body.mode === "login" ? "login" : "register";
        const phone = normalizePhone(String(body.phone ?? ""));
        const pass = String(body.pass ?? "");

        if (phone.replace(/\D/g, "").length < 6) return json({ error: "bad_phone" }, 400);
        if (pass.length < 4) return json({ error: "short_pass" }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const pass_hash = await hash(phone, pass);

        const { data: existing, error: readErr } = await supabaseAdmin
          .from("app_users")
          .select("id, pass_hash")
          .eq("phone", phone)
          .maybeSingle();

        if (readErr) return json({ error: "server" }, 500);

        if (mode === "register") {
          if (existing) return json({ error: "taken" }, 409);
          const { error } = await supabaseAdmin
            .from("app_users")
            .insert({ phone, pass_hash });
          if (error) {
            return json({ error: error.code === "23505" ? "taken" : "server" }, 409);
          }
          return json({ ok: true, phone });
        }

        if (!existing || existing.pass_hash !== pass_hash) {
          return json({ error: "bad_credentials" }, 401);
        }
        return json({ ok: true, phone });
      },
    },
  },
});
