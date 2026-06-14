"use client";

import { motion, Variants } from "framer-motion";
import { Plus, Tag as TagIcon, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  IdeaWithTags,
  Tag,
  ColumnId,
  IdeasQueryParams,
  COLUMNS,
  TAG_COLORS,
} from "@/lib/ideas";
import { KanbanBoard } from "@/components/ideias/KanbanBoard";
import { CreateIdeaModal, CreateTagModal } from "@/components/ideias/Modals";

export default function IdeiasPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 400, damping: 30 },
    },
  };

  // State
  const [ideas, setIdeas] = useState<IdeaWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ColumnId | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | "all">("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals
  const [isIdeaModalOpen, setIdeaModalOpen] = useState(false);
  const [isTagModalOpen, setTagModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: IdeasQueryParams = {
          limit: 100,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== "all") params.status = statusFilter;
        if (tagFilter !== "all") params.tagId = tagFilter;

        const [ideasRes, tagsRes] = await Promise.all([
          fetch(
            `/api/ideas?${new URLSearchParams(params as Record<string, string>).toString()}`,
          ).then((r) => r.json()),
          fetch("/api/tags").then((r) => r.json()),
        ]);

        if (mounted) {
          if (ideasRes.ideas) {
            setIdeas(ideasRes.ideas);
          }
          setTags(tagsRes);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch data:", err);
          setError("Falha ao carregar dados. Tente novamente.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [debouncedSearch, statusFilter, tagFilter, refreshKey]);

  // Handlers
  const handleMoveIdea = async (ideaId: string, newStatus: ColumnId) => {
    // Optimistic update
    const previousIdeas = [...ideas];
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, status: newStatus } : idea,
      ),
    );

    try {
      await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      // Rollback on error
      setIdeas(previousIdeas);
      console.error("Failed to move idea:", err);
      alert("Falha ao mover ideia. Tente novamente.");
    }
  };

  const handleCreateTag = async (
    newTag: Omit<Tag, "id" | "user_id" | "created_at" | "updated_at">,
  ) => {
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTag),
      });
      if (!res.ok) throw new Error("Failed to create tag");
      const tag = await res.json();
      setTags((prev) => [...prev, tag]);
    } catch (err) {
      console.error("Failed to create tag:", err);
      alert("Falha ao criar tag. Tente novamente.");
    }
  };

  const handleCreateIdea = async (newIdea: {
    content: string;
    description: string;
    tagIds: string[];
  }) => {
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIdea),
      });
      if (!res.ok) throw new Error("Failed to create idea");
      const idea = await res.json();
      setIdeas((prev) => [idea, ...prev]);
    } catch (err) {
      console.error("Failed to create idea:", err);
      alert("Falha ao criar ideia. Tente novamente.");
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTagFilter("all");
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || tagFilter !== "all";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-10"
    >
      {/* Header Modal Triggers & Info */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-6 pt-4 border-b border-white/5 pb-8 relative group"
      >
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 disabled:opacity-50"
            title="Atualizar"
          >
            <svg
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <div className="text-6xl mb-2">💡</div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white placeholder-gray-600 outline-hidden w-full bg-transparent">
          Cofre de Ideias
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Um espaço visual para gerenciar suas concepções livre de atritos.
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ideias..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ColumnId | "all")
              }
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Validando">Validando</option>
              <option value="Pronto">Pronto</option>
            </select>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">Todas as Tags</option>
              {tags.map((tag) => (
                <option
                  key={tag.id}
                  value={tag.id}
                  style={{ color: tag.color }}
                >
                  {tag.name}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                <X size={14} /> Limpar
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex pt-4 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIdeaModalOpen(true)}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm font-semibold text-black bg-white hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors border border-white/5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Novo Registro
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTagModalOpen(true)}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TagIcon size={16} />
            Gerenciar Tags
          </motion.button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-center justify-between"
        >
          <span>{error}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="text-sm font-bold hover:underline"
          >
            Tentar novamente
          </motion.button>
        </motion.div>
      )}

      {/* Kanban Board Layout */}
      <motion.div variants={itemVariants} className="w-full">
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                className="min-w-[280px] w-[320px] flex flex-col bg-black/20 border border-white/5 rounded-2xl"
              >
                <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <h2 className="font-bold text-white/80 text-sm tracking-wide">
                    {col.title}
                  </h2>
                  <span className="bg-white/10 text-white/60 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    —
                  </span>
                </div>
                <div className="flex-1 p-3 space-y-3 min-h-[150px]">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-white/5 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <KanbanBoard ideas={ideas} onMoveIdea={handleMoveIdea} />
        )}
      </motion.div>

      {/* Empty State */}
      {!isLoading && ideas.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="text-center py-16 bg-[#111111]/40 border border-white/5 rounded-2xl"
        >
          <div className="text-6xl mb-4">💭</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {hasActiveFilters
              ? "Nenhuma ideia encontrada"
              : "Nenhuma ideia ainda"}
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            {hasActiveFilters
              ? "Tente ajustar os filtros ou limpe-os para ver todas as ideias."
              : "Capture sua primeira intuição e comece a construir seu cofre de ideias."}
          </p>
          {!hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIdeaModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Plus size={20} />
              Criar Primeira Ideia
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Overlays / Modals */}
      <CreateTagModal
        isOpen={isTagModalOpen}
        onClose={() => setTagModalOpen(false)}
        onSave={handleCreateTag}
        availableColors={TAG_COLORS}
      />

      <CreateIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        onSave={handleCreateIdea}
        availableTags={tags}
      />
    </motion.div>
  );
}
