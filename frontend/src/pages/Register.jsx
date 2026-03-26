import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  User,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import PasswordStrength from "@/components/trustbridge/PasswordStrength";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Valid email is required";

    // Stricter password validation
    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain an uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain a number";
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = "Password must contain a special character";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error for this field when typing
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    try {
      await register(formData);
      toast.success("Account created successfully. Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Failed to create account");
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center mb-4 shadow-sm"
          >
            <Heart className="w-7 h-7 text-emerald-600" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2">Join TrustBridge today</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 sm:rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardContent className="pt-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 rounded-xl transition-all"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 rounded-xl transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 rounded-xl transition-all"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <PasswordStrength password={formData.password} />
                )}
                {formErrors.password && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium mt-8 rounded-xl shadow-sm shadow-emerald-600/20 transition-all group active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 py-5 mt-6 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

