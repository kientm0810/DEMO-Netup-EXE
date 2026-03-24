import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="space-y-2">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-heading text-2xl font-semibold text-ink">{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </Card>
  );
}
