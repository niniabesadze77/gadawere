export function currentUsername(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("gw-account");
    if (!raw) return "";
    return ((JSON.parse(raw) as { phone?: string }).phone ?? "").toLowerCase();
  } catch {
    return "";
  }
}

export async function reportScore(subject: string, correct: number, total: number) {
  const username = currentUsername();
  if (!username) return;
  try {
    await fetch("/api/public/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action: "add", subject, correct, total }),
    });
  } catch {
    /* offline — ignore */
  }
}
