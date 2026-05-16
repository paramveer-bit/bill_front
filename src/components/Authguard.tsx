"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  //   requireVerified?: boolean;
  //   requireCompleted?: boolean;
}

export default function AuthGuard({
  children,
  //   requireVerified = false,
  //   requireCompleted = false,
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // if (!user) {
    //   router.replace("/login");
    //   return;
    // }

    // if (requireVerified && !user.isVerified) {
    //   router.replace("/verify-email");
    //   return;
    // }

    // if (requireCompleted && !user.isCompleted) {
    //   router.replace("/complete-profile");
    // }
  }, [
    user,
    isLoading,
    // requireVerified, requireCompleted,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        no token
      </div>
    );
  }

  // if (!user) {
  //   return (
  //     // <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
  //     //   {/* <Loader2 className="w-6 h-6 text-amber-400 animate-spin" /> */}
  //     //   <h1 className="text-white">No user</h1>
  //     // </div>
  //     <></>
  //   );
  // }

  return <>{children}</>;
}
