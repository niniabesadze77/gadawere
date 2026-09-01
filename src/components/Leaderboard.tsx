import { useEffect, useState } from "react";
import { Card } from "@/lib/ui";
import { useT } from "@/lib/ui";

type Row = { username: string; correct: number; total: number };

export default function Leaderboard({ username }: { username: string }) {
  const { t } = useT();
  const [rows, setRows] = useState<Row[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const res = await fetch("/api/public/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, action: "board" }),
        });
        const data = (await res.json()) as { board?: Row[]; rank?: number | null };
        if (!alive) return;
        setRows(data.board ?? []);
        setRank(data.rank ?? null);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [username]);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`);

  return (
    <div className="space-y-3">
      <p className="text-sm opacity-70">{t.lbHint}</p>
      {rank && (
        <Card className="text-center text-sm font-bold">
          {t.lbYourRank}: <span className="text-violet-600">#{rank}</span>
        </Card>
      )}
      {busy && <p className="text-sm opacity-60">…</p>}
      {!busy && rows.length === 0 && <p className="text-sm opacity-60">{t.lbEmpty}</p>}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div
            key={r.username}
            style={{ animationDelay: `${i * 40}ms` }}
            className={`gw-card flex animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] items-center gap-3 rounded-2xl px-4 py-3 ${
              r.username === username ? "ring-2 ring-violet-400" : ""
            }`}
          >
            <span className="w-8 text-center text-lg font-black">{medal(i)}</span>
            <span className="flex-1 truncate font-bold">{r.username}</span>
            <span className="text-sm font-bold text-violet-600">✅ {r.correct}</span>
            <span className="text-xs opacity-60">/ {r.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
