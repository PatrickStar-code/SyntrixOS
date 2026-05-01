"use client";

import { motion, Variants } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  Plus,
  MoreVertical,
  LayoutGrid,
} from "lucide-react";

export default function ProjetosPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 25 },
    },
  };

  const columns = [
    {
      id: "todo",
      title: "Planejamento",
      icon: Clock,
      theme: "text-gray-400",
      bgBadge: "bg-gray-500/20 text-gray-400",
      items: [
        {
          title: "Definir Arquitetura",
          desc: "Criar diagrama do banco de dados",
          badge: "Design",
        },
        {
          title: "Pesquisa de Mercado",
          desc: "Analisar concorrentes diretos",
          badge: "Business",
        },
      ],
    },
    {
      id: "in-progress",
      title: "Em Execução",
      icon: PlayCircle,
      theme: "text-blue-500",
      bgBadge: "bg-blue-500/20 text-blue-400",
      items: [
        {
          title: "Implementar Autenticação",
          desc: "Conectar Clerk no frontend",
          badge: "Security",
        },
      ],
    },
    {
      id: "done",
      title: "Concluído",
      icon: CheckCircle2,
      theme: "text-green-500",
      bgBadge: "bg-green-500/20 text-green-400",
      items: [
        {
          title: "Landing Page",
          desc: "Criar home responsiva",
          badge: "Frontend",
        },
      ],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="h-full flex flex-col pb-10"
    >
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Kaban de Projetos
            </h1>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all"
        >
          <Plus size={18} />
          <span>Nova Tarefa</span>
        </motion.button>
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        variants={itemVariants}
        className="flex gap-6 overflow-x-auto pb-6 snap-x min-h-[60vh]"
      >
        {columns.map((col) => (
          <div
            key={col.id}
            className="min-w-[320px] w-[320px] flex flex-col bg-[#111111]/60 backdrop-blur-md rounded-2xl border border-white/5 snap-start"
          >
            {/* Header Coluna */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span
                className={`font-bold flex items-center gap-2 ${col.theme}`}
              >
                <col.icon size={18} /> {col.title}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${col.bgBadge}`}
              >
                {col.items.length}
              </span>
            </div>

            {/* Itens */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {col.items.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 shadow-lg hover:border-indigo-500/40 cursor-grab active:cursor-grabbing transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded">
                      {item.badge}
                    </span>
                    <button className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <h4
                    className={`font-bold text-white mb-1 ${col.id === "done" ? "line-through text-gray-500" : ""}`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.desc}
                  </p>

                  {/* Avatar Simulado na Tarefa */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 border-2 border-[#1a1a1a]" />
                    </div>
                  </div>
                </motion.div>
              ))}

              <button className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-500 text-sm font-semibold hover:border-white/30 hover:text-white transition-colors flex items-center justify-center gap-2 mt-2">
                <Plus size={16} /> Adicionar card
              </button>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
