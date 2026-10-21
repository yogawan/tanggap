import Image from "next/image";
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
  image,
}: {
  label: string;
  value: string | number;
  tone?: StatTone;
  image?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p
            className={`mt-2 text-3xl font-semibold tracking-[-.02em] ${toneClasses[tone]}`}
          >
            {value}
          </p>
        </div>
        {image && (
          <Image
            src={image}
            alt={label}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 object-contain"
          />
        )}
      </div>
    </Card>
  );
}
