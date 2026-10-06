export const eventTypes = [
  "Feeding",
  "Medication",
  "Diaper/Toileting",
  "Sleep",
  "Vitals",
  "Note",
];

export const eventMeta: Record<
  string,
  { icon: string; accent: string; tint: string; short: string }
> = {
  Feeding: {
    icon: "🍼",
    accent: "#1F6D55",
    tint: "#DDF4E8",
    short: "Feed",
  },
  Medication: {
    icon: "💊",
    accent: "#665A8F",
    tint: "#EEE9FA",
    short: "Meds",
  },
  "Diaper/Toileting": {
    icon: "🧷",
    accent: "#9B7133",
    tint: "#FFF0CF",
    short: "Care",
  },
  Sleep: {
    icon: "🌙",
    accent: "#526B8E",
    tint: "#E6EDF7",
    short: "Sleep",
  },
  Vitals: {
    icon: "♡",
    accent: "#A34C5A",
    tint: "#F9E4E8",
    short: "Vitals",
  },
  Note: {
    icon: "✎",
    accent: "#5F6964",
    tint: "#ECEFEC",
    short: "Note",
  },
};
