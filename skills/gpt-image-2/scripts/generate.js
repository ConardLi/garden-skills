import process from "node:process";
import path from "node:path";
import { homedir } from "node:os";
import { readFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import tls from "node:tls";
import {
  DEFAULT_IMAGE_DIR,
  DEFAULT_MODEL,
  buildBaseUrl,
  buildDefaultImagePath,
  ensureFilesExist,
  extractGeneratedBytes,
  loadAmbientEnv,
  printJson,
  readPromptInput,
  resolveOutput,
  saveImage,
  savePrompt,
  postJson,
  slugify,
} from "./shared.js";

const CODEX_BASE_URL = "https://chatgpt.com/backend-api/codex";
const HOST_IMAGEGEN_ENV_KEYS = [
  "HOST_IMAGEGEN_TOOLS",
  "HOST_IMAGEGEN_TOOL",
  "IMAGEGEN_TOOLS",
  "IMAGEGEN_TOOL",
];

function printHelp() {
  console.log(`Usage:
  node scripts/generate.js --prompt "A cute baby sea otter" --image out/otter.png

Options:
  --mode <api|codex|host|auto> api calls /images/generations, codex uses ChatGPT/Codex OAuth image_generation, host emits a host-tool request (default: auto)
  --prompt <text>              Prompt text
  --promptfile <path>          Load prompt from a file
  --prompt-output <path>       Save the final prompt to a specific file
  --image <path>               Output image path (default: ${DEFAULT_IMAGE_DIR}/<slug>-<timestamp>.png)
  --model <name>               Model override (default: ${DEFAULT_MODEL})
  --size <WxH>                 Output size
  --n <count>                  Number of images
  --quality <level>            auto | high | medium | low
  --background <mode>          transparent | opaque | auto
  --moderation <level>         low | auto
  --output-format <format>     png | jpeg | webp
  --output-compression <0-100> Compression for jpeg/webp
  --json                       Print structured output
  -h, --help                   Show help`);
}

function parseCli(argv) {
  const cfg = {
    prompt: null,
    promptFile: null,
    promptOutput: null,
    imagePath: null,
    mode: "auto",
    model: null,
    size: null,
    n: null,
    quality: null,
    background: null,
    moderation: null,
    outputFormat: null,
    outputCompression: null,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      cfg.help = true;
      continue;
    }
    if (arg === "--json") {
      cfg.json = true;
      continue;
    }
    if (arg === "--mode") {
      cfg.mode = argv[++i] || null;
      if (!["api", "codex", "host", "auto"].includes(cfg.mode)) throw new Error("Invalid --mode. Use api, codex, host, or auto.");
      continue;
    }
    if (arg === "--prompt") {
      cfg.prompt = argv[++i] || null;
      if (!cfg.prompt) throw new Error("Missing value for --prompt");
      continue;
    }
    if (arg === "--promptfile") {
      cfg.promptFile = argv[++i] || null;
      if (!cfg.promptFile) throw new Error("Missing value for --promptfile");
      continue;
    }
    if (arg === "--prompt-output") {
      cfg.promptOutput = argv[++i] || null;
      if (!cfg.promptOutput) throw new Error("Missing value for --prompt-output");
      continue;
    }
    if (arg === "--image") {
      cfg.imagePath = argv[++i] || null;
      if (!cfg.imagePath) throw new Error("Missing value for --image");
      continue;
    }
    if (arg === "--model") {
      cfg.model = argv[++i] || null;
      if (!cfg.model) throw new Error("Missing value for --model");
      continue;
    }
    if (arg === "--size") {
      cfg.size = argv[++i] || null;
      if (!cfg.size) throw new Error("Missing value for --size");
      continue;
    }
    if (arg === "--n") {
      cfg.n = argv[++i] || null;
      if (!cfg.n) throw new Error("Missing value for --n");
      continue;
    }
    if (arg === "--quality") {
      cfg.quality = argv[++i] || null;
      if (!cfg.quality) throw new Error("Missing value for --quality");
      continue;
    }
    if (arg === "--background") {
      cfg.background = argv[++i] || null;
      if (!cfg.background) throw new Error("Missing value for --background");
      continue;
    }
    if (arg === "--moderation") {
      cfg.moderation = argv[++i] || null;
      if (!cfg.moderation) throw new Error("Missing value for --moderation");
      continue;
    }
    if (arg === "--output-format") {
      cfg.outputFormat = argv[++i] || null;
      if (!cfg.outputFormat) throw new Error("Missing value for --output-format");
      continue;
    }
    if (arg === "--output-compression") {
      cfg.outputCompression = argv[++i] || null;
      if (!cfg.outputCompression) throw new Error("Missing value for --output-compression");
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  return cfg;
}

function buildPayload(cfg, prompt) {
  const payload = {
    prompt,
    model: cfg.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL,
  };
  if (cfg.size) payload.size = cfg.size;
  if (cfg.n) payload.n = Number(cfg.n);
  if (cfg.quality) payload.quality = cfg.quality;
  if (cfg.background) payload.background = cfg.background;
  if (cfg.moderation) payload.moderation = cfg.moderation;
  if (cfg.outputFormat) payload.output_format = cfg.outputFormat;
  if (cfg.outputCompression) payload.output_compression = Number(cfg.outputCompression);
  return payload;
}

function buildRequestUrl() {
  return `${buildBaseUrl()}/images/generations`;
}

function truthy(value) {
  return new Set(["1", "true", "yes", "on", "y"]).has(String(value || "").trim().toLowerCase());
}

function parseList(value) {
  return String(value || "")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hostImagegenTools() {
  return [
    ...new Set(
      HOST_IMAGEGEN_ENV_KEYS.flatMap((key) => parseList(process.env[key]))
    ),
  ];
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

function codexCloudflareHeaders(accessToken) {
  const headers = {
    "User-Agent": "codex_cli_rs/0.0.0 (gpt-image-2 skill)",
    originator: "codex_cli_rs",
  };
  const claims = decodeJwtPayload(accessToken);
  const accountId = claims?.["https://api.openai.com/auth"]?.chatgpt_account_id;
  if (typeof accountId === "string" && accountId) headers["ChatGPT-Account-ID"] = accountId;
  return headers;
}

async function readJsonFile(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function readCodexAccessToken() {
  const codexAuth = await readJsonFile(path.join(homedir(), ".codex", "auth.json"));
  const codexToken = codexAuth?.tokens?.access_token;
  if (typeof codexToken === "string" && codexToken.trim() && !tokenExpired(codexToken.trim())) {
    return codexToken.trim();
  }

  return null;
}

async function resolveMode(cfg) {
  if (cfg.mode !== "auto") return cfg.mode;
  if (truthy(process.env.ENABLE_GARDEN_IMAGEGEN) && process.env.OPENAI_API_KEY) return "api";
  if (hostImagegenTools().length) return "host";
  if (await readCodexAccessToken()) return "codex";
  return "host";
}

function buildHostRequest({ prompt, promptPath, outputPath, payload }) {
  return {
    kind: "host-imagegen-request",
    mode: "host",
    tool: "image_gen",
    prompt,
    savedPrompt: promptPath,
    requestedImage: outputPath,
    options: {
      model: payload.model,
      size: payload.size || null,
      quality: payload.quality || null,
      background: payload.background || null,
      output_format: payload.output_format || "png",
    },
    instructions:
      "This Node process cannot call the host agent image tool directly. The host agent should call its image generation tool with `prompt`, then copy the generated file to `requestedImage` if a stable project-local path is needed.",
  };
}

function resolveCodexImageOptions(cfg, payload) {
  const modelTiers = {
    "gpt-image-2-low": "low",
    "gpt-image-2-medium": "medium",
    "gpt-image-2-high": "high",
  };
  const requestedModel = cfg.model || process.env.OPENAI_IMAGE_MODEL || "gpt-image-2-medium";
  const quality = cfg.quality || modelTiers[requestedModel] || "medium";
  const imageModel = requestedModel in modelTiers ? "gpt-image-2" : (payload.model || DEFAULT_MODEL);
  return {
    chatModel: process.env.CODEX_IMAGE_CHAT_MODEL || "gpt-5.5",
    imageModel,
    tierModel: requestedModel,
    size: cfg.size || payload.size || "1024x1024",
    quality,
    outputFormat: cfg.outputFormat || payload.output_format || "png",
    background: cfg.background || payload.background || "opaque",
  };
}

function buildCodexResponsesPayload(prompt, options) {
  return {
    model: options.chatModel,
    store: false,
    instructions: "You are an assistant that must fulfill image generation requests by using the image_generation tool when provided.",
    input: [{
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: prompt }],
    }],
    tools: [{
      type: "image_generation",
      model: options.imageModel,
      size: options.size,
      quality: options.quality,
      output_format: options.outputFormat,
      background: options.background,
      partial_images: 1,
    }],
    tool_choice: {
      type: "allowed_tools",
      mode: "required",
      tools: [{ type: "image_generation" }],
    },
    stream: true,
  };
}

function getProxyUrl() {
  return (
    process.env.CODEX_PROXY_URL ||
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy ||
    ""
  ).trim();
}

async function createHttpsTunnel(targetUrl, proxyUrl, timeoutMs) {
  const proxy = new URL(proxyUrl);
  if (!["http:", "https:"].includes(proxy.protocol)) {
    throw new Error(`Unsupported proxy protocol: ${proxy.protocol}`);
  }

  const proxyTransport = proxy.protocol === "https:" ? https : http;
  const targetPort = targetUrl.port || "443";
  const connectPath = `${targetUrl.hostname}:${targetPort}`;

  return new Promise((resolve, reject) => {
    const headers = { host: connectPath };
    if (proxy.username || proxy.password) {
      const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
      headers["proxy-authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
    }

    const req = proxyTransport.request({
      host: proxy.hostname,
      port: proxy.port || (proxy.protocol === "https:" ? 443 : 80),
      method: "CONNECT",
      path: connectPath,
      headers,
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Proxy CONNECT timed out after ${timeoutMs}ms`));
    });
    req.once("connect", (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`Proxy CONNECT failed with HTTP ${res.statusCode}`));
        return;
      }
      const secureSocket = tls.connect({
        socket,
        servername: targetUrl.hostname,
      });
      secureSocket.once("secureConnect", () => resolve(secureSocket));
      secureSocket.once("error", reject);
    });
    req.once("error", reject);
    req.end();
  });
}

function extractImageB64(value) {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractImageB64(item);
      if (found) return found;
    }
    return null;
  }
  if (value.type === "image_generation_call" && typeof value.result === "string" && value.result) {
    return value.result;
  }
  if (typeof value.partial_image_b64 === "string" && value.partial_image_b64) {
    return value.partial_image_b64;
  }
  for (const child of Object.values(value)) {
    const found = extractImageB64(child);
    if (found) return found;
  }
  return null;
}

async function collectCodexImageB64(accessToken, prompt, options) {
  const body = JSON.stringify(buildCodexResponsesPayload(prompt, options));
  const url = new URL(`${CODEX_BASE_URL}/responses`);
  const transport = url.protocol === "http:" ? http : https;
  const connectTimeoutMs = Number(process.env.CODEX_CONNECT_TIMEOUT_MS || 30000);
  const proxyUrl = getProxyUrl();

  const res = await new Promise((resolve, reject) => {
    const startRequest = (socket = null) => {
      const requestOptions = {
        method: "POST",
        headers: {
          ...codexCloudflareHeaders(accessToken),
          accept: "text/event-stream",
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
      };
      if (socket) {
        const agent = new https.Agent({ keepAlive: false });
        agent.createConnection = () => socket;
        requestOptions.agent = agent;
      }

      const req = transport.request(
        url,
        requestOptions,
        resolve
      );
      req.setTimeout(connectTimeoutMs, () => {
        req.destroy(new Error(`Codex Responses API connection timed out after ${connectTimeoutMs}ms`));
      });
      req.on("error", reject);
      req.end(body);
    };

    if (proxyUrl && url.protocol === "https:") {
      createHttpsTunnel(url, proxyUrl, connectTimeoutMs).then(
        (socket) => startRequest(socket),
        reject
      );
      return;
    }
    startRequest();
  });

  if (res.statusCode < 200 || res.statusCode >= 300) {
    let errorBody = "";
    for await (const chunk of res) errorBody += chunk.toString("utf8");
    throw new Error(`Codex Responses API returned HTTP ${res.statusCode}: ${errorBody.slice(0, 500)}`);
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = null;
  let dataLines = [];
  let imageB64 = null;

  const flush = () => {
    if (!dataLines.length) {
      eventName = null;
      return;
    }
    const raw = dataLines.join("\n").trim();
    const event = eventName;
    eventName = null;
    dataLines = [];
    if (!raw || raw === "[DONE]") return;
    const payload = JSON.parse(raw);
    if (payload && typeof payload === "object" && event && !payload.type) payload.type = event;
    const found = extractImageB64(payload);
    if (found) imageB64 = found;
  };

  for await (const chunk of res) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line === "") {
        flush();
      } else if (line.startsWith(":")) {
        continue;
      } else if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
      }
    }
  }
  buffer += decoder.decode();
  if (buffer) {
    if (buffer.startsWith("event:")) eventName = buffer.slice("event:".length).trim();
    else if (buffer.startsWith("data:")) dataLines.push(buffer.slice("data:".length).trimStart());
  }
  flush();
  return imageB64;
}

async function run() {
  const cfg = parseCli(process.argv.slice(2));
  if (cfg.help) {
    printHelp();
    return;
  }

  await loadAmbientEnv();
  const prompt = await readPromptInput(cfg.prompt, cfg.promptFile);
  const nameHint = slugify(prompt.split(/\s+/).slice(0, 8).join(" "), "generated-image");
  const promptPath = await savePrompt(prompt, cfg.promptOutput, nameHint);
  const outputPath = resolveOutput(cfg.imagePath, buildDefaultImagePath("generate", nameHint));
  await ensureFilesExist([], "input");

  const payload = buildPayload(cfg, prompt);
  const mode = await resolveMode(cfg);

  if (mode === "host") {
    const hostRequest = buildHostRequest({ prompt, promptPath, outputPath, payload });
    const detectedTools = hostImagegenTools();
    if (detectedTools.length) hostRequest.detectedTools = detectedTools;
    if (cfg.json) {
      printJson(hostRequest);
      return;
    }

    console.log(`HOST_IMAGEGEN_REQUEST=${JSON.stringify(hostRequest)}`);
    return;
  }

  if (mode === "codex") {
    const accessToken = await readCodexAccessToken();
    if (!accessToken) {
      throw new Error("No usable Codex OAuth token found in ~/.codex/auth.json. Run `codex login` to refresh Codex credentials.");
    }
    const codexOptions = resolveCodexImageOptions(cfg, payload);
    const imageB64 = await collectCodexImageB64(accessToken, prompt, codexOptions);
    if (!imageB64) throw new Error("Codex response contained no image_generation_call result.");
    await saveImage(outputPath, Buffer.from(imageB64, "base64"));

    if (cfg.json) {
      printJson({
        savedImage: outputPath,
        savedPrompt: promptPath,
        mode,
        model: codexOptions.tierModel,
        imageModel: codexOptions.imageModel,
        chatModel: codexOptions.chatModel,
        size: codexOptions.size,
        quality: codexOptions.quality,
        requestUrl: `${CODEX_BASE_URL}/responses`,
      });
      return;
    }

    console.log(outputPath);
    return;
  }

  const url = buildRequestUrl();
  const json = await postJson(url, payload);
  const bytes = await extractGeneratedBytes(json);
  await saveImage(outputPath, bytes);

  if (cfg.json) {
    printJson({
      savedImage: outputPath,
      savedPrompt: promptPath,
      model: payload.model,
      requestUrl: url,
      apiResponse: json,
    });
    return;
  }

  console.log(outputPath);
}

run().catch((error) => {
  const message =
    error instanceof Error
      ? (error.message || error.stack || error.name || String(error))
      : String(error);
  const cause = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
  console.error(`${message}${cause}`);
  process.exit(1);
});
