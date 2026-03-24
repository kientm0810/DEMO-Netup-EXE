import type { PropsWithChildren } from "react";
import { Card } from "./Card";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description, children }: PropsWithChildren<EmptyStateProps>) {
  return (
    <Card className="border-dashed text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
        !
      </div>
      <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}
