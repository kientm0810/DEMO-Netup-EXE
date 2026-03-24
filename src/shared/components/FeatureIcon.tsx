import type { SVGProps } from "react";

type IconName = "map" | "ai" | "slot" | "player" | "owner" | "admin" | "spark";

interface FeatureIconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function FeatureIcon({ name, className, ...rest }: FeatureIconProps) {
  const common = "h-5 w-5";
  const classes = className ? `${common} ${className}` : common;

  if (name === "map") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
        <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "ai") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
        <rect x="4" y="6" width="16" height="12" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2v4M8 22v-3M16 22v-3M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="9" cy="12" r="1.2" fill="currentColor" />
        <circle cx="15" cy="12" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (name === "slot") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 10h17M8 5v14M14 5v14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "player") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 20c0-3.3 3-5.8 7-5.8S19 16.7 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "owner") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
        <path d="m3 11 9-7 9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 10.5V20h14v-9.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "admin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
        <path d="m12 3 8 4v5c0 5-3.5 7.8-8 9-4.5-1.2-8-4-8-9V7l8-4Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
      <path d="M12 3 14 9l6 .5-4.6 3.7 1.5 5.8L12 15.9 7.1 19l1.5-5.8L4 9.5 10 9l2-6Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
