"use client";

import { motion } from "framer-motion";
import { Dumbbell, Activity, Calendar, Trophy } from "lucide-react";

export default function TreinoPage() {
  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
          <Dumbbell size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Treino e Saúde</h1>
          <p className="text-gray-400">Monitore sua evolução física.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Treino Atual", value: "Hipertrofia A", icon: Activity },
          { title: "Frequência", value: "4x na semana", icon: Calendar },
          { title: "Peso Alvo", value: "85 kg", icon: Trophy },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-white/10"
          >
            <div className="flex items-center gap-3 text-gray-400 mb-2">
              <stat.icon size={18} />
              <span className="font-medium text-sm">{stat.title}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-8 border border-white/10 rounded-3xl bg-[#111111]/50 backdrop-blur-sm text-center text-gray-500"
      >
        <p>A interface detalhada de exercícios será implementada aqui.</p>
      </motion.div>
    </div>
  );
}
