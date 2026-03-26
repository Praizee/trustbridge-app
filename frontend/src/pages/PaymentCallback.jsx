import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  Heart,
  Share2,
  ArrowLeft,
  ReceiptText,
  RefreshCcw,
  Loader2,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  loading: {
    icon: Loader2,
    iconColor: "text-slate-400 animate-spin",
    iconBg: "bg-slate-50",
    badge: "bg-slate-100 text-slate-600",
    badgeLabel: "Verifying…",
    heading: "Processing your payment",
    subheading: "Please wait while we confirm your transaction.",
    ringColor: "ring-slate-100",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    badgeLabel: "Payment Successful",
    heading: "Thank you for your donation!",
    subheading:
      "Your payment has been successfully confirmed and processed.",
    ringColor: "ring-emerald-100",
  },
  failed: {
    icon: XCircle,
    iconColor: "text-red-400",
    iconBg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Payment Failed",
    heading: "Payment failed",
    subheading: "Your transaction could not be completed.",
    ringColor: "ring-red-100",
  },
  pending: {
    icon: Clock,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    badgeLabel: "Pending",
    heading: "Payment pending",
    subheading: "We are still waiting for confirmation.",
    ringColor: "ring-amber-100",
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-400",
    iconBg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Error",
    heading: "Something went wrong",
    subheading: "Unable to determine payment status.",
    ringColor: "ring-red-100",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [txnData, setTxnData] = useState(null);

  const reference = searchParams.get("txn_ref");
  const amountParam = searchParams.get("amount");
  const preVerified = searchParams.get("verified");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      return;
    }

    // ✅ ONLY USE RESULT FROM onComplete (NO API CALL HERE)
    if (preVerified === "1") {
      setStatus("success");
      setTxnData({ amount: amountParam });
    } else if (preVerified === "0") {
      setStatus("failed");
      setTxnData({ amount: amountParam });
    } else {
      // fallback (rare case)
      setStatus("pending");
    }
  }, [reference, preVerified, amountParam]);

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const campaignId = txnData?.campaign_id;

  const shareUrl = campaignId
    ? `${window.location.origin}/campaigns/${campaignId}`
    : `${window.location.origin}/campaigns`;

  const rawAmount = txnData?.amount ?? amountParam;

  const formattedAmount =
    rawAmount != null && !isNaN(Number(rawAmount))
      ? Number(rawAmount).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white py-10">
        <div className="max-w-lg mx-auto px-4">
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 text-emerald-200 hover:text-white text-sm mb-6"
          >
            <ArrowLeft className="size-4" /> Back to campaigns
          </Link>

          <h1 className="text-2xl font-bold">Payment Status</h1>
          <p className="text-emerald-100 text-sm">
            Secured by Interswitch Escrow
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border p-8 text-center"
        >
          <div className="mb-6">
            <Icon className={`w-12 h-12 mx-auto ${config.iconColor}`} />
          </div>

          <h2 className="text-xl font-bold mb-2">{config.heading}</h2>
          <p className="text-sm text-slate-500">{config.subheading}</p>

          {formattedAmount && (
            <p className="mt-4 text-lg font-semibold text-slate-800">
              ₦{formattedAmount}
            </p>
          )}

          {reference && (
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Ref: {reference}
            </p>
          )}

          <div className="mt-6 space-y-3">
            <Button asChild className="w-full">
              <Link to="/campaigns">
                <Heart className="w-4 h-4 mr-2" />
                Browse Campaigns
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-6 flex justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-4 text-emerald-500" /> Secure
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="size-4 text-blue-500" /> Verified
          </span>
        </div>
      </div>
    </div>
  );
}