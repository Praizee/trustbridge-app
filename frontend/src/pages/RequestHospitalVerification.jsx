import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import { requestHospitalVerification } from "@/lib/api";

export default function RequestHospitalVerification() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({
    hospital_name: "",
    hospital_address: "",
    contact_email: "",
    license_document: null,
  });

  const setFormValue = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Only PDF files are accepted. Please upload a PDF.");
        e.target.value = "";
        return;
      }
      setFormValue("license_document", file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.hospital_name.trim() ||
      !form.hospital_address.trim() ||
      !form.contact_email.trim() ||
      !form.license_document
    ) {
      toast.error("Please fill in all fields and upload a license document.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("hospital_name", form.hospital_name);
      formData.append("hospital_address", form.hospital_address);
      formData.append("contact_email", form.contact_email);
      formData.append("license_document", form.license_document);

      await requestHospitalVerification(formData);

      setShowSuccessModal(true);
      setForm({
        hospital_name: "",
        hospital_address: "",
        contact_email: "",
        license_document: null,
      });
    } catch (err) {
      toast.error(err.message || "Failed to submit verification request.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Request Hospital Verification
          </h1>
          <p className="text-slate-600 mt-2">
            Help us expand our network of verified hospitals. Submit your
            hospital for verification.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6"
        >
          {/* Hospital Name */}
          <div>
            <Label
              htmlFor="hospital_name"
              className="text-slate-700 font-medium"
            >
              Hospital Name *
            </Label>
            <Input
              id="hospital_name"
              placeholder="e.g., University Teaching Hospital"
              value={form.hospital_name}
              onChange={(e) => setFormValue("hospital_name", e.target.value)}
              className="mt-2"
              required
            />
          </div>

          {/* Hospital Address */}
          <div>
            <Label
              htmlFor="hospital_address"
              className="text-slate-700 font-medium"
            >
              Hospital Address *
            </Label>
            <Input
              id="hospital_address"
              placeholder="e.g., Port Harcourt, Rivers State"
              value={form.hospital_address}
              onChange={(e) => setFormValue("hospital_address", e.target.value)}
              className="mt-2"
              required
            />
          </div>

          {/* Contact Email */}
          <div>
            <Label
              htmlFor="contact_email"
              className="text-slate-700 font-medium"
            >
              Contact Email *
            </Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="e.g., info@hospital.com"
              value={form.contact_email}
              onChange={(e) => setFormValue("contact_email", e.target.value)}
              className="mt-2"
              required
            />
          </div>

          {/* License Document */}
          <div>
            <Label
              htmlFor="license_document"
              className="text-slate-700 font-medium"
            >
              License Document *
            </Label>
            <p className="text-sm text-slate-500 mt-1">
              Upload your hospital's official license or registration certificate (PDF format only) issued by the relevant authority (e.g., MDCN, State Ministry of Health, or CAC).
            </p>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                PDF only
              </span>
              <span className="text-xs text-slate-400">· Max 5MB</span>
            </div>
            <div className="mt-2 relative">
              <input
                id="license_document"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,application/pdf"
                capture={false}
                className="hidden"
              />
              <label
                htmlFor="license_document"
                className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="text-center">
                  <p className="font-medium text-slate-700">
                    {form.license_document
                      ? form.license_document.name
                      : "Click to upload license document"}
                  </p>
                  {!form.license_document ? (
                    <p className="text-xs text-slate-400 mt-0.5">
                      PDF only · Max 5MB
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-600 mt-0.5">
                      ✓ File selected — tap to change
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </motion.form>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <DialogTitle>Verification Request Submitted</DialogTitle>
            <DialogDescription className="mt-4">
              Thank you for submitting your hospital for verification. Our team
              will review your documents within 2-3 business days. You can check
              the status anytime by logging into your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/");
              }}
              className="flex-1"
            >
              Go Home
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/create");
              }}
            >
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}