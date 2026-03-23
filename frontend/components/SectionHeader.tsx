import { ReactNode } from "react";

export default function SectionHeader({
  eyebrow,
  title,
  children,
  center
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`mb-2 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-3xl text-primary-900 md:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-base text-slate-600">{children}</p>}
    </div>
  );
}
