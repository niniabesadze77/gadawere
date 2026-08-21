/* Client-side moderation gate.
   Wraps fetch for the AI endpoints: every outgoing prompt is checked
   server-side first. Bad language => automatic 2 hour block. */

const AI_ROUTES = [
  "/api/public/math-chat",
  "/api/public/essay-generate",
  "/api/public/improve-essay",
  "/api/public/solve-math",
  "/api/public/practice-generate",
  "/api/public/presentation-generate",
];

let blockedUntil: number | null = null;
const listeners = new Set<(until: number | null) => void>();

export function getBlockedUntil() {
  if (blockedUntil && blockedUntil <= Date.now()) blockedUntil = null;
  return blockedUntil;
}

export function setBlockedUntil(until: number | null) {
  blockedUntil = until;
  listeners.forEach((l) => l(until));
}

export function onBlockChange(fn: (until: number | null) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function currentUser(): string | null {
  try {
    const raw = localStorage.getItem("gw-account");
    if (!raw) return null;
    return (JSON.parse(raw) as { phone?: string }).phone ?? null;
  } catch {
    return null;
  }
}

function extractText(body: unknown): string {
  if (typeof body !== "string") return "";
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const parts: string[] = [];
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && k !== "lang") parts.push(v);
      if (Array.isArray(v)) {
        for (const item of v) {
          if (item && typeof item === "object" && typeof (item as { content?: string }).content === "string")
            parts.push((item as { content: string }).content);
          if (item && typeof item === "object" && typeof (item as { note?: string }).note === "string")
            parts.push((item as { note: string }).note);
        }
      }
    }
    return parts.join(" \n ");
  } catch {
    return "";
  }
}

let installed = false;

export function installModeration() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
    const isAi = AI_ROUTES.some((r) => url.includes(r));
    const username = isAi ? currentUser() : null;

    if (isAi && username) {
      const text = extractText(init?.body);
      try {
        const res = await original("/api/public/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, text }),
        });
        const data = (await res.json()) as { blocked?: boolean; until?: string };
        if (data.blocked && data.until) {
          setBlockedUntil(new Date(data.until).getTime());
          return new Response("blocked", { status: 403 });
        }
      } catch {
        /* moderation unreachable — let the request through */
      }
    }

    return original(input as RequestInfo, init);
  };
}

export async function pingPresence(username: string) {
  try {
    const res = await fetch("/api/public/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = (await res.json()) as { blocked?: boolean; until?: string };
    setBlockedUntil(data.blocked && data.until ? new Date(data.until).getTime() : null);
  } catch {
    /* offline — ignore */
  }
}
