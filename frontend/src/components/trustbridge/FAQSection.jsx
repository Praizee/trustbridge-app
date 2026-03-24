import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the escrow model work?",
    a: "When you donate, your funds are held in a secure Interswitch-powered escrow account — not in anyone's personal wallet. Once the campaign reaches its target and the hospital submits a verified medical invoice, funds are released directly to the hospital's corporate bank account.",
  },
  {
    q: "How are hospitals verified?",
    a: "Every hospital on TrustBridge undergoes a rigorous KYC process. We verify their CAC registration, medical licenses, corporate bank accounts, and physical addresses before they can be listed as a partner.",
  },
  {
    q: "Can the campaign creator access the donated funds?",
    a: "No. Campaign creators never have access to the funds. All donations flow through the escrow and are disbursed directly to the verified hospital. This eliminates the risk of misuse or fraud entirely.",
  },
  {
    q: "Is my payment information safe with Interswitch?",
    a: "Absolutely. Interswitch is Nigeria's leading payment infrastructure provider, PCI-DSS certified, and processes billions of naira annually. Your card details are encrypted and never stored on our servers.",
  },
  {
    q: "Can I get a refund if a campaign doesn't reach its goal?",
    a: "If a campaign is cancelled before disbursement, all escrowed funds are returned to donors. Our escrow model ensures transparency at every stage of the process.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">
            Common questions, honest answers
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-slate-50/70 border border-slate-100 rounded-xl px-6 data-[state=open]:bg-white data-[state=open]:shadow-sm data-[state=open]:border-slate-200 transition-all"
              >
                <AccordionTrigger className="text-left text-[15px] font-medium text-slate-700 hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-500 leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

