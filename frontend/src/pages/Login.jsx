import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const { login, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Clear any stale global auth errors when entering/leaving the login page
  useEffect(() => {
    clearError();
    return () => clearError();
  }, []);

  // Clear inline error as soon as user starts retyping
  useEffect(() => {
    setLocalError("");
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLocalError("");
    try {
      await login({ email, password });

      const { user } = useAuthStore.getState();
      toast.success(`Welcome back${user?.name ? `, ${user.name}` : ""}!`);

      if (user?.role === "creator") {
        navigate("/creator");
      } else if (user?.role === "hospital" || user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "super-admin" || user?.role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message =
        err.message || "Invalid email or password. Please try again.";
      setLocalError(message);
      toast.error(message);
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
            Welcome Back
          </h1>
          <p className="text-slate-500 mt-2">
            Sign in to your TrustBridge account
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-slate-400 font-medium hover:text-emerald-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 rounded-xl transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 py-5 mt-6 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

