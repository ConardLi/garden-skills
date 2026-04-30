import { ArchiveEntry, ArgumentValue } from "../types/prompt";

const API_BASE_URL = "http://localhost:3001"; // Assuming server.mjs runs on 3001

interface SavePromptPayload {
  category: string;
  template: string;
  args: Record<string, ArgumentValue>;
  prompt: string;
  format: "structured" | "json-flat";
  tags?: string[];
}

interface SavePromptResponse {
  ok: boolean;
  path?: string;
  slug?: string;
  error?: string;
}

interface ListArchiveResponse {
  entries: ArchiveEntry[];
}

interface LoadTemplateResponse {
  md: string;
  placeholders: string[];
}

export async function savePrompt(payload: SavePromptPayload): Promise<SavePromptResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/save-prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  } catch (error) {
    console.error("Error saving prompt:", error);
    return { ok: false, error: (error as Error).message };
  }
}

export async function listArchive(params?: { category?: string; template?: string; q?: string }): Promise<ListArchiveResponse> {
  try {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const response = await fetch(`${API_BASE_URL}/list-archive?${query}`);
    return response.json();
  } catch (error) {
    console.error("Error listing archive:", error);
    return { entries: [] };
  }
}

export async function loadTemplateMarkdown(category: string, template: string): Promise<LoadTemplateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/load-template-md?category=${category}&template=${template}`);
    return response.json();
  } catch (error) {
    console.error("Error loading template markdown:", error);
    return { md: "", placeholders: [] };
  }
}
