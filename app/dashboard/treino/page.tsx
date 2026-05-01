"use client";

import { motion, Variants } from "framer-motion";
import { Dumbbell, Activity, Trophy, Play, CheckCircle2 } from "lucide-react";

export default function TreinoPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-10"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between md:items-end gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
            <Dumbbell size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              Treino e Saúde
            </h1>
            <p className="text-gray-400">Monitore sua evolução física.</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
        >
          <Play size={20} fill="currentColor" />
          <span>Iniciar Treino</span>
        </motion.button>
      </motion.div>

      {/* Progresso & Status */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#111111]/80 backdrop-blur-md border border-white/10 flex flex-col md:flex-row items-center gap-8 group hover:border-white/20 transition-all">
          {/* Círculo de Progresso Customizado via SVG */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3bf686"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - 283 * 0.8 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">80%</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Consistência Semanal</h3>
            <p className="text-gray-400">
              Você já completou 4 de 5 treinos nesta semana. Continue o ótimo
              trabalho para bater sua meta!
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-center flex flex-col items-center justify-center gap-4">
          <Trophy size={48} className="text-blue-400" />
          <div>
            <p className="text-sm text-blue-300 font-bold tracking-widest uppercase mb-1">
              Peso Alvo
            </p>
            <p className="text-3xl font-black text-white">85 kg</p>
          </div>
        </div>
      </motion.div>

      {/* Lista de Treinos */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity size={20} className="text-blue-400" />
          Sua Rotina Mensal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: "A",
              title: "Costas e Bíceps",
              tags: ["Força", "Máquinas"],
              done: true,
            },
            {
              id: "B",
              title: "Peito e Tríceps",
              tags: ["Hipertrofia", "Livre"],
              done: false,
            },
            {
              id: "C",
              title: "Pernas e Abdômen",
              tags: ["Resistência", "Pesado"],
              done: false,
            },
          ].map((treino) => (
            <motion.div
              key={treino.id}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl backdrop-blur-md border transition-all cursor-pointer group
                ${treino.done ? "bg-[#111111]/80 border-green-500/30" : "bg-[#111111]/80 border-white/10 hover:border-white/30"}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-5xl font-black opacity-20 group-hover:opacity-40 transition-opacity ${treino.done ? "text-green-500" : "text-white"}`}
                >
                  {treino.id}
                </span>
                {treino.done ? (
                  <CheckCircle2 size={24} className="text-green-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-blue-400 transition-colors" />
                )}
              </div>

              <h3 className="text-xl font-bold mb-3">{treino.title}</h3>
              <div className="flex gap-2">
                {treino.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-300 font-medium border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
