import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Heart, Share2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ProgressBar from "./ProgressBar";
import { initializeDonation } from "@/lib/api";

const presets = [5000, 10000, 25000, 50000, 100000];

export default function DonationWidget({ campaign }) {
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
  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canDonate = amountValid && emailValid && !isDonating;

  const handleDonate = async () => {
    if (!canDonate) return;
    setDonationError(null);
    setIsDonating(true);

    try {
      const payload = {
        campaign_id: campaign.id,
        donor_name: anonymous ? "Anonymous" : (name.trim() || "Anonymous"),
        donor_email: email.trim() || "donor@trustbridge.ng",
        amount: parsedAmount,
      };

      const data = await initializeDonation(payload);

      // Build and auto-submit Interswitch Web Checkout form
      const fields = data.checkout_fields;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.checkout_url;

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Donation init failed:", err);
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
            <p className="text-xs text-red-500 mt-1">Minimum donation is ₦100</p>
          )}
        </div>

        <div>
          <Input
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={anonymous}
            className="text-sm"
          />
        </div>

        <div>
          <Input
            placeholder="Email address (for receipt)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`text-sm ${email && !emailValid ? "border-red-300" : ""}`}
          />
          {email && !emailValid && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid email</p>
          )}
        </div>

        <div>
          <Textarea
            placeholder="Leave a message of support..."
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
              Initializing payment...
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
