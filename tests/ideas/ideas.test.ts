import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  fetchIdeas,
  fetchIdea,
  createIdea,
  updateIdea,
  deleteIdea,
  moveIdea,
} from "@/lib/ideas";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockTag = {
  id: "tag-1",
  user_id: "user-1",
  name: "Urgente",
  color: "#ef4444",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockIdea = {
  id: "idea-1",
  user_id: "user-1",
  content: "Test Idea",
  description: "Test Description",
  status: "Novo" as const,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  tags: [mockTag],
};

const mockIdeasResponse = {
  ideas: [mockIdea],
  total: 1,
  limit: 50,
  offset: 0,
};

describe("lib/ideas - Tags API", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchTags", () => {
    it("should fetch tags successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTag],
      });

      const result = await fetchTags();

      expect(mockFetch).toHaveBeenCalledWith("/api/tags", expect.any(Object));
      expect(result).toEqual([mockTag]);
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error" }),
      });

      await expect(fetchTags()).rejects.toThrow("Server error");
    });

    it("should throw on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchTags()).rejects.toThrow("Network error");
    });
  });

  describe("createTag", () => {
    it("should create tag successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTag,
      });

      const result = await createTag({ name: "Nova Tag", color: "#ef4444" });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/tags",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Nova Tag", color: "#ef4444" }),
        }),
      );
      expect(result).toEqual(mockTag);
    });

    it("should throw on validation error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Tag name is required" }),
      });

      await expect(createTag({ name: "" })).rejects.toThrow(
        "Tag name is required",
      );
    });
  });

  describe("updateTag", () => {
    it("should update tag successfully", async () => {
      const updatedTag = { ...mockTag, name: "Updated" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTag,
      });

      const result = await updateTag("tag-1", { name: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/tags/tag-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "Updated" }),
        }),
      );
      expect(result).toEqual(updatedTag);
    });

    it("should throw on not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Tag not found" }),
      });

      await expect(updateTag("tag-1", { name: "Updated" })).rejects.toThrow(
        "Tag not found",
      );
    });
  });

  describe("deleteTag", () => {
    it("should delete tag successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await expect(deleteTag("tag-1")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/tags/tag-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});

describe("lib/ideas - Ideas API", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchIdeas", () => {
    it("should fetch ideas with no params (empty query)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIdeasResponse,
      });

      const result = await fetchIdeas();

      expect(mockFetch).toHaveBeenCalledWith("/api/ideas", expect.any(Object));
      expect(result).toEqual(mockIdeasResponse);
    });

    it("should fetch ideas with search, status, and tag filters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIdeasResponse,
      });

      const result = await fetchIdeas({
        search: "test",
        status: "Novo",
        tagId: "tag-1",
        limit: 20,
        offset: 10,
        sortBy: "updated_at",
        sortOrder: "asc",
      });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("search=test");
      expect(url).toContain("status=Novo");
      expect(url).toContain("tagId=tag-1");
      expect(url).toContain("limit=20");
      expect(url).toContain("offset=10");
      expect(url).toContain("sortBy=updated_at");
      expect(url).toContain("sortOrder=asc");
      expect(result).toEqual(mockIdeasResponse);
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error" }),
      });

      await expect(fetchIdeas()).rejects.toThrow("Server error");
    });
  });

  describe("fetchIdea", () => {
    it("should fetch single idea successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIdea,
      });

      const result = await fetchIdea("idea-1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/ideas/idea-1",
        expect.any(Object),
      );
      expect(result).toEqual(mockIdea);
    });

    it("should throw on not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Idea not found" }),
      });

      await expect(fetchIdea("idea-1")).rejects.toThrow("Idea not found");
    });
  });

  describe("createIdea", () => {
    it("should create idea successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIdea,
      });

      const result = await createIdea({
        content: "New Idea",
        description: "Description",
        tagIds: ["tag-1"],
        status: "Novo",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/ideas",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            content: "New Idea",
            description: "Description",
            tagIds: ["tag-1"],
            status: "Novo",
          }),
        }),
      );
      expect(result).toEqual(mockIdea);
    });

    it("should throw on validation error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Idea content is required" }),
      });

      await expect(createIdea({ content: "" })).rejects.toThrow(
        "Idea content is required",
      );
    });
  });

  describe("updateIdea", () => {
    it("should update idea successfully", async () => {
      const updatedIdea = { ...mockIdea, content: "Updated Idea" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedIdea,
      });

      const result = await updateIdea("idea-1", { content: "Updated Idea" });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/ideas/idea-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ content: "Updated Idea" }),
        }),
      );
      expect(result).toEqual(updatedIdea);
    });

    it("should throw on not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Idea not found" }),
      });

      await expect(
        updateIdea("idea-1", { content: "Updated" }),
      ).rejects.toThrow("Idea not found");
    });

    it("should throw on validation error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Idea content cannot be empty" }),
      });

      await expect(updateIdea("idea-1", { content: "" })).rejects.toThrow(
        "Idea content cannot be empty",
      );
    });
  });

  describe("deleteIdea", () => {
    it("should delete idea successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await expect(deleteIdea("idea-1")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/ideas/idea-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("moveIdea", () => {
    it("should move idea to new status", async () => {
      const movedIdea = { ...mockIdea, status: "Pronto" as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => movedIdea,
      });

      const result = await moveIdea("idea-1", "Pronto");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/ideas/idea-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "Pronto" }),
        }),
      );
      expect(result).toEqual(movedIdea);
    });
  });
});
