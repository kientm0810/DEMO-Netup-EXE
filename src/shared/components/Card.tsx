import type { CSSProperties, PropsWithChildren } from "react";
import { cn } from "../utils/cn";

interface CardProps {
  className?: string;
  style?: CSSProperties;
}

export function Card({ className, children, style }: PropsWithChildren<CardProps>) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
