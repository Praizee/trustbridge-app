import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Eye,
  Banknote,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  MapPin,
  CreditCard,
  Clock,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPendingHospitalRequests,
  approveHospital,
  getCampaigns,
  getHospitals,
  updateCampaignStatus,
  deleteCampaignAdmin,
  BASE_URL,
  getAdminDashboardStats,
  getAllUsers,
  activateUser,
  suspendUser,
  deleteUser,
  getAllHospitals,
  verifyHospitalAdmin,
  disableHospital,
  getPendingWithdrawals,
  approveWithdrawal,
} from "@/lib/api";

export default function SuperAdminDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUserActing, setIsUserActing] = useState(false);
  const [isWithdrawalApproving, setIsWithdrawalApproving] = useState(false);
  const [isHospitalActing, setIsHospitalActing] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [reviewCampaign, setReviewCampaign] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // FIX: added bank_name to approveForm state
  const [approveForm, setApproveForm] = useState({
    bank_account: "",
    bank_name: "",
    bank_code: "",
  });

  const fetchAll = () => {
    Promise.all([
      getCampaigns(),
      getAllHospitals(),
      getPendingHospitalRequests(),
      getAllUsers(),
      getPendingWithdrawals(),
      getAdminDashboardStats(),
    ])
      .then(([cData, hData, reqData, uData, wData, stats]) => {
        setCampaigns(cData);
        setHospitals(hData);
        setHospitalRequests(reqData);
        setUsers(uData);
        setPendingWithdrawals(wData);
        setDashboardStats(stats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const pendingPayouts = campaigns.filter(
    (c) => c.status === "disbursement_requested",
  );
  const totalDisbursed = campaigns
    .filter((c) => c.status === "disbursed")
    .reduce((s, c) => s + (c.target_amount || 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  const handleApprove = async (c) => {
    try {
      await updateCampaignStatus(c.id, "disbursed");
      toast.success(
        `✓ Disbursement approved — ₦${(c.target_amount || 0).toLocaleString()} released to ${c.hospital_name}`,
      );
      fetchAll();
    } catch (err) {
      toast.error("Failed to approve. Please try again.");
      console.error(err);
    }
  };

  const handleReject = async (c) => {
    try {
      await updateCampaignStatus(c.id, "funded");
      toast.error(`Disbursement rejected for "${c.title}"`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCampaignAdmin(campaignToDelete.id);
      toast.success("Campaign deleted successfully.");
      setCampaignToDelete(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to delete campaign.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveHospital = async () => {
    // FIX: validate bank_name too
    if (
      !selectedRequest ||
      !approveForm.bank_account ||
      !approveForm.bank_name ||
      !approveForm.bank_code
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsApproving(true);
    try {
      // FIX: include bank_name in payload
      await approveHospital({
        request_id: selectedRequest.id,
        hospital_name: selectedRequest.hospital_name,
        hospital_address: selectedRequest.hospital_address,
        bank_account: approveForm.bank_account,
        bank_name: approveForm.bank_name,
        bank_code: approveForm.bank_code,
      });

      toast.success(
        `✓ Hospital "${selectedRequest.hospital_name}" approved and verified!`,
      );
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      // FIX: reset bank_name too
      setApproveForm({ bank_account: "", bank_name: "", bank_code: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to approve hospital.");
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  // --- User handlers ---
  const handleActivateUser = async (user) => {
    setIsUserActing(true);
    try {
      await activateUser(user.id);
      toast.success(`✓ ${user.name} activated.`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to activate user.");
    } finally {
      setIsUserActing(false);
    }
  };

  const handleSuspendUser = async (user) => {
    setIsUserActing(true);
    try {
      await suspendUser(user.id);
      toast.success(`${user.name} suspended.`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to suspend user.");
    } finally {
      setIsUserActing(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setIsUserActing(true);
    try {
      await deleteUser(user.id);
      toast.success(`User "${user.name}" deleted.`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setIsUserActing(false);
    }
  };

  // --- Withdrawal handlers ---
  const handleApproveWithdrawal = async (w) => {
    setIsWithdrawalApproving(true);
    try {
      await approveWithdrawal(w.id);
      toast.success(`✓ Withdrawal #${w.id} approved.`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to approve withdrawal.");
    } finally {
      setIsWithdrawalApproving(false);
    }
  };

  // --- Hospital admin handlers ---
  const handleVerifyHospitalAdmin = async (h) => {
    setIsHospitalActing(true);
    try {
      await verifyHospitalAdmin(h.id);
      toast.success(`✓ "${h.name}" verified.`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to verify hospital.");
    } finally {
      setIsHospitalActing(false);
    }
  };

  const handleDisableHospital = async (h) => {
    if (!window.confirm(`Disable "${h.name}"?`)) return;
    setIsHospitalActing(true);
    try {
      await disableHospital(h.id);
      toast.success(`"${h.name}" disabled.`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to disable hospital.");
    } finally {
      setIsHospitalActing(false);
    }
  };

  const stats = [
    {
      label: "Pending Hospital Requests",
      value: hospitalRequests.length,
      icon: Clock,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      urgent: hospitalRequests.length > 0,
    },
    {
      label: "Pending Payouts",
      value: pendingPayouts.length,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      urgent: true,
    },
    {
      label: "Total Raised",
      value: dashboardStats
        ? `₦${((dashboardStats.donations?.total_amount || 0) / 1_000_000).toFixed(1)}M`
        : `₦0.0M`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Partner Hospitals",
      value: dashboardStats?.hospitals?.total ?? hospitals.length,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Disbursed",
      value: `₦${(totalDisbursed / 1_000_000).toFixed(1)}M`,
      icon: Banknote,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="!size-9 bg-white/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Super Admin</h1>
                <p className="text-slate-400 text-sm">
                  TrustBridge Operations Centre
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card
                className={`shadow-sm border-slate-100 ${stat.urgent && stat.value > 0 ? "ring-2 ring-amber-300" : ""}`}
              >
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

        {/* Alert Banner */}
        {pendingPayouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3 mb-6"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              {pendingPayouts.length} disbursement request
              {pendingPayouts.length > 1 ? "s" : ""} pending your review.
              Approve only after verifying the invoice.
            </p>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="payouts" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto overflow-x-auto w-full flex items-center gap-2 flex-wrap">
            <TabsTrigger
              value="requests"
              className="rounded-lg text-sm data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none px-4 py-2"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Hospital Requests
              {hospitalRequests.length > 0 && (
                <span className="ml-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {hospitalRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className="rounded-lg text-sm data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none px-4 py-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              Pending Payouts
              {pendingPayouts.length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingPayouts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="hospitals"
              className="rounded-lg text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none px-4 py-2"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              Hospitals ({hospitals.length})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="rounded-lg text-sm data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 data-[state=active]:shadow-none px-4 py-2"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              All Campaigns ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-lg text-sm data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:shadow-none px-4 py-2"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Users ({dashboardStats?.users?.total ?? users.length})
            </TabsTrigger>
            <TabsTrigger
              value="withdrawals"
              className="rounded-lg text-sm data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 data-[state=active]:shadow-none px-4 py-2"
            >
              <Banknote className="w-3.5 h-3.5 mr-1.5" />
              Withdrawals
              {pendingWithdrawals.length > 0 && (
                <span className="ml-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingWithdrawals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/*  Tab 1: Hospital Requests  */}
          <TabsContent value="requests">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-sm border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/60">
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Hospital Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Address
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Contact Email
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Submitted
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          License
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hospitalRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                              <p className="text-sm font-medium text-slate-500">
                                All set!
                              </p>
                              <p className="text-xs">
                                No pending hospital requests.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        hospitalRequests.map((req) => (
                          <TableRow
                            key={req.id}
                            className="hover:bg-slate-50/50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-indigo-600" />
                                </div>
                                <p className="font-medium text-slate-800 text-sm">
                                  {req.hospital_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1 text-sm text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {req.hospital_address}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {req.contact_email}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-slate-500">
                                {req.created_at
                                  ? new Date(req.created_at).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {req.license_path || req.license_document ? (
                                <a
                                  href={
                                    req.license_path
                                      ? `${BASE_URL}/${req.license_path}`
                                      : `${BASE_URL}/uploads/hospitals/${req.license_document}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-medium bg-blue-50 px-3 py-1.5 rounded-md"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  View License
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  No document
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Dialog
                                open={
                                  approveDialogOpen &&
                                  selectedRequest?.id === req.id
                                }
                                onOpenChange={setApproveDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-xs h-8 gap-1"
                                    onClick={() => setSelectedRequest(req)}
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Approve
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Approve Hospital</DialogTitle>
                                  </DialogHeader>
                                  {selectedRequest && (
                                    <div className="space-y-4 mt-4">
                                      <div className="bg-indigo-50 rounded-lg p-3 space-y-1 mb-4">
                                        <p className="text-sm text-slate-700">
                                          <span className="font-medium">Hospital:</span>{" "}
                                          {selectedRequest.hospital_name}
                                        </p>
                                        <p className="text-sm text-slate-700">
                                          <span className="font-medium">Address:</span>{" "}
                                          {selectedRequest.hospital_address}
                                        </p>
                                        <p className="text-sm text-slate-700">
                                          <span className="font-medium">Email:</span>{" "}
                                          {selectedRequest.contact_email}
                                        </p>
                                      </div>

                                      <div>
                                        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                          Bank Account Number *
                                        </Label>
                                        <Input
                                          placeholder="0123456789"
                                          value={approveForm.bank_account}
                                          onChange={(e) =>
                                            setApproveForm((p) => ({
                                              ...p,
                                              bank_account: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>

                                      {/* FIX: added Bank Name field */}
                                      <div>
                                        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                          Bank Name *
                                        </Label>
                                        <Input
                                          placeholder="e.g., Access Bank"
                                          value={approveForm.bank_name}
                                          onChange={(e) =>
                                            setApproveForm((p) => ({
                                              ...p,
                                              bank_name: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>

                                      <div>
                                        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                          Bank Code *
                                        </Label>
                                        <Input
                                          placeholder="e.g., 044"
                                          value={approveForm.bank_code}
                                          onChange={(e) =>
                                            setApproveForm((p) => ({
                                              ...p,
                                              bank_code: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>

                                      <div className="flex gap-3 mt-6">
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            setApproveDialogOpen(false)
                                          }
                                          disabled={isApproving}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                                          onClick={handleApproveHospital}
                                          disabled={isApproving}
                                        >
                                          {isApproving
                                            ? "Approving..."
                                            : "Approve & Verify"}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/*  Tab 2: Pending Payouts  */}
          <TabsContent value="payouts">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-sm border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/60">
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Campaign
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Hospital
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Invoice
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayouts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                              <p className="text-sm font-medium text-slate-500">
                                All clear!
                              </p>
                              <p className="text-xs">
                                No pending payout requests at the moment.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingPayouts.map((c) => (
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
                                  <p className="font-medium text-slate-800 text-sm line-clamp-1 max-w-[180px]">
                                    {c.title}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {c.patient_name}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-700">
                              {c.hospital_name}
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-sm text-slate-800">
                                ₦{(c.target_amount || 0).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              {c.invoice_url ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 text-xs h-8 gap-1.5 px-2"
                                      onClick={() => setReviewCampaign(c)}
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Review Invoice
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-base">
                                        Invoice Review
                                      </DialogTitle>
                                    </DialogHeader>
                                    {reviewCampaign && (
                                      <div className="mt-2">
                                        <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1.5 mb-4">
                                          <p>
                                            <span className="font-medium text-slate-700">Campaign:</span>{" "}
                                            <span className="text-slate-600">{reviewCampaign.title}</span>
                                          </p>
                                          <p>
                                            <span className="font-medium text-slate-700">Patient:</span>{" "}
                                            <span className="text-slate-600">{reviewCampaign.patient_name}</span>
                                          </p>
                                          <p>
                                            <span className="font-medium text-slate-700">Hospital:</span>{" "}
                                            <span className="text-slate-600">{reviewCampaign.hospital_name}</span>
                                          </p>
                                          <p>
                                            <span className="font-medium text-slate-700">Amount:</span>{" "}
                                            <span className="font-bold text-emerald-700">
                                              ₦{(reviewCampaign.target_amount || 0).toLocaleString()}
                                            </span>
                                          </p>
                                        </div>
                                        <div className="border border-slate-200 rounded-xl p-4 min-h-[160px] flex items-center justify-center bg-slate-50">
                                          {reviewCampaign.invoice_url?.endsWith(".pdf") ? (
                                            <a
                                              href={reviewCampaign.invoice_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
                                            >
                                              <FileText className="w-5 h-5" /> Open PDF Invoice{" "}
                                              <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                          ) : (
                                            <img
                                              src={reviewCampaign.invoice_url}
                                              alt="Invoice"
                                              className="max-h-[320px] rounded-lg"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  No invoice attached
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8 gap-1"
                                  onClick={() => handleApprove(c)}
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8 gap-1"
                                  onClick={() => handleReject(c)}
                                >
                                  <XCircle className="w-3 h-3" /> Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/*  Tab 3: Hospitals  */}
          <TabsContent value="hospitals">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-sm border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/60">
                        <TableHead className="text-xs font-semibold text-slate-500">Hospital</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Location</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Bank Details</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Account</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hospitals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                            No hospitals registered.
                          </TableCell>
                        </TableRow>
                      ) : (
                        hospitals.map((h) => (
                          <TableRow key={h.id} className="hover:bg-slate-50/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">{h.name}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1 text-sm text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {h.address || h.location || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-slate-700">
                                <p className="font-medium">{h.bank_name || "Unknown Bank"}</p>
                                <p className="text-xs text-slate-400">{h.account_name || "No Name"}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1.5 text-sm font-mono text-slate-700">
                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                {h.bank_account || h.account_number || "N/A"}{" "}
                                {h.bank_code ? `(${h.bank_code})` : ""}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  h.verified
                                    ? "bg-emerald-100 text-emerald-700 border-0"
                                    : "bg-amber-100 text-amber-700 border-0"
                                }
                              >
                                {h.verified ? "✓ Verified" : "Unverified"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!h.verified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isHospitalActing}
                                    onClick={() => handleVerifyHospitalAdmin(h)}
                                    className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Verify
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isHospitalActing}
                                  onClick={() => handleDisableHospital(h)}
                                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Disable
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/*  Tab 4: All Campaigns  */}
          <TabsContent value="all">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-sm border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/60">
                        <TableHead className="text-xs font-semibold text-slate-500">Campaign</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Hospital</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Raised</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Target</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                            No campaigns yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        campaigns.map((c) => {
                          const statusColor =
                            {
                              active: "bg-emerald-100 text-emerald-700",
                              funded: "bg-blue-100 text-blue-700",
                              disbursement_requested: "bg-amber-100 text-amber-700",
                              disbursed: "bg-purple-100 text-purple-700",
                            }[c.status] || "bg-slate-100 text-slate-600";
                          return (
                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                    <img
                                      src={
                                        c.cover_image ||
                                        "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=60"
                                      }
                                      alt={c.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <p className="font-medium text-slate-800 text-sm line-clamp-1 max-w-[200px]">
                                    {c.title}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">{c.hospital_name}</TableCell>
                              <TableCell className="font-semibold text-sm text-emerald-700">
                                ₦{(c.raised_amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                ₦{(c.target_amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${statusColor} border-0 text-xs capitalize`}>
                                  {(c.status || "").replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <button
                                  onClick={() => setCampaignToDelete(c)}
                                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                                  title="Delete Campaign"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/*  Tab 5: Users  */}
          <TabsContent value="users">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-sm border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/60">
                        <TableHead className="text-xs font-semibold text-slate-500">Name</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Email</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Role</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Joined</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((u) => {
                          const isActive = u.status === "active";
                          return (
                            <TableRow key={u.id} className="hover:bg-slate-50/50">
                              <TableCell className="font-medium text-slate-800 text-sm">{u.name}</TableCell>
                              <TableCell className="text-sm text-slate-500">{u.email}</TableCell>
                              <TableCell>
                                <Badge className="bg-slate-100 text-slate-600 border-0 text-xs capitalize">
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    isActive
                                      ? "bg-emerald-100 text-emerald-700 border-0 text-xs"
                                      : "bg-red-100 text-red-600 border-0 text-xs"
                                  }
                                >
                                  {u.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-slate-400">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isActive ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isUserActing}
                                      onClick={() => handleSuspendUser(u)}
                                      className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                                    >
                                      Suspend
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isUserActing}
                                      onClick={() => handleActivateUser(u)}
                                      className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                    >
                                      Activate
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isUserActing}
                                    onClick={() => handleDeleteUser(u)}
                                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/*  Tab 6: Withdrawals  */}
          <TabsContent value="withdrawals">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-sm border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/60">
                        <TableHead className="text-xs font-semibold text-slate-500">ID</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Campaign</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Amount</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Requested</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingWithdrawals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                            No pending withdrawals.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingWithdrawals.map((w) => (
                          <TableRow key={w.id} className="hover:bg-slate-50/50">
                            <TableCell className="text-sm font-mono text-slate-500">#{w.id}</TableCell>
                            <TableCell className="text-sm font-medium text-slate-800">
                              {w.campaign_title || w.campaign_id || "—"}
                            </TableCell>
                            <TableCell className="text-sm font-semibold text-emerald-700">
                              ₦{(w.amount || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs capitalize">
                                {w.status || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-400">
                              {w.created_at ? new Date(w.created_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                disabled={isWithdrawalApproving}
                                onClick={() => handleApproveWithdrawal(w)}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Campaign Confirmation Dialog */}
      <Dialog
        open={!!campaignToDelete}
        onOpenChange={(open) => !open && setCampaignToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
            <Trash2 className="w-5 h-5 shrink-0" />
            <p>
              Deleting: <strong>{campaignToDelete?.title}</strong>
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCampaignToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCampaign}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}