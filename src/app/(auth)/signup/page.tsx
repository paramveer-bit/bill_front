"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Receipt } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const api = useApi();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      const res = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: "USER",
      });
      console.log("Signup successful:", res.data);
      showSuccessToast("Account created! Welcome aboard.");
      router.push(`/verify/${res.data.data.user.id}`);
    } catch (err: unknown) {
      // console.error("Signup error:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      showErrorToast(msg);
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
            Create your account
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-xl shadow-zinc-200/60 border border-zinc-200/80 bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-8">
            <CardTitle className="text-xl font-semibold text-zinc-800">
              Get started
            </CardTitle>
            <CardDescription className="text-zinc-500 text-sm">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold text-zinc-500 uppercase tracking-widest"
                >
                  Full Name
                </Label>
                <Input
                  {...register("name")}
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className={cn(
                    "h-11 rounded-xl border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-sm",
                    "focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 focus-visible:bg-white",
                    "transition-all duration-150",
                    errors.name &&
                      "border-red-300 bg-red-50 focus-visible:ring-red-300/50 focus-visible:border-red-400",
                  )}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-zinc-500 uppercase tracking-widest"
                >
                  Email
                </Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    "h-11 rounded-xl border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-sm",
                    "focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 focus-visible:bg-white",
                    "transition-all duration-150",
                    errors.email &&
                      "border-red-300 bg-red-50 focus-visible:ring-red-300/50 focus-visible:border-red-400",
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-zinc-500 uppercase tracking-widest"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className={cn(
                      "h-11 rounded-xl border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-sm pr-11",
                      "focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 focus-visible:bg-white",
                      "transition-all duration-150",
                      errors.password &&
                        "border-red-300 bg-red-50 focus-visible:ring-red-300/50 focus-visible:border-red-400",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-zinc-500 uppercase tracking-widest"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={cn(
                      "h-11 rounded-xl border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-sm pr-11",
                      "focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 focus-visible:bg-white",
                      "transition-all duration-150",
                      errors.confirmPassword &&
                        "border-red-300 bg-red-50 focus-visible:ring-red-300/50 focus-visible:border-red-400",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full mt-1 h-11 rounded-xl text-sm font-semibold",
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
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-8 pb-7 pt-2">
            {/* Divider */}
            <div className="flex items-center gap-3 w-full">
              <Separator className="flex-1 bg-zinc-100" />
              <span className="text-zinc-400 text-xs font-medium">or</span>
              <Separator className="flex-1 bg-zinc-100" />
            </div>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-500 hover:text-orange-500 font-semibold transition-colors underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-400 mt-6">
          By creating an account, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-zinc-600 transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-zinc-600 transition-colors">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
