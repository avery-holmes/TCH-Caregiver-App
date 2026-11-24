import type { PagerPageProps } from "./PagerPage";

export default function PagerPage({ active, width, children }: PagerPageProps) {
  return (
    <div
      inert={!active}
      aria-hidden={!active}
      style={{ display: "flex", flexDirection: "column", flex: 1, width,
        minWidth: 0, minHeight: 0, backgroundColor: "#F5F2EA" }}
    >
      {children}
    </div>
  );
}
