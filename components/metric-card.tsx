import {
  Card,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  unit,
  className,
}: MetricCardProps) {
  return (
    <Card
      size="sm"
      className={cn(
        "min-h-28 transition-colors hover:border-emerald-200",
        className,
      )}
    >
      <CardHeader className="min-h-28 content-between">
        <CardDescription className="truncate">{label}</CardDescription>
        <div className="flex min-h-10 items-baseline gap-2 leading-none">
          <span className="text-2xl font-semibold tracking-normal tabular-nums text-foreground md:text-3xl">
            {value}
          </span>
          {unit ? (
            <span className="text-sm font-medium leading-none text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  );
}
