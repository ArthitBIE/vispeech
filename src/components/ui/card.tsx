import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "bordered" | "elevated";
  padded?: boolean | string;
  interactive?: boolean;
}

export function Card({
  variant = "surface",
  padded = true,
  interactive = false,
  className,
  ...props
}: CardProps) {
  const variants = {
    surface: "bg-card border border-border shadow-sm",
    bordered: "bg-card border border-border shadow-sm",
    elevated: "bg-card shadow-md",
  } as const;

  const padClass = padded === true ? "p-6" : typeof padded === "string" ? padded : "";

  return (
    <div
      className={cn(
        variants[variant],
        padClass,
        interactive &&
          "transition-ui hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
        className,
      )}
      {...props}
    />
  );
}
