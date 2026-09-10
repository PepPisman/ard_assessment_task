import type { InputHTMLAttributes } from "react";

type BaseInputProps = InputHTMLAttributes<HTMLInputElement>;

export function BaseInput({ className = "", ...rest }: BaseInputProps) {
  return (
    <input
      className={`w-full rounded-tile border border-subtle bg-raised px-4 py-2.5 text-heading placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`.trimEnd()}
      {...rest}
    />
  );
}
