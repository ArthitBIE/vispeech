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

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center p-6 pt-0",
      className,
    )}
    {...props}
  />
);
