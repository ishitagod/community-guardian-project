import type { Classification, Severity } from "../types";

interface BadgeProps {
  label: string;
  type: "classification" | "severity";
  value: Classification | Severity;
}

export default function Badge({ label, type, value }: BadgeProps) {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";

  if (type === "classification") {
    switch (value) {
      case "verified":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "noise":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "unreviewed":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
    }
  } else if (type === "severity") {
    switch (value) {
      case "high":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "medium":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "low":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
    }
  }

  return (
    <div
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}
    >
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}
