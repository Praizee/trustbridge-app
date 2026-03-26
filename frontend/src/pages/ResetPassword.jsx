import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Lock,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { resetPassword } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/login");
    }
  }, [token, navigate]);

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 5) score += 1;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const validate = () => {
    const errors = {};
    if (password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLocalError("");
    setIsLoading(true);

    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully! You can now login.");
      navigate("/login");
    } catch (err) {
      const message =
        err.message || "Failed to reset password. The link might be expired.";
      setLocalError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
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
            Set New Password
          </h1>
          <p className="text-slate-500 mt-2">
            Please enter your new password below
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 sm:rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardContent className="pt-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {localError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{localError}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-medium"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 rounded-xl transition-all"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password)
                        setFormErrors((p) => ({ ...p, password: "" }));
                    }}
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
                {password && (
                  <div className="flex gap-1.5 mt-2.5">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const strength = calculateStrength(password);
                      return (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            level <= strength
                              ? strength < 3
                                ? "bg-red-400"
                                : strength < 4
                                  ? "bg-amber-400"
                                  : "bg-emerald-500"
                              : "bg-slate-100"
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
                {formErrors.password && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-700 font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 rounded-xl transition-all"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (formErrors.confirmPassword)
                        setFormErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
                    required
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {formErrors.confirmPassword}
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
                    Reset Password
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

