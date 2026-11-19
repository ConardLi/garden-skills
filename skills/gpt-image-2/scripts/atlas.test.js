import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAtlasEditPayload,
  buildAtlasGeneratePayload,
  normalizeAtlasSize,
  pollAtlasPrediction,
  validateOutputUrl,
} from "./atlas.js";

test("normalizes Atlas image sizes", () => {
  assert.equal(normalizeAtlasSize("1024x1024"), "1024*1024");
  assert.equal(normalizeAtlasSize("1440*900"), "1440*900");
  assert.throws(() => normalizeAtlasSize("square"), /WIDTHxHEIGHT/);
});

test("builds schema-compatible generation and edit payloads", () => {
  assert.deepEqual(
    buildAtlasGeneratePayload({ prompt: "a garden", model: "model/t2i", size: "1024x1024", n: "2" }),
    { model: "model/t2i", prompt: "a garden", size: "1024*1024", n: 2 },
  );
  assert.deepEqual(
    buildAtlasEditPayload({ prompt: "add rain", model: "model/edit", referenceImageUrl: "data:image/png;base64,AA==" }),
    { model: "model/edit", prompt: "add rain", reference_image_urls: ["data:image/png;base64,AA=="] },
  );
});

test("polls with GET until Atlas completes", async () => {
  process.env.ATLASCLOUD_API_KEY = "test-key";
  const statuses = ["processing", "completed"];
  const methods = [];
  const fetchImpl = async (_url, options) => {
    methods.push(options.method || "GET");
    const status = statuses.shift();
    return new Response(JSON.stringify({ data: { status, outputs: status === "completed" ? ["https://cdn.example.com/a.png"] : null } }));
  };
  const result = await pollAtlasPrediction("prediction-1", { fetchImpl, delayMs: 0, maxAttempts: 2, sleep: async () => {} });
  assert.equal(result.prediction.status, "completed");
  assert.deepEqual(methods, ["GET", "GET"]);
});

test("rejects unsafe output URLs", () => {
  assert.equal(validateOutputUrl("https://cdn.example.com/image.png"), "https://cdn.example.com/image.png");
  assert.throws(() => validateOutputUrl("http://cdn.example.com/image.png"), /credential-free HTTPS/);
  assert.throws(() => validateOutputUrl("https://127.0.0.1/image.png"), /local or private/);
});
