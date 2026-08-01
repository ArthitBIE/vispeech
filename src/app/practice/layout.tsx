import { HeaderOnlyShell } from "@/components/layout/HeaderOnlyShell";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeaderOnlyShell>{children}</HeaderOnlyShell>;
}
