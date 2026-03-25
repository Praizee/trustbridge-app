// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   LayoutDashboard,
//   Plus,
//   ShieldCheck,
//   TrendingUp,
//   Users,
//   Target,
//   Eye,
//   ExternalLink,
// } from "lucide-react";
// import { toast } from "sonner";
// import ProgressBar from "@/components/trustbridge/ProgressBar";

// export default function CreatorDashboard() {
//   const [campaigns, setCampaigns] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchCampaigns = () => {
//     setIsLoading(true);
//     fetch("/api/campaigns")
//       .then((res) => res.json())
//       .then((data) => {
//         setCampaigns(data);
//         setIsLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setIsLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchCampaigns();
//   }, []);

//   const statusStyles = {
//     active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
//     funded: { label: "Fully Funded", color: "bg-blue-100 text-blue-700" },
//     disbursement_requested: {
//       label: "Disbursement Pending",
//       color: "bg-amber-100 text-amber-700",
//     },
//     disbursed: { label: "Disbursed", color: "bg-purple-100 text-purple-700" },
//   };

//   const totalRaised = campaigns.reduce((s, c) => s + (c.raised_amount || 0), 0);
//   const totalTarget = campaigns.reduce((s, c) => s + (c.target_amount || 0), 0);
//   const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

//   const stats = [
//     {
//       label: "Total Raised",
//       value: `₦${totalRaised.toLocaleString()}`,
//       icon: TrendingUp,
//       color: "text-emerald-600",
//       bg: "bg-emerald-50",
//     },
//     {
//       label: "Campaigns",
//       value: campaigns.length,
//       icon: LayoutDashboard,
//       color: "text-blue-600",
//       bg: "bg-blue-50",
//     },
//     {
//       label: "Active Now",
//       value: activeCampaigns,
//       icon: Target,
//       color: "text-amber-600",
//       bg: "bg-amber-50",
//     },
//     {
//       label: "Donors (est.)",
//       value: campaigns.length * 12,
//       icon: Users,
//       color: "text-purple-600",
//       bg: "bg-purple-50",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-100 px-4 py-8">
//         <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//           >
//             <div className="flex items-center gap-2 mb-1">
//               <LayoutDashboard className="w-5 h-5 text-emerald-600" />
//               <h1 className="text-2xl font-bold text-slate-800">
//                 Creator Dashboard
//               </h1>
//             </div>
//             <p className="text-slate-500 text-sm">
//               Manage all your fundraising campaigns.
//             </p>
//           </motion.div>
//           <Button
//             asChild
//             className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-5 shrink-0"
//           >
//             <Link to="/create">
//               <Plus className="w-4 h-4 mr-2" /> New Campaign
//             </Link>
//           </Button>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto px-4 py-8">
//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           {stats.map((stat, i) => (
//             <motion.div
//               key={stat.label}
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.07 }}
//             >
//               <Card className="shadow-sm border-slate-100">
//                 <CardContent className="p-5">
//                   <div
//                     className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}
//                   >
//                     <stat.icon className={`w-4 h-4 ${stat.color}`} />
//                   </div>
//                   <p className="text-xl font-bold text-slate-800">
//                     {stat.value}
//                   </p>
//                   <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>

//         {/* Campaign List */}
//         <div className="space-y-4">
//           <div className="flex items-center justify-between mb-2">
//             <h2 className="text-base font-semibold text-slate-700">
//               Your Campaigns
//             </h2>
//             <span className="text-xs text-slate-400">
//               {campaigns.length} total
//             </span>
//           </div>

//           {isLoading ? (
//             Array.from({ length: 3 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse"
//               >
//                 <div className="flex gap-4">
//                   <div className="w-20 h-20 bg-slate-200 rounded-xl shrink-0" />
//                   <div className="flex-1 space-y-3">
//                     <div className="h-4 bg-slate-200 rounded w-2/3" />
//                     <div className="h-3 bg-slate-200 rounded w-1/3" />
//                     <div className="h-2 bg-slate-200 rounded-full" />
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : campaigns.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center"
//             >
//               <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Plus className="w-6 h-6 text-slate-300" />
//               </div>
//               <h3 className="font-semibold text-slate-700 mb-1">
//                 No campaigns yet
//               </h3>
//               <p className="text-slate-400 text-sm mb-5">
//                 Create your first medical campaign and start making an impact.
//               </p>
//               <Button
//                 asChild
//                 className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-6"
//               >
//                 <Link to="/create">Create First Campaign</Link>
//               </Button>
//             </motion.div>
//           ) : (
//             campaigns.map((c, i) => {
//               const s = statusStyles[c.status] || {
//                 label: c.status,
//                 color: "bg-slate-100 text-slate-600",
//               };
//               const pct = Math.min(
//                 Math.round(
//                   ((c.raised_amount || 0) / (c.target_amount || 1)) * 100,
//                 ),
//                 100,
//               );
//               return (
//                 <motion.div
//                   key={c.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.05 }}
//                 >
//                   <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
//                     <CardContent className="p-5">
//                       <div className="flex gap-4">
//                         {/* Thumbnail */}
//                         <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
//                           <img
//                             src={
//                               c.image_url ||
//                               "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=160"
//                             }
//                             alt={c.title}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start justify-between gap-3 mb-1">
//                             <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1">
//                               {c.title}
//                             </h3>
//                             <Badge
//                               className={`${s.color} border-0 text-xs shrink-0`}
//                             >
//                               {s.label}
//                             </Badge>
//                           </div>
//                           <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
//                             <ShieldCheck className="w-3 h-3 text-emerald-500" />
//                             {c.hospital_name}
//                           </p>
//                           <ProgressBar
//                             raised={c.raised_amount || 0}
//                             target={c.target_amount || 1}
//                             size="sm"
//                           />
//                           <div className="flex items-center justify-between mt-2">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-sm font-bold text-slate-800">
//                                 ₦{(c.raised_amount || 0).toLocaleString()}
//                               </span>
//                               <span className="text-xs text-slate-400">
//                                 of ₦{(c.target_amount || 0).toLocaleString()}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs text-emerald-600 font-semibold">
//                                 {pct}%
//                               </span>
//                               <Link
//                                 to={`/campaigns/${c.id}`}
//                                 className="text-slate-400 hover:text-slate-600 transition-colors"
//                               >
//                                 <ExternalLink className="w-3.5 h-3.5" />
//                               </Link>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
  Target,
  Eye,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import ProgressBar from "@/components/trustbridge/ProgressBar";
import { getCampaigns } from "@/lib/api";

export default function CreatorDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = () => {
    setIsLoading(true);
    getCampaigns()
      .then((data) => {
        setCampaigns(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load campaigns.");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const statusStyles = {
    active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
    funded: { label: "Fully Funded", color: "bg-blue-100 text-blue-700" },
    disbursement_requested: {
      label: "Disbursement Pending",
      color: "bg-amber-100 text-amber-700",
    },
    disbursed: { label: "Disbursed", color: "bg-purple-100 text-purple-700" },
  };

  const totalRaised = campaigns.reduce((s, c) => s + (c.raised_amount || 0), 0);
  const totalTarget = campaigns.reduce((s, c) => s + (c.target_amount || 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  const stats = [
    {
      label: "Total Raised",
      value: `₦${totalRaised.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Campaigns",
      value: campaigns.length,
      icon: LayoutDashboard,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Now",
      value: activeCampaigns,
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Donors (est.)",
      value: campaigns.length * 12,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-800">
                Creator Dashboard
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              Manage all your fundraising campaigns.
            </p>
          </motion.div>
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-5 shrink-0"
          >
            <Link to="/create">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="shadow-sm border-slate-100">
                <CardContent className="p-5">
                  <div
                    className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-slate-700">
              Your Campaigns
            </h2>
            <span className="text-xs text-slate-400">
              {campaigns.length} total
            </span>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-2 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">
                No campaigns yet
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                Create your first medical campaign and start making an impact.
              </p>
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-6"
              >
                <Link to="/create">Create First Campaign</Link>
              </Button>
            </motion.div>
          ) : (
            campaigns.map((c, i) => {
              const s = statusStyles[c.status] || {
                label: c.status,
                color: "bg-slate-100 text-slate-600",
              };
              const pct = Math.min(
                Math.round(
                  ((c.raised_amount || 0) / (c.target_amount || 1)) * 100,
                ),
                100,
              );
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={
                              c.cover_image ||
                              "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=160"
                            }
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1">
                              {c.title}
                            </h3>
                            <Badge
                              className={`${s.color} border-0 text-xs shrink-0`}
                            >
                              {s.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            {c.hospital_name}
                          </p>
                          <ProgressBar
                            raised={c.raised_amount || 0}
                            target={c.target_amount || 1}
                            size="sm"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-slate-800">
                                ₦{(c.raised_amount || 0).toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-400">
                                of ₦{(c.target_amount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-emerald-600 font-semibold">
                                {pct}%
                              </span>
                              <Link
                                to={`/campaigns/${c.id}`}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
