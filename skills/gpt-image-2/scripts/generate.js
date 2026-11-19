import process from "node:process";
import {
  DEFAULT_IMAGE_DIR,
  DEFAULT_MODEL,
  buildBaseUrl,
  buildDefaultImagePath,
  ensureFilesExist,
  extractGeneratedBytes,
  imageProvider,
  loadAmbientEnv,
  printJson,
  readPromptInput,
  resolveOutput,
  saveImage,
  savePrompt,
  postJson,
  slugify,
} from "./shared.js";
import {
  buildAtlasGeneratePayload,
  downloadAtlasImage,
  pollAtlasPrediction,
  submitAtlasImage,
} from "./atlas.js";

function printHelp() {
  console.log(`Usage:
  node scripts/generate.js --prompt "A cute baby sea otter" --image out/otter.png

Options:
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

  const provider = imageProvider();
  let payload;
  let url;
  let json;
  let bytes;

  if (provider === "atlas") {
    if (cfg.quality || cfg.background || cfg.moderation || cfg.outputFormat || cfg.outputCompression) {
      throw new Error("The Atlas provider does not accept OpenAI-only quality, background, moderation, or output-format options.");
    }
    payload = buildAtlasGeneratePayload({ prompt, model: cfg.model, size: cfg.size, n: cfg.n });
    const submitted = await submitAtlasImage(payload);
    const completed = await pollAtlasPrediction(submitted.prediction.id);
    url = submitted.requestUrl;
    json = completed.prediction;
    bytes = await downloadAtlasImage(json.outputs[0]);
  } else {
    payload = buildPayload(cfg, prompt);
    url = buildRequestUrl();
    json = await postJson(url, payload);
    bytes = await extractGeneratedBytes(json);
  }
  await saveImage(outputPath, bytes);

  if (cfg.json) {
    printJson({
      savedImage: outputPath,
      savedPrompt: promptPath,
      provider,
      model: payload.model,
      requestUrl: url,
      apiResponse: json,
    });
    return;
  }

  console.log(outputPath);
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
