import { Card } from "./Card";

type StatTone = "foreground" | "danger" | "success" | "warning";

const toneClasses: Record<StatTone, string> = {
  foreground: "text-foreground",
  danger: "text-danger",
  success: "text-success",
  warning: "text-warning",
};

export function StatCard({
  label,
  value,
  tone = "foreground",
}: {
  label: string;
  value: string | number;
  tone?: StatTone;
}) {
  return (
    <Card>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${toneClasses[tone]}`}>
        {value}
      </p>
    </Card>
  );
}
