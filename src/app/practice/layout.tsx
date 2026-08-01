import { BareShell } from "@/components/layout/BareShell";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BareShell>{children}</BareShell>;
}
