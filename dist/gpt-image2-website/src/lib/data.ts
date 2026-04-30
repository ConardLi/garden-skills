import casesJson from "../data/cases.json";
import docsJson from "../data/docs.json";
import type { CasesManifest, DocsManifest } from "../types";
import { loadTemplateMarkdown as loadTemplateMarkdownClient } from "./archive-client";

export const cases = casesJson as unknown as CasesManifest;
export const docs = docsJson as unknown as DocsManifest;

export async function loadTemplateMarkdown(category: string, template: string) {
  return loadTemplateMarkdownClient(category, template);
}

export function getCase(id: string) {
  return cases.cases.find((c) => c.id === id);
}

export function getRelatedCases(id: string) {
  const c = getCase(id);
  if (!c) return [];
  return cases.cases.filter(
    (x) => x.id !== id && x.template_key === c.template_key,
  );
}

export const ORDERED_CATEGORIES = [
  "poster-and-campaigns",
  "ui-mockups",
  "product-visuals",
  "portraits-and-characters",
  "avatars-and-profile",
  "scenes-and-illustrations",
  "storyboards-and-sequences",
  "grids-and-collages",
  "branding-and-packaging",
  "typography-and-text-layout",
  "maps",
  "slides-and-visual-docs",
  "infographics",
  "academic-figures",
  "technical-diagrams",
  "editing-workflows",
  "assets-and-props",
] as const;
