import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import CampaignCard from "./CampaignCard";
import { Link } from "react-router-dom";

function CampaignCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-200">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCampaigns({ campaigns, isLoading = false }) {
  const featured = (campaigns || [])
    .filter((c) => c.status === "active")
    .slice(0, 3);

  const showSkeletons = isLoading || featured.length === 0;
  const itemsToShow =
    showSkeletons && featured.length === 0 ? 3 : featured.length;

  if (!isLoading && featured.length === 0)
    return <div className="py-8 text-center">No campaigns yet.</div>;

  return (
    <section id="campaigns" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">
            Featured Campaigns
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">
            Lives waiting for your help
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">
            Every campaign is verified and every donation is escrowed until
            disbursed to the hospital.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <CampaignCardSkeleton key={`skeleton-${i}`} />
              ))
            : featured.map((campaign, i) => (
                <CampaignCard key={campaign.id} campaign={campaign} index={i} />
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-slate-200 hover:bg-slate-50"
            asChild
          >
            <Link to="/campaigns">
              Explore All Campaigns
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

