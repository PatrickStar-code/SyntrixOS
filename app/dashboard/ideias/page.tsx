"use client";

import { motion, Variants } from "framer-motion";
import {
  Lightbulb,
  Plus,
  MoreHorizontal,
  Calendar,
  Hash,
  Activity,
} from "lucide-react";

export default function IdeiasPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 400, damping: 30 },
    },
  };

  const ideas = [
    {
      title: "Refatorar Módulo Financeiro",
      category: "Tech",
      date: "Hoje",
      status: "Novo",
    },
    {
      title: "Livro sobre Mindset Digital",
      category: "Conteúdo",
      date: "Ontem",
      status: "Rascunho",
    },
    {
      title: "Ideia para SaaS de academia",
      category: "Negócios",
      date: "15 Mai",
      status: "Validando",
    },
    {
      title: "Melhorias no Portfólio (CSS)",
      category: "Tech",
      date: "10 Mai",
      status: "Novo",
    },
    {
      title: "Pauta de Reunião com Equipe",
      category: "Trabalho",
      date: "02 Mai",
      status: "Pronto",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-500/20 text-blue-400";
      case "Rascunho":
        return "bg-yellow-500/20 text-yellow-400";
      case "Validando":
        return "bg-purple-500/20 text-purple-400";
      case "Pronto":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Notion-style Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-6 pt-4 border-b border-white/5 pb-8 relative group"
      >
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className="text-6xl mb-2">💡</div>
        <h1
          className="text-4xl md:text-5xl font-black tracking-tight text-white placeholder-gray-600 outline-hidden w-full bg-transparent"
          contentEditable
        >
          Cofre de Ideias
        </h1>
        <p
          className="text-gray-400 max-w-2xl outline-hidden empty:before:content-['Adicione_uma_descrição_opcional...'] empty:before:text-gray-600"
          contentEditable
        >
          Um espaço sem atrito para despejar o cérebro. Tudo começa com
          rascunhos.
        </p>

        <div className="flex pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/5"
          >
            <Plus size={16} />
            Novo Registro
          </motion.button>
        </div>
      </motion.div>

      {/* Notion-style List */}
      <motion.div variants={itemVariants} className="w-full">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 text-xs font-bold tracking-widest text-gray-500 uppercase">
          <div className="col-span-6 flex items-center gap-2">
            <Lightbulb size={14} /> Título
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Hash size={14} /> Categoria
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Activity size={14} /> Status
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Calendar size={14} /> Data
          </div>
        </div>

        {/* List Items */}
        <div className="flex flex-col">
          {ideas.map((idea, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              className="group grid grid-cols-1 md:grid-cols-12 gap-y-2 gap-x-4 px-4 py-3.5 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all items-center"
            >
              <div className="col-span-6 font-medium text-white flex items-center gap-3">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600">
                  <MoreHorizontal size={16} />
                </span>
                {idea.title}
              </div>

              <div className="col-span-2 flex items-center">
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                  {idea.category}
                </span>
              </div>

              <div className="col-span-2 flex items-center">
                <span
                  className={`text-xs px-2 py-0.5 rounded border border-white/5 font-semibold ${getStatusColor(idea.status)}`}
                >
                  {idea.status}
                </span>
              </div>

              <div className="col-span-2 text-sm text-gray-500 md:text-right flex items-center md:block">
                <span className="md:hidden mr-2 text-xs">Data:</span>{" "}
                {idea.date}
              </div>
            </motion.div>
          ))}

          <div className="px-10 py-4">
            <button className="text-gray-500 text-sm flex items-center gap-2 hover:text-white transition-colors">
              <Plus size={16} /> Adicionar Linha
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
