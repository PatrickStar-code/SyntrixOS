"use client";

import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { Idea, COLUMNS, ColumnId } from "@/lib/ideas";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface KanbanCardProps {
  idea: Idea;
}

function KanbanCard({ idea }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: idea.id,
      data: idea,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const ideaTags = idea.tags || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white/5 border border-white/10 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors ${
        isDragging ? "opacity-50 border-blue-500/50 scale-105 shadow-xl" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-2 group">
        <h3 className="font-bold text-white text-sm leading-tight">
          {idea.content}
        </h3>
        <button className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {idea.description && (
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed">
          {idea.description}
        </p>
      )}

      {ideaTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ideaTags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 shadow-sm"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface KanbanColumnProps {
  id: string;
  title: string;
  ideas: Idea[];
}

function KanbanColumn({ id, title, ideas }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      className={`flex flex-col min-w-[280px] w-full max-w-[320px] bg-black/20 border rounded-2xl transition-colors overflow-hidden ${
        isOver
          ? "border-blue-500/50 bg-blue-500/5 shadow-2xl"
          : "border-white/5"
      }`}
    >
      <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-bold text-white/80 text-sm tracking-wide">
          {title}
        </h2>
        <span className="bg-white/10 text-white/60 text-xs font-bold px-2 py-0.5 rounded-full">
          {ideas.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 flex flex-col gap-3 min-h-[150px] max-h-[60vh] overflow-y-auto custom-scrollbar"
      >
        {ideas.map((idea) => (
          <KanbanCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  ideas: Idea[];
  onMoveIdea: (ideaId: string, newStatus: ColumnId) => void;
}

export function KanbanBoard({ ideas, onMoveIdea }: KanbanBoardProps) {
  const [activeIdea, setActiveIdea] = useState<Idea | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const idea = ideas.find((i) => i.id === active.id);
    if (idea) setActiveIdea(idea);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIdea(null);
    const { active, over } = event;

    if (!over) return;

    const ideaId = active.id as string;
    const newStatus = over.id as ColumnId;

    const activeIdea = ideas.find((i) => i.id === ideaId);
    if (activeIdea && activeIdea.status !== newStatus) {
      onMoveIdea(ideaId, newStatus);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 px-1 snap-x select-none">
        {COLUMNS.map((col) => {
          const colIdeas = ideas.filter((idea) => idea.status === col.id);
          return (
            <div key={col.id} className="snap-start">
              <KanbanColumn id={col.id} title={col.title} ideas={colIdeas} />
            </div>
          );
        })}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeIdea ? <KanbanCard idea={activeIdea} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
