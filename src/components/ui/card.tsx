import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "bordered" | "elevated" | "ghost";
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
    surface:
      "bg-card border border-border/60 shadow-xs",
    bordered:
      "bg-card border-2 border-border",
    elevated:
      "bg-card shadow-md shadow-black/5",
    ghost:
      "bg-transparent",
  } as const;

  const padClass =
    padded === true ? "p-6" : typeof padded === "string" ? padded : "";

  return (
    <div
      className={cn(
        variants[variant],
        padClass,
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5 active:scale-[0.98]",
        "rounded-xl",
        className,
      )}
      {...props}
    />
  );
}
