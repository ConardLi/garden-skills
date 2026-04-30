import { ArgumentValue } from "../types/prompt";

export function extractPlaceholders(template: string): string[] {
  const regex = /{([^}:]+)(?::[^}]+)?}/g;
  const matches = template.match(regex);
  if (!matches) {
    return [];
  }
  return Array.from(new Set(matches.map(match => match.substring(1, match.indexOf(":") > -1 ? match.indexOf(":") : match.length - 1))));
}

export function renderPrompt(template: string, args: Record<string, ArgumentValue>): string {
  let rendered = template;
  for (const key in args) {
    const value = args[key];
    // Replace {key} and {key:default} placeholders
    rendered = rendered.replace(new RegExp(`{${key}(?::[^}]+)?}`, "g"), String(value));
  }
  // Remove any remaining placeholders with defaults if not provided
  rendered = rendered.replace(/{([^}:]+):([^}]+)}/g, (match, key, defaultValue) => {
    return args[key] !== undefined ? String(args[key]) : defaultValue;
  });
  // Remove any remaining placeholders without defaults
  rendered = rendered.replace(/{([^}]+)}/g, "");
  return rendered;
}

export function parseTemplate(template: string): { md: string, placeholders: string[] } {
  return {
    md: template,
    placeholders: extractPlaceholders(template),
  };
}
