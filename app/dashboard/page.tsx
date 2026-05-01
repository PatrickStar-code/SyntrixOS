"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Dumbbell,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const quickLinks = [
  {
    title: "Treino",
    href: "/dashboard/treino",
    icon: Dumbbell,
    color: "text-blue-400",
  },
  {
    title: "Ideias",
    href: "/dashboard/ideias",
    icon: Lightbulb,
    color: "text-yellow-400",
  },
  {
    title: "Projetos",
    href: "/dashboard/projetos",
    icon: FolderKanban,
    color: "text-green-400",
  },
  {
    title: "Acadêmico",
    href: "/dashboard/academico",
    icon: GraduationCap,
    color: "text-purple-400",
  },
  {
    title: "Financeiro",
    href: "/dashboard/financeiro",
    icon: Wallet,
    color: "text-emerald-400",
  },
];

export default function DashboardHome() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-black tracking-tighter text-white">
          Bem-vindo, {user?.firstName || "Explorador"}
        </h1>
        <p className="text-gray-400 text-lg">
          Este é o seu centro de comando pessoal. O que vamos conquistar hoje?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {quickLinks.map((link, idx) => (
          <Link key={link.title} href={link.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-[#111111]/80 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-300 group shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] flex flex-col justify-between h-40"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-white/5 ${link.color}`}>
                  <link.icon size={24} />
                </div>
                <ArrowUpRight
                  className="text-gray-600 group-hover:text-white transition-colors"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-bold Tracking-tight">{link.title}</h3>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
