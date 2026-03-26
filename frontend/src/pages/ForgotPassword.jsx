import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { forgotPassword } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLocalError("");
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      const message = err.message || "Something went wrong. Please try again.";
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
            Forgot Password
          </h1>
          <p className="text-slate-500 mt-2">
            Enter your email to reset your password
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 sm:rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardContent className="pt-8 px-8">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Check your email
                </h3>
                <p className="text-slate-500">
                  We've sent a password reset link to <br />
                  <span className="font-medium text-slate-700">{email}</span>
                </p>
                <Button
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800"
                  onClick={() => setIsSuccess(false)}
                >
                  Try another email
                </Button>
              </div>
            ) : (
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLocalError("");
                      }}
                      required
                    />
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
                      Send Reset Link
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 py-5 mt-6 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Remember your password?{" "}
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

