"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function DashboardPageTemplate({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.section>
  );
}
