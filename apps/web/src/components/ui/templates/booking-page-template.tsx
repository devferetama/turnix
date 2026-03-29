"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function BookingPageTemplate({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8", className)}
    >
      {children}
    </motion.section>
  );
}
