import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  CheckCircle2,
  Banknote,
  ShieldCheck,
  LayoutList,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import ProgressBar from "@/components/trustbridge/ProgressBar";
import {
  getHospitalCampaigns,
  verifyHospital,
  requestWithdrawal,
} from "@/lib/api";

const STATUS_COLORS = {
  active: "bg-blue-100 text-blue-700",
  funded: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-700",
};

export default function HospitalDashboard() {
  const [tab, setTab] = useState("campaigns");
  const [hospital, setHospital] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requesting, setRequesting] = useState({});

  const [verifyForm, setVerifyForm] = useState({
    hospital_name: "",
    hospital_address: "",
    verification_method: "TIN",
    verification_value: "",
    bank_account: "",
    bank_name: "",
    bank_code: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getHospitalCampaigns();
      setHospital(data.hospital ?? null);
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      toast.error(err.message || "Failed to load campaigns.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await verifyHospital(verifyForm);
      toast.success("Hospital verified successfully!");
      await fetchData();
      setTab("campaigns");
    } catch (err) {
      toast.error(err.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

const handleRequestWithdrawal = async (campaign) => {
  if (!campaign?.id) {
    toast.error("Invalid campaign");
    return;
  }

  if (!campaign.raised_amount || campaign.raised_amount <= 0) {
    toast.error("No funds available");
    return;
  }

  setRequesting((prev) => ({ ...prev, [campaign.id]: true }));

  try {
    const res = await requestWithdrawal({
      campaign_id: Number(campaign.id),
      amount: Number(campaign.raised_amount),
    });

    // 🔥 FIX: SAFE CHECK
    if (!res) {
      throw new Error("No response from server");
    }

    if (res.status !== 200) {
      throw new Error(res.message || "Request failed");
    }

    toast.success(res.message);

    await fetchData(); // refresh campaigns

  } catch (err) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setRequesting((prev) => ({ ...prev, [campaign.id]: false }));
  }
};

  const isVerified = hospital?.verified === 1;
  const totalRaised = campaigns.reduce((s, c) => s + (c.raised_amount || 0), 0);
  const fullyFunded = campaigns.filter((c) => c.is_fully_funded).length;

  const stats = [
    {
      label: "Campaigns",
      value: campaigns.length,
      icon: LayoutList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Fully Funded",
      value: fullyFunded,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Raised",
      value: `₦${(totalRaised / 1_000).toFixed(0)}K`,
      icon: Banknote,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Verified",
      value: isVerified ? "Yes" : "No",
      icon: ShieldCheck,
      color: isVerified ? "text-emerald-600" : "text-amber-600",
      bg: isVerified ? "bg-emerald-50" : "bg-amber-50",
    },
  ];

  const tabs = [
    { id: "campaigns", label: "My Campaigns", icon: LayoutList },
    { id: "verification", label: "Verification", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {hospital?.name || "Hospital Dashboard"}
                </h1>
                <p className="text-slate-500 text-sm">
                  Manage campaigns, verification, and withdrawals.
                </p>
              </div>
              {isVerified && (
                <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
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
                  <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-100 rounded-xl p-1 w-fit shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Campaigns Tab */}
        {tab === "campaigns" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-sm border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-700 text-sm">
                  Attached Campaigns
                </h2>
                <span className="text-xs text-slate-400">
                  {campaigns.length} total
                </span>
              </div>

              {isLoading ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
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
                          Target
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Raised
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 min-w-[140px]">
                          Progress
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <Building2 className="w-8 h-8 text-slate-200" />
                              <p className="text-sm">No campaigns attached yet.</p>
                              <p className="text-xs">
                                Campaigns created for your hospital will appear here.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        campaigns.map((c) => (
                          <TableRow key={c.id} className="hover:bg-slate-50/50">
                            <TableCell>
                              <p className="font-medium text-slate-800 text-sm line-clamp-1 max-w-[200px]">
                                {c.title}
                              </p>
                              <p className="text-xs text-slate-400">{c.patient_name}</p>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-sm text-slate-800">
                                ₦{(c.target_amount || 0).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-slate-600">
                                ₦{(c.raised_amount || 0).toLocaleString()}
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
                              <Badge
                                className={`${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-600"} border-0 text-xs`}
                              >
                                {c.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                disabled={
  !c.is_fully_funded ||
  !!requesting[c.id] ||
  !c.raised_amount ||
  c.raised_amount <= 0
}
                                onClick={() => handleRequestWithdrawal(c)}
                                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40"
                              >
                                <Wallet className="w-3 h-3 mr-1" />
                                {requesting[c.id] ? "Requesting…" : "Withdraw"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Verification Tab */}
        {tab === "verification" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {isVerified ? (
              <Card className="shadow-sm border-slate-100">
                <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Hospital Verified
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                      Your hospital is verified and visible to campaign creators when they
                      select a hospital.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border-slate-100">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-700 text-sm">
                    Verify Your Hospital
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verification unlocks campaign attachment and fund withdrawals.
                  </p>
                </div>
                <CardContent className="p-6">
                  {!isLoading && !isVerified && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 max-w-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Your hospital is not yet verified. Complete the form below to get verified via TIN or CAC.
                      </p>
                    </div>
                  )}
                  <form onSubmit={handleVerify} className="space-y-5 max-w-lg">
                    <div>
                      <Label className="text-slate-700 text-sm">Hospital Name</Label>
                      <Input
                        className="mt-1"
                        placeholder="University Teaching Hospital"
                        value={verifyForm.hospital_name}
                        onChange={(e) =>
                          setVerifyForm((f) => ({ ...f, hospital_name: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 text-sm">Hospital Address</Label>
                      <Input
                        className="mt-1"
                        placeholder="Port Harcourt, Rivers State"
                        value={verifyForm.hospital_address}
                        onChange={(e) =>
                          setVerifyForm((f) => ({ ...f, hospital_address: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 text-sm">Verification Method</Label>
                      <div className="flex gap-3 mt-2">
                        {["TIN", "CAC"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() =>
                              setVerifyForm((f) => ({ ...f, verification_method: method }))
                            }
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                              verifyForm.verification_method === method
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-700 text-sm">
                        {verifyForm.verification_method === "TIN"
                          ? "TIN Number"
                          : "Registered Company Name"}
                      </Label>
                      <p className="text-xs text-slate-400 mt-0.5 mb-1">
                        {verifyForm.verification_method === "TIN"
                          ? "Enter your hospital's Tax Identification Number"
                          : "Enter the company name exactly as registered with CAC"}
                      </p>
                      <Input
                        className="mt-1"
                        placeholder={
                          verifyForm.verification_method === "TIN"
                            ? "e.g. 08120451-1001"
                            : "e.g. University of Port Harcourt Teaching Hospital"
                        }
                        value={verifyForm.verification_value}
                        onChange={(e) =>
                          setVerifyForm((f) => ({ ...f, verification_value: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 text-sm">Bank Account Number</Label>
                        <Input
                          className="mt-1"
                          placeholder="0123456789"
                          value={verifyForm.bank_account}
                          onChange={(e) =>
                            setVerifyForm((f) => ({ ...f, bank_account: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-sm">Bank Code</Label>
                        <Input
                          className="mt-1"
                          placeholder="044"
                          value={verifyForm.bank_code}
                          onChange={(e) =>
                            setVerifyForm((f) => ({ ...f, bank_code: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-700 text-sm">Bank Name</Label>
                      <Input
                        className="mt-1"
                        placeholder="Access Bank"
                        value={verifyForm.bank_name}
                        onChange={(e) =>
                          setVerifyForm((f) => ({ ...f, bank_name: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isVerifying}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      {isVerifying ? "Verifying…" : "Verify Hospital"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
