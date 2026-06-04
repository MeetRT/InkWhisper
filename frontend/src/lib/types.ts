/**
 * Shared TypeScript interfaces that mirror the backend StoryNode schema.
 * Keep this file as the single source of truth for the data contract.
 */

export interface StoryNode {
  id: number;
  title: string;
  standaloneSynopsis: string;
  textContent: string;
  wordCount: number;
  isPremium: boolean;
  createdAt: string; // ISO-8601 datetime string
}

/** Payload accepted by POST /admin/nodes */
export interface CreateStoryNodePayload {
  title: string;
  standaloneSynopsis?: string;
  textContent: string;
  isPremium?: boolean;
}
