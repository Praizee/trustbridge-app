import { motion } from "framer-motion";
import { Search, CreditCard, Building2 } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Verified Campaigns",
    description:
      "Browse campaigns vetted by our team. Every patient is linked to a verified partner hospital.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    icon: CreditCard,
    title: "Donate Securely via Interswitch",
    description:
      "Your payment is processed through Interswitch and held in a secure escrow — never touched by intermediaries.",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
  },
  {
    icon: Building2,
    title: "Funds Go Directly to Hospital",
    description:
      "Once the target is reached, funds are disbursed directly to the hospital's verified corporate account.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">
            Transparent giving,
            <br className="hidden md:block" /> from start to finish
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center`}
                  >
                    <step.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-5xl font-bold text-slate-100">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
