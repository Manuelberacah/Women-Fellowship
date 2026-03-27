"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SectionHeader from "../../components/SectionHeader";
import { verifyEmailToken } from "../../lib/api";
import { useToast } from "../../components/Toast";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      toast.error("No verification token found in the link.");
      return;
    }

    verifyEmailToken(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified! You are now an official member of Eureka Women Fellowship.");
        toast.success("Email verified successfully! Welcome to Eureka!");

        // Save member status to localStorage
        localStorage.setItem("eureka-member", "true");

        // Notify the old tab (become-member page) that verification is done
        try {
          const bc = new BroadcastChannel("eureka-verify");
          bc.postMessage({ type: "email-verified" });
          bc.close();
        } catch {
          // BroadcastChannel not supported in some browsers — that's okay
        }
      })
      .catch((error: any) => {
        setStatus("error");
        const msg = error?.response?.data?.message || "Verification failed. The link may have expired.";
        setMessage(msg);
        toast.error(msg);
      });
  }, [token]);

  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Email Verification" title={status === "loading" ? "Verifying..." : status === "success" ? "Email Verified!" : "Verification Failed"}>
        {status === "loading" ? "Please wait while we verify your email." : message}
      </SectionHeader>

      {status === "success" && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/" className="rounded-full border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700">
            Back to Home
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/" className="rounded-full border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700">
            Back to Home
          </a>
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
