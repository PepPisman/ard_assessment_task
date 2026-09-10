import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "accent" | "ghost";
}

const VARIANT_CLASSES: Record<"accent" | "ghost", string> = {
  accent: "gradient-accent text-white shadow-md hover:opacity-90",
  ghost: "glass-surface border border-subtle text-heading hover:opacity-90",
};

export function BaseButton({
  children,
  variant = "accent",
  className = "",
  type = "button",
  ...rest
}: BaseButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-tile px-4 py-2 text-sm font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`.trimEnd()}
      {...rest}
    >
      {children}
    </button>
  );
}
