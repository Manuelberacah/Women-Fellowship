"use client";

import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { registerMember, verifyMsg91Widget } from "../../lib/api";
import Spinner from "../../components/Spinner";

declare global {
  interface Window {
    initSendOTP?: (config: any) => void;
  }
}

const MSG91_WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
const MSG91_TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;

export default function BecomeMemberPage() {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [form, setForm] = useState({ name: "", phone: "", email: "", church: "", city: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
      script.onload = () => setScriptReady(true);
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
    setMessage(null);
    setIsRegistering(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        churchName: form.church,
        city: form.city,
        mode,
        phoneVerified: otpVerified
      };
      await registerMember(payload);
      setProfileCreated(true);
      setMessage("Registration successful. Welcome to Eureka!");
    } catch (error) {
      setMessage("Unable to register at the moment. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerifyPhone = async () => {
    setMessage(null);
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const seconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setMessage(`Please wait ${seconds}s before requesting OTP again.`);
      return;
    }
    if (!MSG91_WIDGET_ID || !MSG91_TOKEN_AUTH) {
      setMessage("MSG91 credentials are missing. Please update frontend .env.");
      return;
    }
    if (!form.phone) {
      setMessage("Please enter your phone number first.");
      return;
    }
    if (!scriptReady || !window.initSendOTP) {
      setMessage("OTP widget is still loading. Please try again in a moment.");
      return;
    }

    setIsVerifying(true);
    const configuration = {
      widgetId: MSG91_WIDGET_ID,
      tokenAuth: MSG91_TOKEN_AUTH,
      identifier: form.phone,
      exposeMethods: true,
      success: async (data: any) => {
        const accessToken = data?.access_token || data?.accessToken || data?.token;
        if (!accessToken) {
          setMessage("OTP verified but no access token returned.");
          setIsVerifying(false);
          return;
        }
        try {
          await verifyMsg91Widget({ phone: form.phone, accessToken });
          setOtpVerified(true);
          if (!profileCreated) {
            await registerMember({
              name: form.name,
              phone: form.phone,
              email: form.email,
              churchName: form.church,
              city: form.city,
              mode: "phone",
              phoneVerified: true
            });
            setProfileCreated(true);
            setMessage("Phone verified and profile created.");
          } else {
            setMessage("Phone verified successfully.");
          }
          setCooldownUntil(Date.now() + 10000);
        } catch {
          setMessage("Unable to verify OTP with server. Please try again.");
        } finally {
          setIsVerifying(false);
        }
      },
      failure: (error: any) => {
        setMessage(error?.message || "OTP verification failed.");
        setIsVerifying(false);
      }
    };

    window.initSendOTP(configuration);
  };

  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Membership" title="Become a Member">
        Join the fellowship to access events, community updates, and your digital event passes.
      </SectionHeader>

      <div className="rounded-3xl bg-white p-8 shadow-card">
        <div className="flex gap-4">
          <button
            onClick={() => setMode("email")}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              mode === "email" ? "bg-primary-700 text-white" : "bg-primary-50 text-primary-800"
            }`}
          >
            Email Signup
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              mode === "phone" ? "bg-primary-700 text-white" : "bg-primary-50 text-primary-800"
            }`}
          >
            Phone Signup
          </button>
        </div>

        <form onSubmit={handleRegister} className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Name"
            className="rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          <input
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="Phone Number"
            className="rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          {mode === "email" && (
            <input
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="Email"
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
          )}
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
                {otpVerified ? "Resend OTP" : "Send OTP"}
              </button>
              <span className="text-sm text-slate-500">{otpVerified ? "Verified" : "Not verified yet"}</span>
            </div>
          )}

          {message && <p className="text-sm text-primary-700 md:col-span-2">{message}</p>}
          <button
            disabled={mode === "phone" ? !otpVerified || profileCreated : profileCreated}
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
