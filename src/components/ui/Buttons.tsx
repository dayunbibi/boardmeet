import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CommonProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
};

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-semibold transition active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100";

export function PrimaryButton({ href, children, className, ...props }: ButtonProps) {
  const classes = cn(base, "bg-primary text-white hover:bg-primary-hover", className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ href, children, className, ...props }: ButtonProps) {
  const classes = cn(base, "bg-soft-purple text-primary hover:bg-[#e2daff]", className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

const ghostBase =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-text-secondary transition active:scale-95 active:bg-black/[0.04]";

export function GhostButton({ href, children, className, ...props }: ButtonProps) {
  const classes = cn(ghostBase, className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
