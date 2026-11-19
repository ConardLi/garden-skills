import path from "node:path";
import { readFile } from "node:fs/promises";
import { mimeFor } from "./shared.js";

export const ATLAS_BASE_URL = "https://api.atlascloud.ai/api/v1";
export const ATLAS_GENERATE_MODEL = "qwen-image-3.0/text-to-image";
export const ATLAS_EDIT_MODEL = "qwen-image-3.0/edit";

function requireAtlasApiKey() {
  const apiKey = process.env.ATLASCLOUD_API_KEY;
  if (!apiKey) throw new Error("ATLASCLOUD_API_KEY is required for the Atlas provider.");
  return apiKey;
}

function atlasBaseUrl() {
  return (process.env.ATLASCLOUD_BASE_URL || ATLAS_BASE_URL).replace(/\/$/, "");
}

function atlasHeaders() {
  return {
    authorization: `Bearer ${requireAtlasApiKey()}`,
    "content-type": "application/json",
  };
}

function unwrapResponse(json) {
  return json?.data && typeof json.data === "object" ? json.data : json;
}

export function normalizeAtlasSize(size) {
  if (!size) return undefined;
  const match = String(size).trim().match(/^(\d{3,4})[x*](\d{3,4})$/i);
  if (!match) throw new Error("Atlas size must use WIDTHxHEIGHT, for example 1024x1024.");
  return `${match[1]}*${match[2]}`;
}

export function buildAtlasGeneratePayload({ prompt, model, size, n }) {
  const payload = {
    model: model || process.env.ATLASCLOUD_IMAGE_MODEL || ATLAS_GENERATE_MODEL,
    prompt,
  };
  const normalizedSize = normalizeAtlasSize(size);
  if (normalizedSize) payload.size = normalizedSize;
  if (n) payload.n = Number(n);
  return payload;
}

export async function imageToDataUrl(filePath) {
  const absolute = path.resolve(filePath);
  const bytes = await readFile(absolute);
  return `data:${mimeFor(absolute)};base64,${Buffer.from(bytes).toString("base64")}`;
}

export function buildAtlasEditPayload({ prompt, model, size, n, referenceImageUrl }) {
  const payload = {
    model: model || process.env.ATLASCLOUD_EDIT_MODEL || ATLAS_EDIT_MODEL,
    prompt,
    reference_image_urls: [referenceImageUrl],
  };
  const normalizedSize = normalizeAtlasSize(size);
  if (normalizedSize) payload.size = normalizedSize;
  if (n) payload.n = Number(n);
  return payload;
}

export async function submitAtlasImage(payload, fetchImpl = fetch) {
  const url = `${atlasBaseUrl()}/model/generateImage`;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: atlasHeaders(),
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Atlas image API error (${response.status}): ${await response.text()}`);
  }
  const prediction = unwrapResponse(await response.json());
  if (!prediction?.id) throw new Error("Atlas image API did not return a prediction id.");
  return { prediction, requestUrl: url };
}

export async function pollAtlasPrediction(predictionId, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const delayMs = options.delayMs ?? Number(process.env.ATLASCLOUD_POLL_INTERVAL_MS || 3000);
  const maxAttempts = options.maxAttempts ?? Number(process.env.ATLASCLOUD_MAX_POLL_ATTEMPTS || 40);
  const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const url = `${atlasBaseUrl()}/model/prediction/${encodeURIComponent(predictionId)}`;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetchImpl(url, {
      headers: atlasHeaders(),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`Atlas prediction API error (${response.status}): ${await response.text()}`);
    }
    const prediction = unwrapResponse(await response.json());
    const status = String(prediction?.status || "").toLowerCase();
    if (["completed", "succeeded"].includes(status)) {
      if (!Array.isArray(prediction.outputs) || !prediction.outputs[0]) {
        throw new Error("Atlas prediction completed without an output URL.");
      }
      return { prediction, requestUrl: url };
    }
    if (["failed", "canceled", "cancelled"].includes(status)) {
      throw new Error(`Atlas prediction ${status}: ${prediction?.error || "no error details"}`);
    }
    if (attempt < maxAttempts) await sleep(delayMs);
  }
  throw new Error(`Atlas prediction did not complete after ${maxAttempts} polls.`);
}

export function validateOutputUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Atlas output URL must be credential-free HTTPS.");
  }
  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "::1" ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    throw new Error("Atlas output URL cannot target a local or private host.");
  }
  return url.toString();
}

export async function downloadAtlasImage(rawUrl, fetchImpl = fetch) {
  const url = validateOutputUrl(rawUrl);
  const response = await fetchImpl(url, {
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Failed to download Atlas image (${response.status}).`);
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > 64 * 1024 * 1024) throw new Error("Atlas output exceeds the 64 MiB download limit.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 64 * 1024 * 1024) throw new Error("Atlas output exceeds the 64 MiB download limit.");
  return bytes;
}
