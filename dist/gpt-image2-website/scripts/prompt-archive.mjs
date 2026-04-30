import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPT_ARCHIVE_BASE = path.join(__dirname, "../prompt-archive");

// Ensure the base archive directory exists
async function ensureArchiveDir() {
  await fs.mkdir(PROMPT_ARCHIVE_BASE, { recursive: true });
}

export async function saveMarkdown(category, template, slug, frontmatter, content) {
  await ensureArchiveDir();
  const categoryDir = path.join(PROMPT_ARCHIVE_BASE, category);
  await fs.mkdir(categoryDir, { recursive: true });
  const templateDir = path.join(categoryDir, template);
  await fs.mkdir(templateDir, { recursive: true });

  const filePath = path.join(templateDir, `${slug}.md`);
  const fileContent = matter.stringify(content, frontmatter);
  await fs.writeFile(filePath, fileContent, "utf8");
  return filePath;
}

export async function listArchive() {
  await ensureArchiveDir();
  const entries = [];
  const categories = await fs.readdir(PROMPT_ARCHIVE_BASE, { withFileTypes: true });

  for (const categoryDirent of categories) {
    if (categoryDirent.isDirectory()) {
      const categoryPath = path.join(PROMPT_ARCHIVE_BASE, categoryDirent.name);
      const templates = await fs.readdir(categoryPath, { withFileTypes: true });

      for (const templateDirent of templates) {
        if (templateDirent.isDirectory()) {
          const templatePath = path.join(categoryPath, templateDirent.name);
          const files = await fs.readdir(templatePath, { withFileTypes: true });

          for (const fileDirent of files) {
            if (fileDirent.isFile() && fileDirent.name.endsWith(".md")) {
              const filePath = path.join(templatePath, fileDirent.name);
              const fileContent = await fs.readFile(filePath, "utf8");
              const { data } = matter(fileContent);
              entries.push({
                category: categoryDirent.name,
                template: templateDirent.name,
                slug: fileDirent.name.replace(".md", ""),
                ...data,
              });
            }
          }
        }
      }
    }
  }
  return entries;
}

export async function readArchive(category, template, slug) {
  await ensureArchiveDir();
  const filePath = path.join(PROMPT_ARCHIVE_BASE, category, template, `${slug}.md`);
  const fileContent = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(fileContent);
  return { frontmatter: data, content };
}
