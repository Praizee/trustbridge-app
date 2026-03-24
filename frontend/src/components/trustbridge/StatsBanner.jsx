import { motion } from "framer-motion";
import { Building2, ShieldCheck, Banknote, Users } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "50+",
    label: "Verified Hospitals",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Funds Escrowed",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Banknote,
    value: "₦50M+",
    label: "Disbursed to Care",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Users,
    value: "2,000+",
    label: "Donors Trust Us",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function StatsBanner() {
  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
