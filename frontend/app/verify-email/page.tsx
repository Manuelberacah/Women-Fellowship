"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SectionHeader from "../../components/SectionHeader";
import { verifyEmailToken } from "../../lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    verifyEmailToken(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified! You are now an official member of Eureka Women Fellowship.");
      })
      .catch((error: any) => {
        setStatus("error");
        setMessage(error?.response?.data?.message || "Verification failed. The link may have expired.");
      });
  }, [token]);

  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Email Verification" title={status === "loading" ? "Verifying..." : status === "success" ? "Email Verified!" : "Verification Failed"}>
        {status === "loading" ? "Please wait while we verify your email." : message}
      </SectionHeader>

      {status === "success" && (
        <div className="mt-8 text-center">
          <a href="/member" className="rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white">
            Go to Member Dashboard
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="mt-8 text-center">
          <a href="/become-member" className="rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white">
            Back to Registration
          </a>
        </div>
      )}
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<section className="section-pad py-20"><p className="text-center text-slate-500">Loading...</p></section>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
