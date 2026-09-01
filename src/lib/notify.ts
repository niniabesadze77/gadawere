/* Daily 19:00 local reminder. Uses the Notification API while a tab is open,
   and remembers the last day it fired so the user only gets one per day. */

const KEY_ENABLED = "gw-notify";
const KEY_LAST = "gw-notify-last";

export function notifyEnabled() {
  return typeof window !== "undefined" && localStorage.getItem(KEY_ENABLED) === "1";
}

export async function enableNotifications() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const perm = await Notification.requestPermission();
  const ok = perm === "granted";
  localStorage.setItem(KEY_ENABLED, ok ? "1" : "0");
  return ok;
}

export function disableNotifications() {
  localStorage.setItem(KEY_ENABLED, "0");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function startDailyReminder(message: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return () => {};

  const tick = () => {
    if (!notifyEnabled() || Notification.permission !== "granted") return;
    const now = new Date();
    if (now.getHours() !== 19) return;
    if (localStorage.getItem(KEY_LAST) === todayKey()) return;
    localStorage.setItem(KEY_LAST, todayKey());
    try {
      new Notification("gadawere.", { body: message, icon: "/icon-192.png" });
    } catch {
      /* ignore */
    }
  };

  tick();
  const id = window.setInterval(tick, 60_000);
  return () => window.clearInterval(id);
}
