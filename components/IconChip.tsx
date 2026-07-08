import type { LucideIcon } from "lucide-react";

export type AccentColor = "blue" | "violet" | "green" | "amber" | "red" | "muted";

const CHIP_CLASSES: Record<AccentColor, string> = {
  blue: "bg-accent-blue/15 text-accent-blue",
  violet: "bg-accent-violet/15 text-accent-violet",
  green: "bg-accent-green/15 text-accent-green",
  amber: "bg-accent-amber/15 text-accent-amber",
  red: "bg-accent-red/15 text-accent-red",
  muted: "bg-white/10 text-muted",
};

export function IconChip({
  icon: Icon,
  color,
  size = "md",
}: {
  icon: LucideIcon;
  color: AccentColor;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconSize = size === "sm" ? 15 : 18;
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg ${dims} ${CHIP_CLASSES[color]}`}>
      <Icon size={iconSize} strokeWidth={2.25} />
    </span>
  );
}
