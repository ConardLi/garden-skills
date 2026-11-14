import process from "node:process";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_IMAGE_DIR,
  DEFAULT_MODEL,
  appendIfPresent,
  buildBaseUrl,
  buildDefaultImagePath,
  ensureFilesExist,
  extractGeneratedBytes,
  imageProvider,
  loadAmbientEnv,
  mimeFor,
  postMultipart,
  printJson,
  readPromptInput,
  resolveOutput,
  saveImage,
  savePrompt,
  slugify,
} from "./shared.js";
import {
  buildAtlasEditPayload,
  downloadAtlasImage,
  imageToDataUrl,
  pollAtlasPrediction,
  submitAtlasImage,
} from "./atlas.js";

function printHelp() {
  console.log(`Usage:
  node scripts/edit.js --image source.png --prompt "Replace the background with a studio set" --output out/edit.png

Options:
  --image <path>               Source image path (required)
  --mask <path>                Optional mask image path
  --prompt <text>              Edit prompt
  --promptfile <path>          Load prompt from a file
  --prompt-output <path>       Save the final prompt to a specific file
  --output <path>              Output image path (default: ${DEFAULT_IMAGE_DIR}/<slug>-<timestamp>.png)
  --model <name>               Model override (default: ${DEFAULT_MODEL})
  --size <WxH|auto>            Output size
  --n <count>                  Number of images
  --quality <level>            auto | high | medium | low
  --background <mode>          transparent | opaque | auto
  --input-fidelity <level>     low | high
  --output-format <format>     png | jpeg | webp
  --output-compression <0-100> Compression for jpeg/webp
  --moderation <level>         low | auto
  --json                       Print structured output
  -h, --help                   Show help`);
}

function parseCli(argv) {
  const cfg = {
    image: null,
    mask: null,
    prompt: null,
    promptFile: null,
    promptOutput: null,
    output: null,
    model: null,
    size: null,
    n: null,
    quality: null,
    background: null,
    inputFidelity: null,
    outputFormat: null,
    outputCompression: null,
    moderation: null,
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
    if (arg === "--image") {
      cfg.image = argv[++i] || null;
      if (!cfg.image) throw new Error("Missing value for --image");
      continue;
    }
    if (arg === "--mask") {
      cfg.mask = argv[++i] || null;
      if (!cfg.mask) throw new Error("Missing value for --mask");
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
    if (arg === "--output") {
      cfg.output = argv[++i] || null;
      if (!cfg.output) throw new Error("Missing value for --output");
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
    if (arg === "--input-fidelity") {
      cfg.inputFidelity = argv[++i] || null;
      if (!cfg.inputFidelity) throw new Error("Missing value for --input-fidelity");
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
    if (arg === "--moderation") {
      cfg.moderation = argv[++i] || null;
      if (!cfg.moderation) throw new Error("Missing value for --moderation");
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  return cfg;
}

function buildRequestUrl() {
  return `${buildBaseUrl()}/images/edits`;
}

async function buildForm(cfg, prompt) {
  const form = new FormData();
  const imagePath = cfg.image;
  const imageBytes = await readFile(imagePath);
  form.append("image", new Blob([imageBytes], { type: mimeFor(imagePath) }), imagePath.split(/[\\/]/).pop());

  if (cfg.mask) {
    const maskBytes = await readFile(cfg.mask);
    form.append("mask", new Blob([maskBytes], { type: mimeFor(cfg.mask) }), cfg.mask.split(/[\\/]/).pop());
  }

  form.append("prompt", prompt);
  form.append("model", cfg.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL);
  appendIfPresent(form, "size", cfg.size);
  appendIfPresent(form, "n", cfg.n);
  appendIfPresent(form, "quality", cfg.quality);
  appendIfPresent(form, "background", cfg.background);
  appendIfPresent(form, "input_fidelity", cfg.inputFidelity);
  appendIfPresent(form, "output_format", cfg.outputFormat);
  appendIfPresent(form, "output_compression", cfg.outputCompression);
  appendIfPresent(form, "moderation", cfg.moderation);
  return form;
}

async function run() {
  const cfg = parseCli(process.argv.slice(2));
  if (cfg.help) {
    printHelp();
    return;
  }

  if (!cfg.image) throw new Error("--image is required");

  await loadAmbientEnv();
  await ensureFilesExist([cfg.image, ...(cfg.mask ? [cfg.mask] : [])], "Image file");
  const prompt = await readPromptInput(cfg.prompt, cfg.promptFile);
  const nameHint = slugify(prompt.split(/\s+/).slice(0, 8).join(" "), "edited-image");
  const promptPath = await savePrompt(prompt, cfg.promptOutput, nameHint);
  const outputPath = resolveOutput(cfg.output, buildDefaultImagePath("edit", nameHint));
  const provider = imageProvider();
  let model;
  let url;
  let json;
  let bytes;

  if (provider === "atlas") {
    if (cfg.mask) throw new Error("The Atlas qwen-image edit model does not support mask input.");
    if (cfg.quality || cfg.background || cfg.inputFidelity || cfg.outputFormat || cfg.outputCompression || cfg.moderation) {
      throw new Error("The Atlas provider does not accept OpenAI-only edit options.");
    }
    const payload = buildAtlasEditPayload({
      prompt,
      model: cfg.model,
      size: cfg.size,
      n: cfg.n,
      referenceImageUrl: await imageToDataUrl(cfg.image),
    });
    model = payload.model;
    const submitted = await submitAtlasImage(payload);
    const completed = await pollAtlasPrediction(submitted.prediction.id);
    url = submitted.requestUrl;
    json = completed.prediction;
    bytes = await downloadAtlasImage(json.outputs[0]);
  } else {
    const form = await buildForm(cfg, prompt);
    model = cfg.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
    url = buildRequestUrl();
    json = await postMultipart(url, form);
    bytes = await extractGeneratedBytes(json);
  }
  await saveImage(outputPath, bytes);

  if (cfg.json) {
    printJson({
      savedImage: outputPath,
      savedPrompt: promptPath,
      provider,
      model,
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
