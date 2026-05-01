"use client";

import { useUser } from "@clerk/nextjs";
import { motion, Variants } from "framer-motion";
import { Activity, CheckCircle2, TrendingUp, Plus, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const { user } = useUser();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header Secion */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
          Olá,{" "}
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {user?.firstName || "Explorador"}
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Aqui está o resumo do seu ecossistema pessoal de hoje. Vamos
          transformar foco em resultados.
        </p>
      </motion.div>

      {/* Resumo/Metrics Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-2xl bg-[#111111]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">68%</h3>
          <p className="text-sm text-gray-400 font-medium tracking-wide">
            META FINANCEIRA ALCANÇADA
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">4</h3>
          <p className="text-sm text-gray-400 font-medium tracking-wide">
            PROJETOS EM ANDAMENTO
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
              <Activity size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">Descanso</h3>
          <p className="text-sm text-gray-400 font-medium tracking-wide">
            HOJE NÃO TEM TREINO PROGRAMADO
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Atividade Recente */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            Atividade Recente
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "Ideia registrada: App de Gestão Minimalista",
                time: "Há 2 horas",
                color: "bg-yellow-500",
              },
              {
                title: "Treino de Hipertrofia B Concluído",
                time: "Ontem às 19:30",
                color: "bg-blue-500",
              },
              {
                title: "Receita Adicionada: R$ 1.500,00",
                time: "Ontem às 10:15",
                color: "bg-emerald-500",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-xl bg-[#111111]/40 border border-white/5 hover:bg-[#111111]/80 transition-colors"
              >
                <div
                  className={`mt-1.5 w-2.5 h-2.5 rounded-full ${activity.color} shadow-[0_0_8px_currentColor]`}
                />
                <div>
                  <p className="text-white font-medium text-sm md:text-base">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Destaque */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="relative overflow-hidden h-full min-h-[300px] rounded-3xl p-8 border border-white/10 flex flex-col justify-end bg-linear-to-b from-transparent to-[#111111] group">
            {/* Visual background abstraction */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">Eureka?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Teve alguma intuição genial de projeto ou estudo? Capture isso
                imediatamente.
              </p>

              <Link href="/dashboard/ideias">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all"
                >
                  <Plus size={20} />
                  Anotar Ideia Rápida
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
