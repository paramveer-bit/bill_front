"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Receipt, MailCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";
const BASE = process.env.NEXT_PUBLIC_BASEURL;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds
import api from "@/lib/api";
export default function VerifyOtpPage() {
  const { id: userId } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth() ?? {};
  const { verifyEmail } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown timer
  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    // Move to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        // Move to previous
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    // Focus the next empty input or the last one
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const onSubmit = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      triggerShake();
      showErrorToast("Please enter all 6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(code, userId);
      showSuccessToast("Email verified! Welcome to BillDesk.");
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid or expired OTP";
      showErrorToast(msg);
      triggerShake();
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await api.post(`${BASE ?? ""}/auth/otp/resend`, { id: userId });
      showSuccessToast("A new OTP has been sent to your email.");
      startCooldown();
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to resend OTP. Please try again.";
      showErrorToast(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Subtle dot grid texture */}
      <div
        className="fixed inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Soft glowing orbs for depth */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg shadow-orange-300/40 ring-4 ring-orange-100">
            <Receipt className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-3xl font-bold text-zinc-900 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            BillDesk
          </h1>
          <p className="text-zinc-500 mt-1 text-sm font-medium">
            Verify your email address
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-xl shadow-zinc-200/60 border border-zinc-200/80 bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-8">
            {/* Mail icon badge */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
                <MailCheck className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-zinc-800 text-center">
              Check your inbox
            </CardTitle>
            <CardDescription className="text-zinc-500 text-sm text-center">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-zinc-700">
                {/* {user?.email ?? "your email"} */}
              </span>
              . Enter it below to verify your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pt-6">
            {/* OTP inputs */}
            <div
              className={cn(
                "flex gap-2.5 justify-center",
                shake && "animate-[shake_0.4s_ease-in-out]",
              )}
              style={
                {
                  // inline keyframes fallback via style if Tailwind doesn't have 'shake'
                }
              }
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={cn(
                    "w-11 h-13 text-center text-lg font-bold rounded-xl border",
                    "bg-zinc-50 text-zinc-900 caret-amber-500",
                    "transition-all duration-150 outline-none",
                    "border-zinc-200",
                    digit
                      ? "border-amber-400 bg-amber-50 shadow-sm shadow-amber-100"
                      : "focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30",
                  )}
                  style={{ width: "44px", height: "52px" }}
                  aria-label={`OTP digit ${i + 1}`}
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                />
              ))}
            </div>

            {/* Submit button */}
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || otp.join("").length < OTP_LENGTH}
              className={cn(
                "w-full mt-6 h-11 rounded-xl text-sm font-semibold",
                "bg-gradient-to-r from-amber-400 to-orange-500",
                "hover:from-amber-300 hover:to-orange-400",
                "text-white shadow-md shadow-orange-200",
                "hover:shadow-orange-300 hover:shadow-lg",
                "active:scale-[0.98] transition-all duration-150",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Verifying…
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 px-8 pb-7 pt-1">
            {/* Resend */}
            <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-500">
              <span>Didn't receive it?</span>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className={cn(
                  "font-semibold transition-colors flex items-center gap-1",
                  cooldown > 0 || isResending
                    ? "text-zinc-300 cursor-not-allowed"
                    : "text-amber-500 hover:text-orange-500 hover:underline underline-offset-2",
                )}
              >
                {isResending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>

            <p className="text-center text-sm text-zinc-500">
              Wrong account?{" "}
              <Link
                href="/signup"
                className="text-amber-500 hover:text-orange-500 font-semibold transition-colors underline-offset-2 hover:underline"
              >
                Sign up again
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-400 mt-6">
          The code expires in{" "}
          <span className="font-medium text-zinc-500">10 minutes</span>. Check
          your spam folder if you can't find it.
        </p>
      </div>

      {/* Shake keyframe — injected inline so no Tailwind config needed */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .animate-\\[shake_0\\.4s_ease-in-out\\] {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
