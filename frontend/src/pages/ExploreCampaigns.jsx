import React, { useState, useEffect } from "react";
import { getCampaigns } from "@/lib/api";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  Zap,
  Clock,
  Heart,
} from "lucide-react";
import CampaignCard from "@/components/trustbridge/CampaignCard";

export default function ExploreCampaigns() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCampaigns()
      .then((data) => {
        console.log(data)
        setCampaigns(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load campaigns:", err);
        setIsLoading(false);
      });
  }, []);

  const filtered = campaigns
    .filter((c) => {
      const matchSearch =
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.hospital_name?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || c.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === "most-funded")
        return (b.raised_amount || 0) - (a.raised_amount || 0);
      if (sortBy === "urgent") {
        const pctA = (a.raised_amount || 0) / (a.target_amount || 1);
        const pctB = (b.raised_amount || 0) / (b.target_amount || 1);
        return pctB - pctA;
      }
      return 0;
    });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "surgery", label: "Surgery" },
    { value: "treatment", label: "Treatment" },
    { value: "medication", label: "Medication" },
    { value: "emergency", label: "Emergency" },
    { value: "rehabilitation", label: "Rehabilitation" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest", icon: Clock },
    { value: "most-funded", label: "Most Funded", icon: TrendingUp },
    { value: "urgent", label: "Almost There", icon: Zap },
  ];

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-2 bg-slate-200 rounded-full w-full" />
        <div className="h-5 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-emerald-200" />
              <span className="text-emerald-200 text-sm font-medium uppercase tracking-wide">
                Verified Medical Campaigns
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Every donation goes directly
              <br />
              to verified hospitals.
            </h1>
            <p className="text-emerald-100 text-base">
              Browse campaigns reviewed by TrustBridge. Funds are held in
              Interswitch escrow until treatment is confirmed.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 max-w-2xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by patient name, condition, or hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 h-13 py-3.5 bg-white text-slate-700 border-0 rounded-xl shadow-lg text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-300"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === opt.value
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Results count */}
        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-500 mb-6"
          >
            {filtered.length === 0
              ? "No campaigns match your criteria"
              : `Showing ${filtered.length} verified campaign${filtered.length !== 1 ? "s" : ""}`}
            {search && (
              <span>
                {" "}
                for{" "}
                <span className="font-semibold text-slate-700">"{search}"</span>
              </span>
            )}
          </motion.p>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              No campaigns found
            </h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Try adjusting your search or filter. New campaigns are added every
              day.
            </p>
            <Button
              variant="outline"
              className="mt-5 rounded-full"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* <Footer /> */}
    </div>
  );
}

