import { useEffect, useState } from "react";
import { Card, useT } from "@/lib/ui";

const IBAN = "GE63BG0000000529113336";

type Sub = {
  plan: string;
  status: string;
  payment_code: string;
  expires_at: string | null;
};

export default function ProPlans({ username }: { username: string }) {
  const { t } = useT();
  const [sub, setSub] = useState<Sub | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function call(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/public/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, ...payload }),
      });
      const data = (await res.json()) as { sub?: Sub | null; active?: boolean };
      setSub(data.sub ?? null);
      setActive(!!data.active);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void call({ action: "status" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const plans = [
    { id: "basic" as const, price: "25₾", period: t.proMonth, perks: t.proBasicPerks },
    { id: "premium" as const, price: "125₾", period: t.proYear, perks: t.proPremiumPerks },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm opacity-70">{t.proHint}</p>

      {active && sub && (
        <Card className="text-sm font-bold text-emerald-600">
          ✅ {t.proActive}: {sub.plan === "premium" ? "Premium" : "Basic"}
          {sub.expires_at && (
            <span className="ml-1 opacity-70">
              ({new Date(sub.expires_at).toLocaleDateString()})
            </span>
          )}
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p, i) => (
          <Card
            key={p.id}
            className={`animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both] ${
              sub?.plan === p.id ? "ring-2 ring-violet-400" : ""
            }`}
          >
            <div style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-lg font-black capitalize">{p.id}</div>
              <div className="mt-1 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-3xl font-black text-transparent">
                {p.price}
              </div>
              <div className="text-xs opacity-60">{p.period}</div>
              <ul className="mt-3 space-y-1 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk}>✨ {perk}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={busy}
                onClick={() => void call({ action: "request", plan: p.id })}
                className="gw-btn mt-4 w-full rounded-2xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
              >
                {t.proChoose}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {sub && sub.status === "pending" && (
        <Card className="space-y-2">
          <div className="text-sm font-black">{t.proPayTitle}</div>
          <p className="text-sm opacity-75">{t.proPayText}</p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(IBAN);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="gw-glass w-full rounded-2xl px-3 py-2.5 text-sm font-bold tracking-wide"
          >
            {copied ? "✅" : "📋"} {IBAN}
          </button>
          <div className="gw-note gw-note-warn text-sm">
            <span className="font-bold">{t.proCode}: </span>
            {sub.payment_code}
          </div>
          <p className="text-xs opacity-60">{t.proPending}</p>
        </Card>
      )}

      {sub && sub.status === "rejected" && (
        <div className="gw-note gw-note-bad text-sm">{t.proRejected}</div>
      )}
    </div>
  );
}
