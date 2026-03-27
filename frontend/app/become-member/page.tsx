"use client";

import { useEffect, useState, useRef } from "react";
import SectionHeader from "../../components/SectionHeader";
import { registerMember, verifyMsg91Widget, resendVerificationEmail } from "../../lib/api";
import Spinner from "../../components/Spinner";
import { useToast } from "../../components/Toast";

declare global {
  interface Window {
    initSendOTP?: (config: any) => void;
  }
}

const MSG91_WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
const MSG91_TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;

function detectMode(contact: string): "email" | "phone" | null {
  const trimmed = contact.trim();
  if (!trimmed) return null;
  if (trimmed.includes("@")) return "email";
  if (/^\+?\d[\d\s-]{6,}$/.test(trimmed)) return "phone";
  return null;
}

export default function BecomeMemberPage() {
  const [form, setForm] = useState({ name: "", contact: "", church: "", city: "" });
  const [otpVerified, setOtpVerified] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toast = useToast();

  const mode = detectMode(form.contact);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Start 60s countdown for resend button
  const startResendCountdown = () => {
    setResendCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Load MSG91 OTP script when phone mode detected
  useEffect(() => {
    if (mode !== "phone") return;
    if (document.querySelector("script[data-msg91-otp]")) {
      setScriptReady(true);
      return;
    }

    const urls = ["https://verify.msg91.com/otp-provider.js", "https://verify.phone91.com/otp-provider.js"];
    let index = 0;

    const attemptLoad = () => {
      const script = document.createElement("script");
      script.src = urls[index];
      script.async = true;
      script.dataset.msg91Otp = "true";
      script.onload = () => {
        setScriptReady(true);
      };
      script.onerror = () => {
        index += 1;
        if (index < urls.length) attemptLoad();
      };
      document.head.appendChild(script);
    };

    attemptLoad();
  }, [mode]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!mode) {
      toast.warning("Please enter a valid email address or phone number.");
      return;
    }

    if (mode === "phone" && !otpVerified) {
      toast.warning("Please verify your phone number with OTP first.");
      return;
    }

    setIsRegistering(true);
    try {
      const payload = {
        name: form.name,
        phone: mode === "phone" ? form.contact.trim() : "",
        email: mode === "email" ? form.contact.trim() : "",
        churchName: form.church,
        city: form.city,
        mode,
        phoneVerified: otpVerified
      };
      await registerMember(payload);
      setProfileCreated(true);
      if (mode === "email") {
        setAwaitingVerification(true);
        startResendCountdown();
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        toast.success("Registration successful. Welcome to Eureka!");
      }
    } catch {
      toast.error("Unable to register at the moment. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const seconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
      toast.warning(`Please wait ${seconds}s before requesting OTP again.`);
      return;
    }
    if (!MSG91_WIDGET_ID || !MSG91_TOKEN_AUTH) {
      toast.error("MSG91 credentials are missing.");
      return;
    }
    if (!form.contact.trim()) {
      toast.warning("Please enter your phone number first.");
      return;
    }
    if (!scriptReady || !window.initSendOTP) {
      toast.info("OTP widget is still loading. Please try again in a moment.");
      return;
    }

    setIsVerifying(true);
    const digitsOnly = form.contact.replace(/\D/g, "");
    const identifier = form.contact.startsWith("+") ? form.contact : `+91${digitsOnly}`;

    const configuration = {
      widgetId: MSG91_WIDGET_ID,
      tokenAuth: MSG91_TOKEN_AUTH,
      identifier,
      containerId: "otp-container",
      success: async (data: any) => {
        const accessToken = data?.access_token || data?.accessToken || data?.token || data?.message;
        if (!accessToken) {
          toast.error("OTP verified but no access token returned.");
          setIsVerifying(false);
          return;
        }
        try {
          await verifyMsg91Widget({ phone: form.contact.trim(), accessToken });
          setOtpVerified(true);
          if (!profileCreated) {
            await registerMember({
              name: form.name,
              phone: form.contact.trim(),
              email: "",
              churchName: form.church,
              city: form.city,
              mode: "phone",
              phoneVerified: true
            });
            setProfileCreated(true);
            toast.success("Phone verified and profile created!");
          } else {
            toast.success("Phone verified successfully.");
          }
          setCooldownUntil(Date.now() + 10000);
        } catch (error: any) {
          const apiMessage = error?.response?.data?.message;
          toast.error(apiMessage || "Unable to verify OTP. Please try again.");
        } finally {
          setIsVerifying(false);
        }
      },
      failure: (error: any) => {
        toast.error(error?.message || "OTP verification failed.");
        setIsVerifying(false);
      }
    };

    try {
      window.initSendOTP(configuration);
    } catch {
      toast.error("Unable to start OTP. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!form.contact.trim() || resendCountdown > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail(form.contact.trim());
      toast.success("Verification email resent. Please check your inbox.");
      startResendCountdown();
    } catch {
      toast.error("Unable to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (awaitingVerification) {
    return (
      <section className="section-pad py-20">
        <SectionHeader eyebrow="Membership" title="Check Your Email">
          We sent a verification link to <strong>{form.contact.trim()}</strong>. Click the link to complete your membership.
        </SectionHeader>
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-card text-center">
          <p className="text-slate-600 text-sm">Didn&apos;t receive the email? Check your spam folder or resend below.</p>
          <button
            onClick={handleResend}
            disabled={resending || resendCountdown > 0}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {resending ? <Spinner /> : null}
            {resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : "Resend Verification Email"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Membership" title="Become a Member">
        Join the fellowship to access events and community updates.
      </SectionHeader>

      <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
        <form onSubmit={handleRegister} className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Name"
            className="rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          <div className="relative">
            <input
              value={form.contact}
              onChange={(event) => handleChange("contact", event.target.value)}
              placeholder="Email or Phone Number"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-20"
              required
            />
            {mode && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {mode === "email" ? "Email" : "Phone"}
              </span>
            )}
          </div>
          <input
            value={form.church}
            onChange={(event) => handleChange("church", event.target.value)}
            placeholder="Church Name"
            className="rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          <input
            value={form.city}
            onChange={(event) => handleChange("city", event.target.value)}
            placeholder="City"
            className="rounded-2xl border border-slate-200 px-4 py-3"
            required
          />

          {mode === "phone" && (
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <button
                type="button"
                onClick={handleVerifyPhone}
                className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2 text-sm text-white disabled:opacity-70"
                disabled={isVerifying}
              >
                {isVerifying ? <Spinner /> : null}
                {otpVerified ? "Resend OTP" : "Verify Phone via OTP"}
              </button>
              {otpVerified && (
                <span className="text-sm font-medium text-green-600">Verified</span>
              )}
            </div>
          )}

          {mode === "phone" && (
            <div id="otp-container" className="md:col-span-2" />
          )}

          <button
            disabled={
              !mode ||
              (mode === "phone" ? !otpVerified || profileCreated : profileCreated)
            }
            className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-gold-300 px-6 py-3 text-sm font-semibold text-primary-900 disabled:opacity-60"
          >
            {isRegistering ? <Spinner className="border-primary-900/30 border-t-primary-900" /> : null}
            {profileCreated ? "Profile Created" : "Create Member Profile"}
          </button>
        </form>
      </div>
    </section>
  );
}
