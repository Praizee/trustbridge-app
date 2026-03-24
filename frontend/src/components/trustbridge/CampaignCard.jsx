import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

const BASE_URL = "https://trust.ezirimkingdom.com.ng";
const FALLBACK = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600";

function toFullUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path}`;
}

function AutoCarousel({ cover_image, thumbnail, images }) {
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

  if (allImages.length === 0) allImages.push(FALLBACK);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % allImages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [allImages.length]);

  return (
    <div className="relative overflow-hidden aspect-[4/3]">
      {allImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          onError={(e) => { e.target.src = FALLBACK; }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-105 transition-transform duration-500 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Verified badge */}
      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
        <Badge className="bg-white/90 text-emerald-700 backdrop-blur-sm border-0 text-xs font-medium gap-1 px-2.5 py-1 shadow-sm">
          <ShieldCheck className="w-3 h-3" /> Verified
        </Badge>
      </div>

      {/* Dot indicators */}
      {allImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {allImages.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "w-3 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CampaignCard({ campaign, index = 0 }) {
  const raised = Number(campaign.raised_amount) || 0;
  const target = Number(campaign.target_amount) || 1;
  const pct = Math.min(Math.round((raised / target) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="group"
    >
      <Link to={`/campaigns/${campaign.id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 h-full">

          <AutoCarousel
            cover_image={campaign.cover_image}
            thumbnail={campaign.thumbnail_image}
            images={campaign.images}
          />

          {/* Body */}
          <div className="p-5">
            <h3 className="font-semibold text-slate-800 text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-emerald-700 transition-colors">
              {campaign.title}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {campaign.hospital_name}
            </p>

            <ProgressBar raised={raised} target={target} size="sm" />

            <div className="flex justify-between items-center mt-3">
              <div>
                <span className="text-base font-bold text-slate-800">₦{raised.toLocaleString()}</span>
                <span className="text-xs text-slate-400 ml-1">raised</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600">{pct}%</span>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}