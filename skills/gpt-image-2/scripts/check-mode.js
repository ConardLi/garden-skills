#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { loadAmbientEnv, DEFAULT_MODEL } from "./shared.js";

await loadAmbientEnv();

const TRUTHY = new Set(["1", "true", "yes", "on", "y"]);

function parseList(value) {
  return String(value || "")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function tokenExpired(token) {
  const claims = decodeJwtPayload(token);
  const exp = claims?.exp;
  return typeof exp === "number" && exp > 0 && Date.now() / 1000 > exp;
}

async function readCodexAuthStatus() {
  const authPath = path.join(homedir(), ".codex", "auth.json");
  try {
    const json = JSON.parse(await readFile(authPath, "utf8"));
    const token = json?.tokens?.access_token;
    const hasToken = typeof token === "string" && token.trim().length > 0;
    return {
      path: authPath,
      exists: true,
      has_access_token: hasToken,
      access_token_expired: hasToken ? tokenExpired(token) : null,
      account_id_present: typeof json?.tokens?.account_id === "string" && json.tokens.account_id.length > 0,
      auth_mode: typeof json?.auth_mode === "string" ? json.auth_mode : null,
    };
  } catch {
    return {
      path: authPath,
      exists: false,
      has_access_token: false,
      access_token_expired: null,
      account_id_present: false,
      auth_mode: null,
    };
  }
}

const rawFlag = String(process.env.ENABLE_GARDEN_IMAGEGEN || "").trim().toLowerCase();
const gardenEnabled = TRUTHY.has(rawFlag);

const apiKey = process.env.OPENAI_API_KEY || "";
const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;

const explicitHostTools = parseList(
  process.env.HOST_IMAGEGEN_TOOLS ||
    process.env.HOST_IMAGEGEN_TOOL ||
    process.env.IMAGEGEN_TOOLS ||
    process.env.IMAGEGEN_TOOL
);
const codexAuth = await readCodexAuthStatus();
const codexImagegenEnabled = codexAuth.has_access_token && codexAuth.access_token_expired !== true;

const hostImageTools = [...explicitHostTools];
const uniqueHostImageTools = [...new Set(hostImageTools)];
const hasHostImagegen = uniqueHostImageTools.length > 0;

let recommendation;
let mode;
let summary;

if (gardenEnabled && apiKey) {
  mode = "A";
  recommendation = "garden";
  summary =
    "MODE A · Garden 本地生图：用 scripts/generate.js / scripts/edit.js 直接出图并落盘。";
} else if (gardenEnabled && !apiKey) {
  mode = "A?";
  recommendation = "garden-missing-key";
  summary =
    "ENABLE_GARDEN_IMAGEGEN 已开，但缺 OPENAI_API_KEY。先向用户索要 key，或临时降级到 MODE B / C。";
} else if (hasHostImagegen) {
  mode = "B";
  recommendation = "host-native";
  summary =
    `MODE B · Host-Native：检测到宿主图像能力信号（${uniqueHostImageTools.join(", ")}）。渲染最终 prompt 后交给宿主图像工具出图。`;
} else if (codexImagegenEnabled) {
  mode = "codex";
  recommendation = "codex-oauth";
  summary =
    "MODE CODEX · 使用 ~/.codex/auth.json 的 Codex OAuth token，通过 ChatGPT/Codex Responses image_generation 生成图片。";
} else {
  mode = "B-or-C";
  recommendation = "host-or-advisor";
  summary =
    "MODE B / C · 未启用 Garden，也未在 ~/.codex/auth.json 检测到可用 Codex token。脚本无法可靠内省宿主 Agent 工具；若宿主自带图像工具 → MODE B：把 prompt 交给宿主出图；否则 → MODE C：仅产出高质量 prompt。";
}

const result = {
  mode,
  recommendation,
  garden_mode_enabled: gardenEnabled,
  has_api_key: Boolean(apiKey),
  codex_imagegen_detected: codexImagegenEnabled,
  codex_auth: codexAuth,
  host_imagegen_detected: hasHostImagegen,
  host_imagegen_tools: uniqueHostImageTools,
  codex_imagegen_enabled: codexImagegenEnabled,
  base_url: baseUrl,
  model,
  env_flag_value: rawFlag || "(unset)",
  summary,
};

const wantJson = process.argv.includes("--json");

if (wantJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const pad = (s) => s.padEnd(24, " ");
  console.log("--- gpt-image-2 runtime mode ---");
  console.log(`${pad("mode")}: ${result.mode}`);
  console.log(`${pad("recommendation")}: ${result.recommendation}`);
  console.log(`${pad("garden_mode_enabled")}: ${result.garden_mode_enabled}`);
  console.log(`${pad("has_api_key")}: ${result.has_api_key}`);
  console.log(`${pad("codex_imagegen_detected")}: ${result.codex_imagegen_detected}`);
  console.log(`${pad("codex_auth_path")}: ${result.codex_auth.path}`);
  console.log(`${pad("codex_auth_exists")}: ${result.codex_auth.exists}`);
  console.log(`${pad("codex_has_token")}: ${result.codex_auth.has_access_token}`);
  console.log(`${pad("codex_token_expired")}: ${result.codex_auth.access_token_expired}`);
  console.log(`${pad("host_imagegen_detected")}: ${result.host_imagegen_detected}`);
  console.log(`${pad("host_imagegen_tools")}: ${result.host_imagegen_tools.join(", ") || "(none)"}`);
  console.log(`${pad("codex_imagegen_enabled")}: ${result.codex_imagegen_enabled}`);
  console.log(`${pad("base_url")}: ${result.base_url}`);
  console.log(`${pad("model")}: ${result.model}`);
  console.log(`${pad("env_flag_value")}: ${result.env_flag_value}`);
  console.log("");
  console.log(result.summary);
}
