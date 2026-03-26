import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  Building2,
  Calendar,
  ArrowLeft,
  Users,
  Share2,
  CheckCircle2,
  Heart,
  Clock,
  Phone,
  FileText,
  Stethoscope,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DonationWidget from "@/components/trustbridge/DonationWidget";
import { BASE_URL, getCampaignDetails, getCampaignProgress } from "@/lib/api";

const MOCK_DONORS = [];

function toFullUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path}`;
}

function ImageGallery({ cover_image, thumbnail, images }) {
  const allImages = [];
  // Prefer cover_image, fall back to thumbnail
  const primary = toFullUrl(cover_image) || toFullUrl(thumbnail);
  if (primary) allImages.push(primary);
  if (Array.isArray(images)) {
    images.forEach((item) => {
      const path = typeof item === "string" ? item : item?.image_path;
      const full = toFullUrl(path);
      if (full && !allImages.includes(full)) allImages.push(full);
    });
  }
  if (allImages.length === 0)
    allImages.push(
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=900",
    );

  const [active, setActive] = useState(0);
  const prev = () =>
    setActive((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setActive((i) => (i + 1) % allImages.length);

  return (
    <div className="rounded-2xl overflow-hidden shadow-md mb-6">
      <div className="relative">
        <img
          src={allImages[active]}
          alt={`Campaign image ${active + 1}`}
          className="w-full h-[280px] md:h-[400px] object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=900";
          }}
        />
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full">
              {active + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 p-3 bg-slate-100 overflow-x-auto">
          {allImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-emerald-500 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-80"
              }`}
            >
              <img
                src={src}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=200";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("story");

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    Promise.all([getCampaignDetails(id), getCampaignProgress(id)])
      .then(([details, progress]) => {
        if (details) {
          setCampaign({
            ...details,
            raised_amount: Number(
              progress?.raised_amount ?? details.raised_amount ?? 0,
            ),
            target_amount: Number(
              progress?.target_amount ?? details.target_amount ?? 0,
            ),
          });
        } else {
          setCampaign(null);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load campaign:", err);
        setIsLoading(false);
      });
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-7 w-36 mb-6" />
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-[380px] w-full rounded-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[480px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-9 h-9 text-red-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Campaign Not Found
          </h2>
          <p className="text-slate-500 mb-6 max-w-sm">
            This campaign may have been removed or doesn't exist.
          </p>
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
          >
            <Link to="/campaigns">Browse Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  const raised = campaign.raised_amount || 0;
  const target = campaign.target_amount || 1;
  const percentage = Math.min(Math.round((raised / target) * 100), 100);
  const shareText = `Help ${campaign.patient_name}: ${campaign.title}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to campaigns
        </Link>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ImageGallery
                cover_image={campaign.cover_image}
                thumbnail={campaign.thumbnail_image}
                images={campaign.images}
              />

              {campaign.category && (
                <div className="-mt-3 mb-4">
                  <span className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-full capitalize">
                    {campaign.category}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-emerald-50 text-emerald-700 border-0 gap-1 px-3 py-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Campaign
                </Badge>
                <Badge className="bg-blue-50 text-blue-700 border-0 gap-1 px-3 py-1">
                  <Building2 className="w-3 h-3" /> {campaign.hospital_name}
                </Badge>
                {(campaign.hospital_address || campaign.address) && (
                  <Badge className="bg-slate-50 text-slate-600 border-0 gap-1 px-3 py-1">
                    <MapPin className="w-3 h-3" />{" "}
                    {campaign.hospital_address || campaign.address}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight mb-4">
                {campaign.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(campaign.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {MOCK_DONORS.length} donors
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {percentage < 100
                    ? `${100 - percentage}% remaining`
                    : "Fully funded!"}
                </span>
              </div>

              <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
                {["story", "updates", "donors"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      activeTab === tab
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab === "donors"
                      ? `Donors (${MOCK_DONORS.length})`
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "story" && (
                  <motion.div
                    key="story"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                      <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-400" /> Patient's
                        Story
                      </h2>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                        {campaign.story || "No story provided yet."}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                      <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-400" />{" "}
                        Medical Details
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                            Patient Name
                          </p>
                          <p className="font-medium text-slate-700">
                            {campaign.patient_name}
                          </p>
                        </div>
                        {campaign.beneficiary_name && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                              Beneficiary
                            </p>
                            <p className="font-medium text-slate-700">
                              {campaign.beneficiary_name}
                            </p>
                          </div>
                        )}
                        {campaign.diagnosis_summary && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                              Diagnosis Summary
                            </p>
                            <p className="font-medium text-slate-700">
                              {campaign.diagnosis_summary}
                            </p>
                          </div>
                        )}
                        {/* {campaign.contact_phone && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                              Contact
                            </p>
                            <a
                              href={`tel:${campaign.contact_phone}`}
                              className="font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {campaign.contact_phone}
                            </a>
                          </div>
                        )} */}
                      </div>
                      {/* {campaign.medical_document_path && (
                        <a
                          href={`${BASE_URL}/${campaign.medical_document_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          View Medical Document
                        </a>
                      )} */}
                    </div>
                  </motion.div>
                )}

                {activeTab === "updates" && (
                  <motion.div
                    key="updates"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6"
                  >
                    <div className="flex flex-col items-center py-10 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-5 h-5 text-slate-300" />
                      </div>
                      <h3 className="text-slate-700 font-medium mb-1">
                        No updates yet
                      </h3>
                      <p className="text-slate-400 text-sm">
                        The campaign creator will post updates here as the
                        treatment progresses.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "donors" && (
                  <motion.div
                    key="donors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50"
                  >
                    {MOCK_DONORS.length === 0 ? (
                      <div className="flex flex-col items-center py-10 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <Users className="w-5 h-5 text-slate-300" />
                        </div>
                        <h3 className="text-slate-700 font-medium mb-1">
                          No donors yet
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Be the first to support this campaign.
                        </p>
                      </div>
                    ) : (
                      MOCK_DONORS.map((donor, i) => (
                        <div key={i} className="flex items-start gap-4 p-4">
                          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-emerald-700 font-bold text-sm">
                              {donor.name[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="font-semibold text-slate-800 text-sm">
                                {donor.name}
                              </span>
                              <span className="text-sm font-bold text-emerald-600 shrink-0">
                                ₦{donor.amount.toLocaleString()}
                              </span>
                            </div>
                            {donor.message && (
                              <p className="text-slate-500 text-sm leading-snug">
                                {donor.message}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {donor.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-slate-400" /> Help spread the
                  word
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Sharing this campaign can make a huge difference. Every share
                  brings a potential donor closer.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors text-center"
                  >
                    Share on WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors text-center"
                  >
                    Share on X
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <DonationWidget campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  );
}
