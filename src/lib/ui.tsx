import { createContext, useContext } from "react";
import { DICT, type Dict, type Lang } from "@/lib/i18n";

export const LangCtx = createContext<{ lang: Lang; t: Dict }>({
  lang: "ka",
  t: DICT.ka as unknown as Dict,
});

export const useT = () => useContext(LangCtx);

export function Panel({ children }: { children: React.ReactNode }) {
  return <div className="gw-panel rounded-3xl p-4 sm:p-5">{children}</div>;
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`gw-card rounded-3xl p-4 ${className}`}>{children}</div>;
}

export function ErrorNote({ text }: { text: string }) {
  return <p className="gw-note gw-note-bad mt-3 text-sm">{text}</p>;
}

export async function friendlyApiError(
  res: Response,
  t: { errorGeneric: string; errorBusy: string; errorLimit: string },
) {
  let raw = "";
  try {
    raw = await res.text();
  } catch {
    raw = "";
  }
  if (res.status === 429) return t.errorBusy;
  if (res.status === 402 || /not enough credits|payment_required|limit/i.test(raw))
    return t.errorLimit;
  return t.errorGeneric;
}
