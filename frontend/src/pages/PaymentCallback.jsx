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
} from "lucide-react";
import { API_URL } from "@/lib/api";

/**
 * Interswitch Web Checkout posts back with these query params:
 *   resp        – response code  ("00" = success, "01" = pending, others = failed)
 *   txnref      – our transaction reference
 *   payRef      – Interswitch payment reference
 *   amount      – amount in kobo
 *   cardNum     – masked card number (optional)
 *   desc        – description / message from gateway
 */

function parseStatus(resp) {
    if (!resp) return "unknown";
    if (resp === "00") return "success";
    if (resp === "01") return "pending";
    return "failed";
}

const STATUS_CONFIG = {
    success: {
        icon: CheckCircle2,
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-50",
        badge: "bg-emerald-100 text-emerald-700",
        badgeLabel: "Payment Successful",
        heading: "Thank you for your donation!",
        subheading:
            "Your payment was received and is being processed. Funds will be held in Interswitch escrow and disbursed directly to the hospital.",
        ringColor: "ring-emerald-100",
    },
    pending: {
        icon: Clock,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-50",
        badge: "bg-amber-100 text-amber-700",
        badgeLabel: "Payment Pending",
        heading: "Your payment is being processed",
        subheading:
            "We haven't received final confirmation yet. This can take a few minutes. Check back shortly or contact support if this persists.",
        ringColor: "ring-amber-100",
    },
    failed: {
        icon: XCircle,
        iconColor: "text-red-400",
        iconBg: "bg-red-50",
        badge: "bg-red-100 text-red-700",
        badgeLabel: "Payment Failed",
        heading: "Your payment could not be completed",
        subheading:
            "Something went wrong during checkout. No money has been charged. Please try again or use a different payment method.",
        ringColor: "ring-red-100",
    },
    unknown: {
        icon: Clock,
        iconColor: "text-slate-400",
        iconBg: "bg-slate-50",
        badge: "bg-slate-100 text-slate-600",
        badgeLabel: "Verifying Payment",
        heading: "Verifying your payment…",
        subheading:
            "We are confirming the status of your transaction with the payment gateway. Please do not close this page.",
        ringColor: "ring-slate-100",
    },
};

export default function PaymentCallback() {
    const [searchParams] = useSearchParams();
    const [copied, setCopied] = useState(false);

    const resp = searchParams.get("resp");
    const txnref = searchParams.get("txnref") || searchParams.get("txnRef");
    const payRef = searchParams.get("payRef") || searchParams.get("payref");
    const amountKobo = searchParams.get("amount");
    const desc = searchParams.get("desc");

    // campaign_id is embedded in our txnref: "TB_{campaign_id}_{timestamp}"
    const campaignId = txnref ? txnref.split("_")[1] : null;

    const status = parseStatus(resp);
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    const amountNaira =
        amountKobo && !isNaN(Number(amountKobo))
            ? (Number(amountKobo) / 100).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            : null;

    const shareUrl = campaignId
        ? `${window.location.origin}/campaigns/${campaignId}`
        : `${window.location.origin}/campaigns`;
    const shareText = "I just donated to a medical campaign on TrustBridge. Join me in making a difference!";

    const handleCopy = () => {
        navigator.clipboard?.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white py-10">
                <div className="max-w-lg mx-auto ml-10 sm:mx-0 px-4">
                    <Link
                        to="/campaigns"
                        className="inline-flex items-center gap-2 text-emerald-200 hover:text-white text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="size-4" /> Back to campaigns
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">
                        Payment Status
                    </h1>
                    <p className="text-emerald-100 text-sm">
                        Secured by Interswitch Escrow · Zero fraud, absolute trust.
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <div className="max-w-lg mx-auto px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8"
                >
                    {/* Status Icon */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                            className={`w-20 h-20 rounded-full ${config.iconBg} ring-8 ${config.ringColor} flex items-center justify-center mb-5`}
                        >
                            <Icon className={`w-9 h-9 ${config.iconColor}`} />
                        </motion.div>

                        <span
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full mb-3 ${config.badge}`}
                        >
                            {config.badgeLabel}
                        </span>

                        <h2 className="text-xl font-bold text-slate-800 mb-2">
                            {config.heading}
                        </h2>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                            {config.subheading}
                        </p>
                    </div>

                    {/* Transaction Details */}
                    {(amountNaira || txnref || payRef) && (
                        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ReceiptText className="w-3.5 h-3.5" /> Transaction Details
                            </h3>

                            {amountNaira && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-bold text-slate-800">
                                        ₦{amountNaira}
                                    </span>
                                </div>
                            )}

                            {txnref && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Reference</span>
                                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                        {txnref}
                                    </span>
                                </div>
                            )}

                            {payRef && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Payment Ref</span>
                                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                        {payRef}
                                    </span>
                                </div>
                            )}

                            {desc && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Message</span>
                                    <span className="text-slate-700 text-xs text-right max-w-[180px]">
                                        {desc}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Status</span>
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}
                                >
                                    {config.badgeLabel}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        {status === "success" && campaignId && (
                            <Button
                                asChild
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold"
                            >
                                <Link to={`/campaigns/${campaignId}`}>
                                    <Heart className="w-4 h-4 mr-2" />
                                    View Campaign
                                </Link>
                            </Button>
                        )}

                        {status === "failed" && campaignId && (
                            <Button
                                asChild
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold"
                            >
                                <Link to={`/campaigns/${campaignId}`}>
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Link>
                            </Button>
                        )}

                        {status === "pending" && (
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="w-full h-11 rounded-xl font-semibold"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Refresh Status
                            </Button>
                        )}

                        <Button
                            asChild
                            variant="outline"
                            className="w-full h-11 rounded-xl"
                        >
                            <Link to="/campaigns">Browse All Campaigns</Link>
                        </Button>
                    </div>

                    {/* Share block — only on success */}
                    {status === "success" && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-400 text-center mb-3 flex items-center justify-center gap-1.5">
                                <Share2 className="w-3.5 h-3.5" /> Spread the word
                            </p>
                            <div className="flex justify-center gap-2">
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                                >
                                    WhatsApp
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                                >
                                    X / Twitter
                                </a>
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                                >
                                    {copied ? "✓ Copied!" : "Copy Link"}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Trust Badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-emerald-500" /> Interswitch
                        Escrow
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Building2 className="size-4 text-blue-500" /> Hospital-Verified
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-purple-500" /> Zero Fraud
                    </span>
                </div>
            </div>
        </div>
    );
}