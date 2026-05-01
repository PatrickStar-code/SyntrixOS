"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Clock, FileText } from "lucide-react";

export default function AcademicoPage() {
  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hub Acadêmico</h1>
          <p className="text-gray-400">Gerencie estudos e cronogramas.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111111]/80 rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6 text-white border-b border-white/10 pb-4">
            <Clock className="text-purple-400" />
            <h2 className="text-xl font-bold">Próximas Provas</h2>
          </div>
          <p className="text-gray-500 text-sm">
            Nenhum exame cadastrado no momento.
          </p>
        </div>

        <div className="bg-[#111111]/80 rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6 text-white border-b border-white/10 pb-4">
            <BookOpen className="text-purple-400" />
            <h2 className="text-xl font-bold">Leituras Pendentes</h2>
          </div>
          <ul className="space-y-3">
            {[1, 2].map((i) => (
              <li
                key={i}
                className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5"
              >
                <FileText size={18} className="text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-sm">Artigo de Pesquisa #{i}</p>
                  <p className="text-xs text-purple-400 uppercase tracking-wider font-bold mt-1">
                    Ler até sexta
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
