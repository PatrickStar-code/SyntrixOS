// Service layer for Ideas API
// Types shared between frontend and API

export type Tag = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type Idea = {
  id: string;
  user_id: string;
  content: string;
  description: string | null;
  status: ColumnId;
  created_at: string;
  updated_at: string;
  tags?: Tag[]; // Populated when fetching with tags
};

export type IdeaWithTags = Idea & { tags: Tag[] };

export const COLUMNS = [
  { id: "Novo", title: "Novo" },
  { id: "Rascunho", title: "Rascunho" },
  { id: "Validando", title: "Validando" },
  { id: "Pronto", title: "Pronto" },
] as const;

export type ColumnId = (typeof COLUMNS)[number]["id"];

export const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#10b981", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#64748b", // slate
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

// Request/Response types
export type CreateIdeaRequest = {
  content: string;
  description?: string;
  tagIds?: string[];
  status?: ColumnId;
};

export type UpdateIdeaRequest = Partial<CreateIdeaRequest>;

export type CreateTagRequest = {
  name: string;
  color?: TagColor;
};

export type UpdateTagRequest = Partial<CreateTagRequest>;

export type IdeasQueryParams = {
  status?: ColumnId;
  tagId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
};

export type IdeasResponse = {
  ideas: IdeaWithTags[];
  total: number;
  limit: number;
  offset: number;
};

// API base URL
const API_BASE = "/api";

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `API Error: ${response.status} ${response.statusText}`,
    ) as Error & { status: number; data: unknown };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

// ============ TAGS API ============

export async function fetchTags(): Promise<Tag[]> {
  return fetchApi<Tag[]>("/tags");
}

export async function createTag(tag: CreateTagRequest): Promise<Tag> {
  return fetchApi<Tag>("/tags", {
    method: "POST",
    body: JSON.stringify(tag),
  });
}

export async function updateTag(
  id: string,
  tag: UpdateTagRequest,
): Promise<Tag> {
  return fetchApi<Tag>(`/tags/${id}`, {
    method: "PATCH",
    body: JSON.stringify(tag),
  });
}

export async function deleteTag(id: string): Promise<void> {
  await fetchApi<void>(`/tags/${id}`, {
    method: "DELETE",
  });
}

// ============ IDEAS API ============

export async function fetchIdeas(
  params: IdeasQueryParams = {},
): Promise<IdeasResponse> {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.tagId) searchParams.set("tagId", params.tagId);
  if (params.search) searchParams.set("search", params.search);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.offset) searchParams.set("offset", params.offset.toString());
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const query = searchParams.toString();
  return fetchApi<IdeasResponse>(`/ideas${query ? `?${query}` : ""}`);
}

export async function fetchIdea(id: string): Promise<IdeaWithTags> {
  return fetchApi<IdeaWithTags>(`/ideas/${id}`);
}

export async function createIdea(
  idea: CreateIdeaRequest,
): Promise<IdeaWithTags> {
  return fetchApi<IdeaWithTags>("/ideas", {
    method: "POST",
    body: JSON.stringify(idea),
  });
}

export async function updateIdea(
  id: string,
  idea: UpdateIdeaRequest,
): Promise<IdeaWithTags> {
  return fetchApi<IdeaWithTags>(`/ideas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(idea),
  });
}

export async function deleteIdea(id: string): Promise<void> {
  await fetchApi<void>(`/ideas/${id}`, {
    method: "DELETE",
  });
}

// Helper: Move idea to new status (optimistic update friendly)
export async function moveIdea(
  id: string,
  newStatus: ColumnId,
): Promise<IdeaWithTags> {
  return updateIdea(id, { status: newStatus });
}
