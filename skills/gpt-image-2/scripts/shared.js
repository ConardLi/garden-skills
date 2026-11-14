import path from "node:path";
import process from "node:process";
import { homedir } from "node:os";
import { mkdir, readFile, writeFile } from "node:fs/promises";

export const DEFAULT_IMAGE_DIR = "garden-gpt-image-2/image";
export const DEFAULT_PROMPT_DIR = "garden-gpt-image-2/prompt";
export const DEFAULT_MODEL = "gpt-image-2";

export async function readEnvFile(filePath) {
  try {
    const text = await readFile(filePath, "utf8");
    const result = {};
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const pivot = trimmed.indexOf("=");
      if (pivot === -1) continue;
      const key = trimmed.slice(0, pivot).trim();
      let value = trimmed.slice(pivot + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export async function loadAmbientEnv() {
  const places = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), ".gateway.env"),
    path.join(homedir(), ".gateway.env"),
  ];

  for (const filePath of places) {
    const pairs = await readEnvFile(filePath);
    for (const [key, value] of Object.entries(pairs)) {
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export async function readPromptInput(prompt, promptFile) {
  if (prompt) return prompt.trim();
  if (promptFile) {
    const text = await readFile(path.resolve(promptFile), "utf8");
    return text.trim();
  }
  throw new Error("Prompt is required. Use --prompt or --promptfile.");
}

export function slugify(value, fallback = "image-task") {
  const base = String(value || "").trim().toLowerCase();
  const ascii = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return ascii || fallback;
}

export function makeTimestamp() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

export function buildDefaultImagePath(kind, hint, ext = ".png") {
  const stamp = makeTimestamp();
  const slug = slugify(hint, kind === "edit" ? "edited-image" : "generated-image");
  const file = `${slug}-${stamp}${ext}`;
  return path.join(DEFAULT_IMAGE_DIR, file);
}

export function buildDefaultPromptPath(hint) {
  const stamp = makeTimestamp();
  const slug = slugify(hint, "prompt");
  return path.join(DEFAULT_PROMPT_DIR, `${slug}-${stamp}.md`);
}

export function resolveOutput(raw, fallbackPath) {
  const target = raw || fallbackPath;
  const full = path.resolve(target);
  return path.extname(full) ? full : `${full}.png`;
}

export async function savePrompt(promptText, rawPath, hint) {
  const finalPath = path.resolve(rawPath || buildDefaultPromptPath(hint));
  await mkdir(path.dirname(finalPath), { recursive: true });
  await writeFile(finalPath, `${promptText.trim()}\n`, "utf8");
  return finalPath;
}

export function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

export async function ensureFilesExist(files, label) {
  for (const item of files) {
    try {
      await readFile(path.resolve(item));
    } catch {
      throw new Error(`${label} not found: ${path.resolve(item)}`);
    }
  }
}

export async function encodeImages(files) {
  const images = [];
  for (const file of files) {
    const absolute = path.resolve(file);
    const bytes = await readFile(absolute);
    images.push({
      name: path.basename(absolute),
      mime_type: mimeFor(absolute),
      data: Buffer.from(bytes).toString("base64"),
      absolute,
    });
  }
  return images;
}

export function buildBaseUrl() {
  return (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
}

export function imageProvider() {
  const explicit = String(process.env.GARDEN_IMAGE_PROVIDER || "").trim().toLowerCase();
  if (explicit && !["openai", "atlas"].includes(explicit)) {
    throw new Error("GARDEN_IMAGE_PROVIDER must be openai or atlas.");
  }
  if (explicit) return explicit;
  if (process.env.ATLASCLOUD_API_KEY && !process.env.OPENAI_API_KEY) return "atlas";
  return "openai";
}

export function requireApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required.");
  return apiKey;
}

export async function postJson(url, payload) {
  const apiKey = requireApiKey();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image API error (${res.status}): ${text}`);
  }

  return res.json();
}

export async function postMultipart(url, form) {
  const apiKey = requireApiKey();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image API error (${res.status}): ${text}`);
  }

  return res.json();
}

export async function fetchBytesFromUrl(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to download generated image (${res.status}): ${text}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function extractGeneratedBytes(json) {
  const first = json?.data?.[0];
  if (!first) throw new Error("API response did not include data[0].");
  if (first.b64_json) return Buffer.from(first.b64_json, "base64");
  if (first.url) return fetchBytesFromUrl(first.url);
  throw new Error("API response did not include b64_json or url.");
}

export async function saveImage(outputPath, bytes) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);
}

export function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function appendIfPresent(target, key, value) {
  if (value === undefined || value === null || value === "") return;
  target.append(key, String(value));
}
