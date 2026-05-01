"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Dumbbell,
  Lightbulb,
  FolderKanban,
  GraduationCap,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const menuItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Treino", href: "/dashboard/treino", icon: Dumbbell },
  { name: "Ideias", href: "/dashboard/ideias", icon: Lightbulb },
  { name: "Projetos", href: "/dashboard/projetos", icon: FolderKanban },
  { name: "Acadêmico", href: "/dashboard/academico", icon: GraduationCap },
  { name: "Financeiro", href: "/dashboard/financeiro", icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useUser();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center h-16">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-white flex items-center gap-2"
        >
          Syntrix<span className="text-white/70">OS</span>
        </Link>
        <button onClick={toggleSidebar} className="text-white p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : 0 }}
        className={`fixed md:sticky top-0 h-screen w-64 bg-[#0a0a0a]/95 backdrop-blur-3xl border-r border-white/10 flex flex-col transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 h-16 flex items-center border-b border-white/5">
          <Link
            href="/dashboard"
            className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          >
            Syntrix<span className="text-white/60 font-light">OS</span>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <div
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`transition-colors ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`}
                  />
                  <span className="font-medium tracking-wide">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }}
              userProfileMode="navigation"
              userProfileUrl="/dashboard/profile"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold text-white truncate">
                {user?.firstName || "Usuário"}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
