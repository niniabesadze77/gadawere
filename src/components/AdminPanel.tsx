import { useState } from "react";
import { Card, useT } from "@/lib/ui";

type Flag = { id: string; username: string; text: string; word: string; created_at: string };
type Strike = { id: string; username: string; until: string; reason: string };
type Sub = {
  id: string;
  username: string;
  plan: string;
  status: string;
  payment_code: string;
  expires_at: string | null;
};
type Feature = { tool: string; enabled: boolean };
type Stats = {
  flags: Flag[];
  strikes: Strike[];
  subs: Sub[];
  admins: { username: string }[];
  features: Feature[];
  online: number;
  today: number;
  users: number;
};

export default function AdminPanel({ username }: { username: string }) {
  const { t } = useT();
  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Stats | null>(null);
  const [target, setTarget] = useState("");
  const [newAdmin, setNewAdmin] = useState("");

  async function call(payload: Record<string, unknown> = {}) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/public/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pass, action: "stats", ...payload }),
      });
      if (res.status === 401) {
        setErr(t.admNoAccess);
        setAuthed(false);
        return;
      }
      const json = (await res.json()) as Stats;
      setData(json);
      setAuthed(true);
    } catch {
      setErr(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="space-y-3">
        <p className="text-sm opacity-70">{t.admHint}</p>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder={t.password}
          className="gw-input rounded-2xl px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          disabled={busy || !pass}
          onClick={() => void call()}
          className="gw-btn w-full rounded-2xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
        >
          {t.signIn}
        </button>
        {err && <div className="gw-note gw-note-bad text-sm">{err}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t.admOnline, value: data?.online ?? 0 },
          { label: t.admToday, value: data?.today ?? 0 },
          { label: t.admUsers, value: data?.users ?? 0 },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <div className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-black text-transparent">
              {s.value}
            </div>
            <div className="text-[11px] opacity-60">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="username"
          className="gw-input flex-1 rounded-2xl px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy || !target}
          onClick={() => void call({ action: "ban", target })}
          className="gw-glass rounded-2xl px-3 py-2 text-xs font-bold"
        >
          🚫 {t.admBan}
        </button>
        <button
          type="button"
          disabled={busy || !target}
          onClick={() => void call({ action: "unban", target })}
          className="gw-glass rounded-2xl px-3 py-2 text-xs font-bold"
        >
          ✅ {t.admUnban}
        </button>
      </div>

      <Card className="space-y-2">
        <div className="text-sm font-black">{t.admAddAdmin}</div>
        <div className="flex gap-2">
          <input
            value={newAdmin}
            onChange={(e) => setNewAdmin(e.target.value)}
            placeholder="5XXXXXXXX"
            className="gw-input flex-1 rounded-2xl px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy || !newAdmin}
            onClick={() => {
              void call({ action: "make_admin", target: newAdmin });
              setNewAdmin("");
            }}
            className="gw-glass rounded-2xl px-3 py-2 text-xs font-bold"
          >
            👑 {t.admMakeAdmin}
          </button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {(data?.admins ?? []).map((a) => (
            <li
              key={a.username}
              className="flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700"
            >
              {a.username}
              {a.username !== username && (
                <button
                  type="button"
                  onClick={() => void call({ action: "remove_admin", target: a.username })}
                  className="bg-transparent text-violet-500"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-2">
        <div className="text-sm font-black">{t.admFeatures}</div>
        <p className="text-xs opacity-60">{t.admFeatureHint}</p>
        <ul className="space-y-1.5">
          {(data?.features ?? []).map((f) => (
            <li key={f.tool} className="flex items-center gap-2 text-sm">
              <span className="flex-1 font-bold capitalize">{f.tool}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void call({ action: "toggle_feature", tool: f.tool, enabled: !f.enabled })
                }
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  f.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {f.enabled ? t.admOn : t.admOff}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="text-sm font-black">{t.admSubs}</div>
        {(data?.subs ?? []).length === 0 && <p className="mt-2 text-sm opacity-60">—</p>}
        <ul className="mt-2 space-y-2">
          {(data?.subs ?? []).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold">{s.username}</span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                {s.plan}
              </span>
              <span className="text-[11px] opacity-60">{s.payment_code}</span>
              <span className="text-[11px] opacity-70">{s.status}</span>
              {s.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => void call({ action: "approve", subId: s.id })}
                    className="gw-glass rounded-full px-2.5 py-1 text-[11px] font-bold"
                  >
                    ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => void call({ action: "reject", subId: s.id })}
                    className="gw-glass rounded-full px-2.5 py-1 text-[11px] font-bold"
                  >
                    ✕
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="text-sm font-black">{t.admStrikes}</div>
        {(data?.strikes ?? []).length === 0 && <p className="mt-2 text-sm opacity-60">—</p>}
        <ul className="mt-2 space-y-1.5">
          {(data?.strikes ?? []).map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1 font-bold">{s.username}</span>
              <span className="text-[11px] opacity-60">
                {new Date(s.until).toLocaleTimeString()}
              </span>
              <button
                type="button"
                onClick={() => void call({ action: "unban", target: s.username })}
                className="gw-glass rounded-full px-2.5 py-1 text-[11px] font-bold"
              >
                {t.admUnban}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="text-sm font-black">{t.admFlags}</div>
        {(data?.flags ?? []).length === 0 && <p className="mt-2 text-sm opacity-60">—</p>}
        <ul className="mt-2 space-y-2">
          {(data?.flags ?? []).map((f) => (
            <li key={f.id} className="text-sm">
              <span className="font-bold">{f.username}</span>{" "}
              <span className="text-red-600">“{f.word}”</span>
              <div className="truncate text-xs opacity-60">{f.text}</div>
            </li>
          ))}
        </ul>
      </Card>

      <button
        type="button"
        disabled={busy}
        onClick={() => void call()}
        className="gw-glass w-full rounded-2xl px-4 py-2 text-sm font-bold"
      >
        ⟳
      </button>
    </div>
  );
}
