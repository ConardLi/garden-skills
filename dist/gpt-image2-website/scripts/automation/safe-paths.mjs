import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the base directory for skills references
const SKILLS_BASE_DIR = path.join(__dirname, "../../../skills/gpt-image-2/references");

// Resolve the base directory for prompt archives
const PROMPT_ARCHIVE_BASE_DIR = path.join(__dirname, "../prompt-archive");

/**
 * Ensures a given path is safe and within a specified base directory.
 * @param {string} baseDir - The allowed base directory.
 * @param {string} inputPath - The path to validate.
 * @returns {string} The resolved safe path.
 * @throws {Error} If the path is outside the base directory.
 */
function getSafePath(baseDir, inputPath) {
  const resolvedPath = path.resolve(baseDir, inputPath);
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error("Path traversal detected: " + inputPath);
  }
  return resolvedPath;
}

/**
 * Validates and returns a safe path for skill template markdown files.
 * @param {string} category - The category of the template.
 * @param {string} template - The template name.
 * @returns {string} The safe, resolved path to the template file.
 */
export function getSkillTemplatePath(category, template) {
  // Basic sanitization for category and template to prevent obvious attacks
  const sanitizedCategory = category.replace(/[^a-zA-Z0-9-]/g, "");
  const sanitizedTemplate = template.replace(/[^a-zA-Z0-9-]/g, "");
  const relativePath = path.join(sanitizedCategory, sanitizedTemplate, ".md");
  return getSafePath(SKILLS_BASE_DIR, relativePath);
}

/**
 * Validates and returns a safe path for saving prompt archive markdown files.
 * @param {string} category - The category for the archive.
 * @param {string} template - The template name for the archive.
 * @param {string} slug - The slug for the archive entry.
 * @returns {string} The safe, resolved path where the archive file should be saved.
 */
export function getPromptArchivePath(category, template, slug) {
  // Basic sanitization for category, template, and slug
  const sanitizedCategory = category.replace(/[^a-zA-Z0-9-]/g, "");
  const sanitizedTemplate = template.replace(/[^a-zA-Z0-9-]/g, "");
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-]/g, "");
  const relativePath = path.join(sanitizedCategory, sanitizedTemplate, `${sanitizedSlug}.md`);
  return getSafePath(PROMPT_ARCHIVE_BASE_DIR, relativePath);
}
