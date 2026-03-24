"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const total = target.getTime() - new Date().getTime();
  const clamped = Math.max(total, 0);
  const seconds = Math.floor((clamped / 1000) % 60);
  const minutes = Math.floor((clamped / 1000 / 60) % 60);
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  return { total: clamped, days, hours, minutes, seconds };
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const target = new Date(targetDate);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex flex-wrap items-center gap-4 text-center">
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <div key={label} className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-white px-4 py-3 shadow-card sm:h-24 sm:w-24 sm:px-6 sm:py-4">
            <div className="text-2xl font-semibold leading-none text-primary-800 tabular-nums sm:text-3xl">00</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-center">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds }
      ].map((item) => (
        <div key={item.label} className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-white px-4 py-3 shadow-card sm:h-24 sm:w-24 sm:px-6 sm:py-4">
          <div className="text-2xl font-semibold leading-none text-primary-800 tabular-nums sm:text-3xl">
            {String(item.value).padStart(2, "0")}
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
