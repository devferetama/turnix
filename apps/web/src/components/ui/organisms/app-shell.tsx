"use client";

import { motion } from "motion/react";

import { Sidebar } from "@/components/ui/organisms/sidebar";
import { Topbar } from "@/components/ui/organisms/topbar";
import { useAppShellStore } from "@/components/ui/organisms/use-app-shell-store";
import type { NavigationItem } from "@/config/navigation";
import type { SessionUser } from "@/types/domain";

export function AppShell({
  children,
  navigation,
  user,
  tenantLabel,
}: {
  children: React.ReactNode;
  navigation: NavigationItem[];
  user: SessionUser;
  tenantLabel?: string;
}) {
  const mobileSidebarOpen = useAppShellStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useAppShellStore(
    (state) => state.setMobileSidebarOpen,
  );
  const toggleMobileSidebar = useAppShellStore(
    (state) => state.toggleMobileSidebar,
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        navigation={navigation}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        tenantLabel={tenantLabel}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          tenantLabel={tenantLabel}
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleSidebar={toggleMobileSidebar}
        />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex-1 px-4 py-6 xl:px-8 xl:py-8"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
