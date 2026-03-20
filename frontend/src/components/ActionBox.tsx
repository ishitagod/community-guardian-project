import type { Classification } from "../types";

interface ActionBoxProps {
  classification: Classification;
  actionSummary: string;
}

export default function ActionBox({
  classification,
  actionSummary,
}: ActionBoxProps) {
  const isVerified = classification === "verified";
  const bgColor = isVerified
    ? "bg-green-50 border-green-200"
    : "bg-yellow-50 border-yellow-200";
  const iconColor = isVerified ? "text-green-600" : "text-yellow-600";
  const icon = isVerified ? "✓" : "⚠";

  return (
    <div className={`border ${bgColor} rounded-lg p-4 flex gap-3`}>
      <div className={`${iconColor} text-2xl font-bold flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-700 leading-relaxed">{actionSummary}</p>
      </div>
    </div>
  );
}
