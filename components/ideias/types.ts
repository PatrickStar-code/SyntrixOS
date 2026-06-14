import type { Tag, Idea, ColumnId, COLUMNS, TAG_COLORS } from "@/lib/ideas";

export type { Tag, Idea, ColumnId };

export { COLUMNS, TAG_COLORS };

// IDEA: Re-export from lib/ideas for consistency
export type IdeaWithTags = Idea & { tags: Tag[] };
