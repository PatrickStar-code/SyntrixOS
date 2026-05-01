"use client";

import { motion } from "framer-motion";
import { FolderKanban, CheckCircle2, Clock } from "lucide-react";

export default function ProjetosPage() {
  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-400">
          <FolderKanban size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Kaban de Projetos
          </h1>
          <p className="text-gray-400">Transforme ideias em realidade.</p>
        </div>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {/* Coluna A Fazer */}
        <div className="min-w-[300px] flex-1 bg-[#111111]/40 rounded-3xl p-4 border border-white/5 snap-start">
          <div className="flex items-center justify-between mb-4 px-2 text-gray-400">
            <span className="font-bold flex items-center gap-2">
              <Clock size={16} /> A Fazer
            </span>
            <span className="bg-white/10 px-2 rounded-full text-xs">2</span>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                className="bg-[#111111] p-4 rounded-xl border border-white/10 shadow hover:border-green-500/50 cursor-grab"
              >
                <p className="font-medium text-sm">Tarefa Pendente #{i}</p>
                <div className="mt-3 flex gap-2">
                  <span className="text-[10px] uppercase font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    Feature
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coluna Concluído */}
        <div className="min-w-[300px] flex-1 bg-[#111111]/40 rounded-3xl p-4 border border-white/5 snap-start">
          <div className="flex items-center justify-between mb-4 px-2 text-gray-400">
            <span className="font-bold flex items-center gap-2 text-green-500">
              <CheckCircle2 size={16} /> Concluído
            </span>
            <span className="bg-white/10 px-2 rounded-full text-xs">1</span>
          </div>
          <div className="space-y-3">
            <div className="bg-[#111111] p-4 rounded-xl border border-white/10 opacity-70">
              <p className="font-medium text-sm line-through text-gray-500">
                Nova Landing Page
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
