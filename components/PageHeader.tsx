import type { LucideIcon } from "lucide-react";
import { IconChip, type AccentColor } from "@/components/IconChip";

export function PageHeader({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  color: AccentColor;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <IconChip icon={icon} color={color} />
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
