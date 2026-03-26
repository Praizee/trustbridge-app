import React from "react";
import { Check, X } from "lucide-react";

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains an uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    {
      label: "Contains a special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  // Calculate relative strength for a top progress bar or colored text
  let strengthLabel = "Weak";
  let colorClass = "text-red-500 bg-red-100";
  let barColor = "bg-red-500";

  if (metCount === 4) {
    strengthLabel = "Strong";
    colorClass = "text-emerald-700 bg-emerald-100";
    barColor = "bg-emerald-500";
  } else if (metCount >= 2) {
    strengthLabel = "Medium";
    colorClass = "text-amber-700 bg-amber-100";
    barColor = "bg-amber-400";
  }

  return (
    <div className="mt-3 space-y-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-200">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${(metCount / 4) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Password Strength
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}
        >
          {strengthLabel}
        </span>
      </div>

      <ul className="space-y-2">
        {criteria.map((item, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
              item.met ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            {item.met ? (
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={item.met ? "font-medium" : ""}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
