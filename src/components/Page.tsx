"use client";

import { motion } from "motion/react";

/** Pembungkus halaman: judul + animasi masuk dari bawah. */
export function Page({
  title,
  subtitle,
  aside,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="relative mt-2 mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-daun-800 md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 font-bold text-tinta-redup">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {children}
    </motion.section>
  );
}
