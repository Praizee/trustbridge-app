import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { getLatestFundedCampaign } from "@/lib/api";
import { Skeleton } from "../ui/skeleton";

export default function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [latestCampaign, setLatestCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestCampaign = async () => {
      try {
        setLoading(true);
        const campaign = await getLatestFundedCampaign();
        setLatestCampaign(campaign);
      } catch (error) {
        console.error("Failed to fetch latest funded campaign:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCampaign();
  }, []);

  const handleStartCampaign = () => {
    navigate(isAuthenticated ? "/create" : "/login");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Secured by Interswitch Escrow
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.1] tracking-tight">
              Zero Fraud.
              <br />
              Absolute Trust.
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Direct to Care.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Every naira you donate is held in Interswitch-powered escrow and
              disbursed directly to the hospital's verified corporate account.
              No middlemen. No leaks.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-emerald-200"
                onClick={() =>
                  document
                    .getElementById("campaigns")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Campaigns
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base border-slate-200 hover:bg-slate-50"
                onClick={handleStartCampaign}
              >
                Start a Campaign
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {[
                  "photo-1494790108377-be9c29b29330",
                  "photo-1507003211169-0a1dd7228f2d",
                  "photo-1438761681033-6461ffad8d80",
                  "photo-1472099645785-5658abf4ff4e",
                ].map((id, i) => (
                  <img
                    key={i}
                    src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&crop=face`}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    alt=""
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">2,000+</span>{" "}
                donors trust TrustBridge
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden md:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=500&fit=crop"
                alt="Medical care"
                className="w-full h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  {loading ? (
                    <LatestCampaignSkeleton />
                  ) : latestCampaign ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">
                          Latest campaign funded
                        </p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
                          {latestCampaign.title}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-emerald-600">
                          {`₦${Number(
                            latestCampaign.raised_amount,
                          ).toLocaleString()}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {`${Math.round(
                            (latestCampaign.raised_amount /
                              latestCampaign.target_amount) *
                              100,
                          )}% funded of ₦${Number(
                            latestCampaign.target_amount,
                          ).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-slate-500 py-4">
                      No campaign data available.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Escrow Protected</p>
                  <p className="text-sm font-bold text-slate-800">₦50M+</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LatestCampaignSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-4 w-24 mb-1.5" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="text-right">
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

