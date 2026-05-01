"use client";

import { motion, Variants } from "framer-motion";
import { GraduationCap, BookOpen, Clock, AlertCircle } from "lucide-react";

export default function AcademicoPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300 },
    },
  };

  const disciplinas = [
    { title: "Engenharia de Software", progress: 85, color: "bg-blue-500" },
    { title: "Sistemas Operacionais", progress: 40, color: "bg-purple-500" },
    { title: "Banco de Dados", progress: 60, color: "bg-emerald-500" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 border-b border-white/5 pb-6"
      >
        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hub Acadêmico</h1>
          <p className="text-gray-400">Progresso contínuo rumo à maestria.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Disciplinas e Progresso */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-purple-400" />
            Suas Disciplinas
          </h2>

          <div className="space-y-4">
            {disciplinas.map((d, index) => (
              <motion.div
                key={d.title}
                whileHover={{ scale: 1.01 }}
                className="p-5 bg-[#111111]/60 backdrop-blur-md rounded-2xl border border-white/10"
              >
                <div className="flex justify-between items-end mb-3">
                  <h3 className="font-bold text-lg">{d.title}</h3>
                  <span className="text-sm font-bold text-gray-400">
                    {d.progress}% Completo
                  </span>
                </div>
                {/* CSS Progress Bar */}
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    className={`h-full rounded-full ${d.color} shadow-[0_0_10px_currentColor]`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cuna Lateral: Tarefas Avaliativas */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-red-400" />
            Entregáveis
          </h2>

          <div className="bg-[#111111]/80 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4 relative overflow-hidden group">
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors" />

            <div className="relative z-10 flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-red-100 text-sm">
                  Trabalho de S.O.
                </h4>
                <p className="text-xs text-red-300 mt-1">
                  Concorrência e Threads (Entrega Amanhã)
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
              <Clock className="text-gray-400 mt-0.5 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-white text-sm">Resumo B.D.</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Modelagem Entidade-Relacionamento (Semana que vem)
                </p>
              </div>
            </div>

            <button className="w-full text-center py-2 text-sm font-semibold text-gray-500 hover:text-white transition-colors">
              + Adicionar Tarefa
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
