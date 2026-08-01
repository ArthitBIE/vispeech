import { HeaderOnlyShell } from "@/components/layout/HeaderOnlyShell";

export default function SummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeaderOnlyShell>{children}</HeaderOnlyShell>;
}
