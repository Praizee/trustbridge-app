import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck,
  Heart,
  Share2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import ProgressBar from "./ProgressBar";
import { initializeDonation, verifyDonation } from "@/lib/api";

const INTERSWITCH_INLINE_SCRIPT =
  "https://qa.interswitchng.com/collections/public/javascripts/inline-checkout.js";

const MERCHANT_CODE = "MX19437";
const PAY_ITEM_ID = "MX19437_MERCHANT_APP";

const presets = [5000, 10000, 25000, 50000, 100000];

// Load Interswitch inline script once per session
function loadInterswitchScript() {
  return new Promise((resolve, reject) => {
    if (window.webpayCheckout) return resolve(); // already loaded
    const existing = document.getElementById("interswitch-inline");
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "interswitch-inline";
    script.src = INTERSWITCH_INLINE_SCRIPT;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load payment script."));
    document.head.appendChild(script);
  });
}

export default function DonationWidget({ campaign }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [donationError, setDonationError] = useState(null);

  const raised = campaign?.raised_amount || 0;
  const target = campaign?.target_amount || 1;
  const percentage = Math.min((raised / target) * 100, 100);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Help ${campaign?.patient_name}: ${campaign?.title}`;

  const parsedAmount = Number(amount);
  const amountValid = parsedAmount >= 100;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canDonate = amountValid && emailValid && name.trim() && !isDonating;

  // Preload script when component mounts so it's ready when user clicks
  useEffect(() => {
    loadInterswitchScript().catch(() => {});
  }, []);

  const handleDonate = async () => {
    if (!canDonate) return;
    setDonationError(null);
    setIsDonating(true);

    try {
      // 1. Initiate — get reference, amount, email from backend
      const initiated = await initializeDonation({
        campaign_id: campaign.id,
        name: anonymous ? "Anonymous" : name.trim(),
        email: email.trim(),
        amount: parsedAmount,
      });

      const { reference, amount: confirmedAmount } = initiated;

      // 2. Ensure Interswitch inline script is loaded
      await loadInterswitchScript();

      if (!window.webpayCheckout) {
        throw new Error("Payment gateway unavailable. Please try again.");
      }

      // 3. Trigger inline checkout modal
      window.webpayCheckout({
        merchant_code: MERCHANT_CODE,
        pay_item_id: PAY_ITEM_ID,
        txn_ref: reference,
        amount: (confirmedAmount ?? parsedAmount) * 100, // MUST be in kobo
        currency: 566, // NGN
        cust_id: email.trim(),
        site_redirect_url: `${window.location.origin}/payment/callback`,

        onComplete: async function (response) {
          // 4. User completed payment — response.txnref is our reference
          const txnRef = response?.txnref || response?.txn_ref || reference;

          try {
            // 5. Verify with backend — pass reference and original naira amount
            const verified = await verifyDonation(txnRef, confirmedAmount ?? parsedAmount);

            if (verified?.status === 200) {
              toast.success("Donation confirmed! Thank you 🙏");
              navigate(
                `/payment/callback?txn_ref=${encodeURIComponent(txnRef)}&amount=${confirmedAmount ?? parsedAmount}&verified=1`
              );
            } else {
              toast.error(verified?.message || "Payment could not be verified.");
              navigate(
                `/payment/callback?txn_ref=${encodeURIComponent(txnRef)}&amount=${confirmedAmount ?? parsedAmount}&verified=0`
              );
            }
          } catch (verifyErr) {
            // Verification network error — still redirect, callback page will retry
            navigate(
              `/payment/callback?txn_ref=${encodeURIComponent(txnRef)}&amount=${confirmedAmount ?? parsedAmount}`
            );
          }
        },

        mode: "LIVE",
      });

      // Spinner stays on while modal is open; reset on error
    } catch (err) {
      console.error("Donation failed:", err);
      const msg = err.message || "Could not initialize payment. Please try again.";
      setDonationError(msg);
      toast.error(msg);
      setIsDonating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-24"
    >
      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-slate-800">
            ₦{raised.toLocaleString()}
          </span>
          <span className="text-sm text-slate-400">
            of ₦{target.toLocaleString()}
          </span>
        </div>
        <ProgressBar raised={raised} target={target} size="md" />
      </div>

      <div className="text-center py-2 mb-4">
        <span className="text-sm text-slate-500">
          {Math.round(percentage)}% funded
        </span>
      </div>

      <div className="space-y-4">
        {/* Amount presets */}
        <div>
          <Label className="text-xs text-slate-500 mb-2 block">
            Quick amounts (₦)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(String(preset))}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  amount === String(preset)
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                ₦{preset.toLocaleString()}
              </button>
            ))}
            <Input
              placeholder="Other"
              type="number"
              min={100}
              value={presets.includes(Number(amount)) ? "" : amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-sm text-center"
            />
          </div>
          {amount && !amountValid && (
            <p className="text-xs text-red-500 mt-1">
              Minimum donation is ₦100
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="Your full name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={anonymous}
            className="text-sm"
          />
        </div>

        <div>
          <Input
            placeholder="Email address * (for receipt)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`text-sm ${
              email && !emailValid ? "border-red-300" : ""
            }`}
          />
          {email && !emailValid && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid email
            </p>
          )}
        </div>

        <div>
          <Textarea
            placeholder="Leave a message of support... (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-slate-600">Donate anonymously</Label>
          <Switch checked={anonymous} onCheckedChange={setAnonymous} />
        </div>

        {donationError && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{donationError}</span>
          </div>
        )}

        <Button
          onClick={handleDonate}
          disabled={!canDonate}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDonating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Opening payment…
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Donate Now
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Secured by Interswitch Escrow
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100">
        <p className="text-xs text-slate-400 mb-3 text-center">
          Share this campaign
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
            onClick={() => navigator.clipboard?.writeText(shareUrl)}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
          >
            <Share2 className="w-3 h-3 inline mr-1" />
            Copy Link
          </button>
        </div>
      </div>
    </motion.div>
  );
}