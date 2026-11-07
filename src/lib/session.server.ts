import { useSession } from "@tanstack/react-start/server";

export async function accountSession(request: Request) {
  const password = process.env["APP_SESSION_SECRET"];
  if (!password) throw new Error("Account session is not configured");
  return useSession<{ phone: string }>({
    name: "gw-session",
    password,
    maxAge: 60 * 60 * 24 * 30,
    cookie: { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/" },
  });
}