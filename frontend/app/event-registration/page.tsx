"use client";

import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import axios from "axios";
import Spinner from "../../components/Spinner";
import { useToast } from "../../components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

export default function EventRegistrationPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [isPaying, setIsPaying] = useState(false);
  const toast = useToast();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setIsPaying(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Unable to load payment gateway.");
      setIsPaying(false);
      return;
    }

    let order;
    try {
      order = await axios.post(`${API_BASE}/payments/order`, {
        amount: 20000,
        name: form.name,
        email: form.email,
        phone: form.phone
      });
    } catch {
      toast.error("Unable to reach payment server. Please try again in a moment.");
      setIsPaying(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.data.amount,
      currency: order.data.currency,
      name: "EUREKA – Women Fellowship",
      description: "Event Registration",
      order_id: order.data.id,
      handler: async (response: any) => {
        try {
          await axios.post(`${API_BASE}/payments/verify`, {
            orderId: order.data.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            attendee: form
          });
          toast.success("Payment successful! Your registration is confirmed.");
        } catch {
          toast.error("Payment captured but verification failed. Please contact support.");
        } finally {
          setIsPaying(false);
        }
      },
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone
      },
      theme: { color: "#5c2fd6" }
    } as any;

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Event Registration" title="Register for the May Gathering">
        The event registration fee is ₹200. Complete payment to generate your digital event pass.
      </SectionHeader>

      <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Name"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="Email"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="Phone Number"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
        </div>
        <button
          onClick={handlePay}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white"
          disabled={isPaying}
        >
          {isPaying ? <Spinner /> : null}
          Pay ₹200 & Register
        </button>
      </div>
    </section>
  );
}
