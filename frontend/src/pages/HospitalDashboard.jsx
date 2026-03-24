import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileCheck,
  Send,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Banknote,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import ProgressBar from "@/components/trustbridge/ProgressBar";

export default function HospitalDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState({});

  const fetchCampaigns = () => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const allFunded = campaigns.filter(
    (c) =>
      c.status === "funded" ||
      c.status === "disbursement_requested" ||
      c.status === "disbursed",
  );

  const handleFileUpload = async (campaignId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const { file_url } = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file }),
      }).then((res) => res.json());
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_url: file_url }),
      });
      toast.success("Invoice uploaded successfully!");
      fetchCampaigns();
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    }
    setUploading((prev) => ({ ...prev, [campaignId]: false }));
  };

  const handleRequestDisbursement = async (campaign) => {
    try {
      await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "disbursement_requested" }),
      });
      toast.success("Disbursement request submitted!");
      fetchCampaigns();
    } catch (err) {
      toast.error("Failed to submit request.");
      console.error(err);
    }
  };

  const statusStyles = {
    funded: {
      label: "Awaiting Invoice",
      color: "bg-blue-100 text-blue-700",
      dot: "bg-blue-500",
    },
    disbursement_requested: {
      label: "Pending Approval",
      color: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    },
    disbursed: {
      label: "Disbursed",
      color: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    },
  };

  const totalFunded = allFunded.reduce((s, c) => s + (c.target_amount || 0), 0);
  const pendingInvoices = allFunded.filter(
    (c) => c.status === "funded" && !c.invoice_url,
  ).length;
  const disbursedCount = allFunded.filter(
    (c) => c.status === "disbursed",
  ).length;

  const stats = [
    {
      label: "Funded Campaigns",
      value: allFunded.length,
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Disbursed",
      value: disbursedCount,
      icon: Banknote,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Value",
      value: `₦${(totalFunded / 1_000_000).toFixed(1)}M`,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Hospital Admin
                </h1>
                <p className="text-slate-500 text-sm">
                  Manage funded campaigns, upload invoices, and request
                  disbursements.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
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

        {/* Info Banner */}
        {pendingInvoices > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 mb-6"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {pendingInvoices} campaign{pendingInvoices > 1 ? "s" : ""}{" "}
                waiting for invoice upload
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Upload a stamped hospital invoice to unlock disbursement
                requests.
              </p>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-sm border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 text-sm">
                Funded Campaigns
              </h2>
              <span className="text-xs text-slate-400">
                {allFunded.length} total
              </span>
            </div>
            {isLoading ? (
              <div className="p-8 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/60">
                      <TableHead className="text-xs font-semibold text-slate-500">
                        Campaign
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 min-w-[140px]">
                        Progress
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500">
                        Invoice
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allFunded.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Building2 className="w-8 h-8 text-slate-200" />
                            <p className="text-sm">No funded campaigns yet.</p>
                            <p className="text-xs">
                              Campaigns that reach their goal will appear here.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      allFunded.map((c) => {
                        const s = statusStyles[c.status] || {
                          label: c.status,
                          color: "bg-slate-100 text-slate-600",
                          dot: "bg-slate-400",
                        };
                        const hasInvoice = !!c.invoice_url;
                        const isFull =
                          (c.raised_amount || 0) >= (c.target_amount || 1);
                        return (
                          <TableRow key={c.id} className="hover:bg-slate-50/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                  <img
                                    src={
                                      c.image_url ||
                                      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=80"
                                    }
                                    alt={c.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 text-sm leading-tight line-clamp-1 max-w-[180px]">
                                    {c.title}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {c.patient_name}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-sm text-slate-800">
                                ₦{(c.target_amount || 0).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              <ProgressBar
                                raised={c.raised_amount || 0}
                                target={c.target_amount || 1}
                                size="sm"
                                showLabel={false}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                                />
                                <Badge
                                  className={`${s.color} border-0 text-xs`}
                                >
                                  {s.label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {hasInvoice ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <a
                                    href={c.invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-0.5 hover:underline"
                                  >
                                    View{" "}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              ) : isFull ? (
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.png"
                                    onChange={(e) => handleFileUpload(c.id, e)}
                                  />
                                  <div className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors">
                                    <Upload className="w-3.5 h-3.5" />
                                    {uploading[c.id]
                                      ? "Uploading…"
                                      : "Upload Invoice"}
                                  </div>
                                </label>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-400 text-xs">
                                  <AlertCircle className="w-3 h-3" /> Not funded
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                disabled={!hasInvoice || c.status !== "funded"}
                                onClick={() => handleRequestDisbursement(c)}
                                className="text-xs h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Request
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Trust footer */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            How Disbursement Works
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Campaign Fully Funded",
                desc: "Campaign reaches 100% of its target amount.",
              },
              {
                step: "2",
                title: "Upload Official Invoice",
                desc: "Hospital uploads a stamped, official treatment invoice.",
              },
              {
                step: "3",
                title: "Funds Released",
                desc: "After TrustBridge review, Interswitch settles funds to the hospital's verified account.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

