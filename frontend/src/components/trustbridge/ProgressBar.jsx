import { motion } from "framer-motion";

export default function ProgressBar({
  raised,
  target,
  size = "md",
  showLabel = true,
}) {
  const percentage = Math.min((raised / target) * 100, 100);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div className="w-full">
      <div
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size]}`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-xs font-semibold text-emerald-600">
            {percentage.toFixed(0)}% funded
          </span>
          <span className="text-xs text-slate-400">
            ₦{(target - raised).toLocaleString()} to go
          </span>
        </div>
      )}
    </div>
  );
}
