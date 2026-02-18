export const impactConfig = {
  "High Impact": {
    dotColor: "bg-impact-high",
    badgeBg: "bg-impact-badge-high-bg",
    badgeText: "text-impact-badge-high-text",
    badgeBorder: "border-impact-badge-high-text/30",
  },
  "Medium Impact": {
    dotColor: "bg-impact-medium",
    badgeBg: "bg-impact-badge-medium-bg",
    badgeText: "text-impact-badge-medium-text",
    badgeBorder: "border-impact-badge-medium-text/30",
  },
  "Low Impact": {
    dotColor: "bg-impact-low",
    badgeBg: "bg-impact-badge-low-bg",
    badgeText: "text-impact-badge-low-text",
    badgeBorder: "border-impact-badge-low-text/30",
  },
} as const;

export type ImpactLevel = keyof typeof impactConfig;
