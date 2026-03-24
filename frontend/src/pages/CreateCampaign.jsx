import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ShieldCheck,
  ArrowLeft,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  Video,
  ImageIcon,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL, createCampaign } from "@/lib/api";

const STEPS = ["Campaign Info", "Hospital & Details", "Media & Docs", "Review"];

const CATEGORIES = [
  { value: "surgery", label: "Surgery", emoji: "🏥" },
  { value: "treatment", label: "Treatment", emoji: "💊" },
  { value: "medication", label: "Medication", emoji: "🩺" },
  { value: "emergency", label: "Emergency", emoji: "🚨" },
  { value: "rehabilitation", label: "Rehabilitation", emoji: "💪" },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const testdata = {
    patient_name: "Lorem-13443",
    title: "Lorem 1",
    diagnosis_summary: "Lorem 2",
    story: "Lorem 3",
    target_amount: "10000",
    hospital_id: "1",
    category: "surgery",
    beneficiary_name: "Lorem 1432",
    contact_phone: "08123456789",
    medical_document: {},
    images: [],
    video: null,
  };
  const emptydata = {
    patient_name: "",
    title: "",
    diagnosis_summary: "",
    story: "",
    target_amount: "",
    hospital_id: "",
    category: "",
    beneficiary_name: "",
    contact_phone: "",
    medical_document: null,
    images: [],
    video: null,
  };
  const [form, setForm] = useState(testdata);
  console.log(JSON.stringify(form));
  console.log(form);

  const setFormValue = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetch(`${API_URL}/hospitals/index.php`)
      .then((res) => {
        if (!res.ok) {
          return fetch("/api/hospitals"); // fallback if setup allows
        }
        return res;
      })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || [];
        setHospitals(list);
      })
      .catch(console.error);
  }, []);

  const step1Valid =
    form.patient_name.trim() &&
    form.title.trim() &&
    form.diagnosis_summary.trim() &&
    form.story.trim();
  const step2Valid =
    form.target_amount &&
    form.hospital_id &&
    form.category &&
    form.beneficiary_name.trim() &&
    form.contact_phone.trim();
  const step3Valid = form.medical_document !== null; // Recommend having medical doc at least

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("You must be signed in to create a campaign.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("patient_name", form.patient_name);
      formData.append("title", form.title);
      formData.append("diagnosis_summary", form.diagnosis_summary);
      formData.append("story", form.story);
      formData.append("target_amount", form.target_amount);
      formData.append("hospital_id", form.hospital_id);
      formData.append("category", form.category);
      formData.append("beneficiary_name", form.beneficiary_name);
      formData.append("contact_phone", form.contact_phone);

      if (form.medical_document) {
        formData.append("medical_document", form.medical_document);
      }

      if (form.images && form.images.length > 0) {
        form.images.forEach((img) => {
          formData.append("images[]", img);
        });
      }

      if (form.video) {
        formData.append("video", form.video);
      }

      await createCampaign(formData);

      toast.success("Campaign created successfully!");
      navigate("/campaigns");
    } catch (err) {
      toast.error(
        err.message || "Failed to create campaign. Please try again.",
      );
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const selectedHospital = hospitals.find(
    (h) => String(h.id) === String(form.hospital_id),
  );

  // --- Handlers for file inputs ---
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error("You can upload a maximum of 3 images.");
      // Take only the first 3
      setFormValue("images", files.slice(0, 3));
    } else {
      setFormValue("images", files);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white py-10">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 text-emerald-200 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to campaigns
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Start a Medical Campaign
          </h1>
          <p className="text-emerald-100 text-sm">
            Your campaign is verified and secured by Interswitch escrow. Funds
            go directly to the hospital — zero fraud, absolute trust.
          </p>

          {/* Step Progress */}
          <div className="flex items-center justify-between gap-1 mt-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < step
                        ? "bg-white text-emerald-700"
                        : i === step
                          ? "bg-emerald-400 text-white ring-2 ring-white/40"
                          : "bg-emerald-800/50 text-emerald-300"
                    }`}
                  >
                    {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${i === step ? "text-white" : "text-emerald-300"}`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 min-w-[20px] h-0.5 rounded-full mx-1 ${i < step ? "bg-white/60" : "bg-emerald-800/40"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8"
        >
          {/*  Step 1: Info  */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  Campaign Info
                </h2>
                <p className="text-sm text-slate-500">
                  Tell people who you're raising money for.
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Patient's Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={form.patient_name}
                  onChange={(e) => setFormValue("patient_name", e.target.value)}
                  placeholder="e.g. Amina Bello"
                  className="h-11 border-slate-200"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Campaign Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => setFormValue("title", e.target.value)}
                  placeholder="e.g. Help Amina Get Life-Saving Heart Surgery"
                  className="h-11 border-slate-200"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Diagnosis Summary <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={form.diagnosis_summary}
                  onChange={(e) =>
                    setFormValue("diagnosis_summary", e.target.value)
                  }
                  placeholder="e.g. Needs immediate checkup and corrective surgery"
                  className="h-11 border-slate-200"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Patient's Story <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  value={form.story}
                  onChange={(e) => setFormValue("story", e.target.value)}
                  rows={5}
                  placeholder="Describe the condition, why they need help, and how donations will be used..."
                  className="resize-none border-slate-200"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {form.story.length} chars
                </p>
              </div>

              <Button
                onClick={() => setStep(1)}
                disabled={!step1Valid}
                className="w-full flex items-center justify-center h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-base font-semibold"
              >
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          )}

          {/*  Step 2: Details & Contacts  */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  Target & Destination
                </h2>
                <p className="text-sm text-slate-500">
                  Pick a category, hospital, and set your funding goal.
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Target Amount (₦) <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">
                    ₦
                  </span>
                  <Input
                    type="number"
                    value={form.target_amount}
                    onChange={(e) =>
                      setFormValue("target_amount", e.target.value)
                    }
                    placeholder="0"
                    className="pl-8 h-11 text-base font-semibold"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Category <span className="text-red-400">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormValue("category", cat.value)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                        form.category === cat.value
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Verified Partner Hospital{" "}
                  <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={String(form.hospital_id)}
                  onValueChange={(v) => setFormValue("hospital_id", v)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        <span className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                          {h.name}
                          {h.verified && (
                            <span className="text-xs text-emerald-600 ml-1">
                              ✓
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedHospital && (
                  <div className="mt-2 flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700">
                      Funds escrowed directly to{" "}
                      <strong>{selectedHospital.name}</strong>.
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Can't find your hospital?{" "}
                  <Link
                    to="/request-hospital-verification"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Request verification here
                  </Link>
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Beneficiary Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={form.beneficiary_name}
                    onChange={(e) =>
                      setFormValue("beneficiary_name", e.target.value)
                    }
                    placeholder="e.g. John Doe sha"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Contact Phone <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={form.contact_phone}
                    onChange={(e) =>
                      setFormValue("contact_phone", e.target.value)
                    }
                    placeholder="e.g. 080111222333"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="flex-1 flex items-center justify-center h-12 rounded-xl"
                >
                  <ArrowLeft className="size-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!step2Valid}
                  className="flex-1 flex items-center justify-center h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold"
                >
                  Continue
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/*  Step 3: Media & Documents  */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  Upload Media & Docs
                </h2>
                <p className="text-sm text-slate-500">
                  Provide medical evidence and visual material.
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Medical Document <span className="text-red-400">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="relative shrink-0 overflow-hidden h-11 border-dashed"
                  >
                    <FilePlus className="size-4 mr-2" />
                    Upload PDF / Doc
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setFormValue("medical_document", e.target.files[0])
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  <span className="text-sm text-slate-600 truncate">
                    {form.medical_document
                      ? form.medical_document.name
                      : "No file chosen"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Campaign Images{" "}
                  <span className="text-slate-400">(Max 3)</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="relative shrink-0 overflow-hidden h-11 border-dashed"
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImagesChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  <span className="text-sm text-slate-600 truncate">
                    {form.images.length > 0
                      ? `${form.images.length} file(s) chosen`
                      : "No files chosen"}
                  </span>
                </div>
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {Array.from(form.images).map((file, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-lg bg-slate-100 border overflow-hidden"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Campaign Video{" "}
                  <span className="text-slate-400">(Optional)</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="relative shrink-0 overflow-hidden h-11 border-dashed"
                  >
                    <Video className="size-4 mr-2" />
                    Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFormValue("video", e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  <span className="text-sm text-slate-600 truncate">
                    {form.video ? form.video.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 flex items-center justify-center h-12 rounded-xl"
                >
                  <ArrowLeft className="size-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!step3Valid}
                  className="flex-1 flex items-center justify-center h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold"
                >
                  Review <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/*  Step 4: Review  */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  Final Review
                </h2>
                <p className="text-sm text-slate-500">
                  Double-check everything before going live.
                </p>
              </div>

              {/* Preview block */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                  {form.category && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full capitalize">
                      {form.category}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">
                  {form.title}
                </h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                  {form.story}
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-medium text-slate-800">
                      {form.patient_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Goal</span>
                    <span className="font-bold text-emerald-600">
                      ₦{Number(form.target_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-500">Hospital</span>
                    <span className="text-slate-700 font-medium">
                      {selectedHospital
                        ? selectedHospital.name
                        : `ID: ${form.hospital_id}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust note */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Before you submit
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    All campaigns are reviewed by TrustBridge within 24 hours.
                    Ensure your information is accurate — false campaigns are
                    removed immediately.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 flex items-center justify-center h-12 rounded-xl"
                >
                  <ArrowLeft className="size-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold"
                >
                  <Sparkles className="size-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Launch Campaign"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Trust Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-500" /> Interswitch
            Escrow
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="size-4 text-blue-500" /> Hospital-Verified
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-purple-500" /> Zero Fraud
          </span>
        </div>
      </div>
    </div>
  );
}

