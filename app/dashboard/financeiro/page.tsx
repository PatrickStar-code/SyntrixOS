"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Painel Financeiro
            </h1>
            <p className="text-gray-400">Controle suas finanças e objetivos.</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-5 text-emerald-500">
            <DollarSign size={100} />
          </div>
          <div className="flex items-center gap-3 text-gray-400 mb-2 relative z-10">
            <Wallet size={18} />
            <span className="font-medium text-sm">Saldo Total</span>
          </div>
          <p className="text-3xl font-bold relative z-10">R$ 0,00</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <span className="font-medium text-sm">Entradas</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">+ R$ 0,00</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <TrendingDown size={18} className="text-red-500" />
            <span className="font-medium text-sm">Saídas</span>
          </div>
          <p className="text-2xl font-bold text-red-400">- R$ 0,00</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-[#111111]/80 rounded-3xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold mb-6">Últimas Transações</h2>
        <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <p>Nenhuma transação registrada esse mês.</p>
        </div>
      </motion.div>
    </div>
  );
}
