import { useEffect, useState } from "react";
import { Card, useT } from "@/lib/ui";

type Item = {
  id: string;
  weekday: number;
  start_time: string;
  subject: string;
  note: string;
};

export default function SchedulePlanner({ username }: { username: string }) {
  const { t } = useT();
  const [items, setItems] = useState<Item[]>([]);
  const [weekday, setWeekday] = useState(new Date().getDay());
  const [time, setTime] = useState("09:00");
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function call(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/public/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, ...payload }),
      });
      const data = (await res.json()) as { items?: Item[] };
      setItems(data.items ?? []);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void call({ action: "list" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const tomorrow = (new Date().getDay() + 1) % 7;
  const tomorrowItems = items.filter((i) => i.weekday === tomorrow);

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-black">
          {t.schTomorrow} · {t.weekdays[tomorrow]}
        </div>
        {tomorrowItems.length === 0 ? (
          <p className="mt-2 text-sm opacity-60">{t.schNothing}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tomorrowItems.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                  {i.start_time}
                </span>
                <span className="font-semibold">{i.subject}</span>
                {i.note && <span className="text-xs opacity-60">{i.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-3 text-sm font-black">{t.schAdd}</div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className="gw-input rounded-2xl px-3 py-2 text-sm"
          >
            {t.weekdays.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="gw-input rounded-2xl px-3 py-2 text-sm"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t.schSubject}
            className="gw-input col-span-2 rounded-2xl px-3 py-2 text-sm"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.schNote}
            className="gw-input col-span-2 rounded-2xl px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={busy || !subject.trim()}
          onClick={() => {
            void call({ action: "add", weekday, start_time: time, subject, note });
            setSubject("");
            setNote("");
          }}
          className="gw-btn mt-3 w-full rounded-2xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
        >
          {t.schAddBtn}
        </button>
      </Card>

      <div className="space-y-2">
        {t.weekdays.map((day, d) => {
          const rows = items.filter((i) => i.weekday === d);
          if (rows.length === 0) return null;
          return (
            <Card key={day}>
              <div className="text-xs font-black uppercase tracking-wide opacity-60">{day}</div>
              <ul className="mt-2 space-y-1.5">
                {rows.map((i) => (
                  <li key={i.id} className="flex items-center gap-2 text-sm">
                    <span className="w-12 text-xs font-bold text-violet-600">{i.start_time}</span>
                    <span className="flex-1 truncate">{i.subject}</span>
                    <button
                      type="button"
                      onClick={() => void call({ action: "delete", id: i.id })}
                      className="rounded-full px-2 text-xs opacity-50 transition hover:opacity-100"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
