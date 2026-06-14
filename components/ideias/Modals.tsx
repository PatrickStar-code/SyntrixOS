"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useState } from "react";
import { Tag, TagColor } from "@/lib/ideas";

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    tag: Omit<Tag, "id" | "user_id" | "created_at" | "updated_at">,
  ) => void;
  availableColors: readonly TagColor[];
}

export function CreateTagModal({
  isOpen,
  onClose,
  onSave,
  availableColors,
}: CreateTagModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(availableColors[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, color });
    setName("");
    setColor(availableColors[0]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nova Tag</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nome da Tag
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Urgente"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Cor
                </label>
                <div className="flex gap-2 flex-wrap">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        color === c
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#1A1A1A] scale-110"
                          : "hover:scale-110 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {color === c && (
                        <Check
                          size={14}
                          className="text-white drop-shadow-md"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full mt-6 bg-white text-black font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Criar Tag
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: {
    content: string;
    description: string;
    tagIds: string[];
  }) => void;
  availableTags: Tag[];
}

export function CreateIdeaModal({
  isOpen,
  onClose,
  onSave,
  availableTags,
}: CreateIdeaModalProps) {
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({ content, description, tagIds: selectedTagIds });
    setContent("");
    setDescription("");
    setSelectedTagIds([]);
    onClose();
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nova Ideia</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Título da Ideia
                </label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ex: Funcionalidade de Kanban"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes sobre a ideia..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all resize-none font-medium"
                />
              </div>

              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto p-1">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1 text-sm font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "border-transparent text-white shadow-sm"
                              : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300 bg-transparent"
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: tag.color, color: "#fff" }
                              : {}
                          }
                        >
                          {isSelected && (
                            <Check size={12} className="text-white" />
                          )}
                          {!isSelected && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                          )}
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {availableTags.length === 0 && (
                <div className="text-sm text-gray-500 italic mt-2">
                  Crie tags para poder categorizar suas ideias.
                </div>
              )}

              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Salvar Ideia
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
