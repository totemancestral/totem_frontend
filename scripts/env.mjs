import fs from "node:fs";

const initialEnvKeys = new Set(Object.keys(process.env));

loadEnvFile(".env", false);
loadEnvFile(".env.local", true);

export function readEnv(name, aliases = []) {
  for (const key of [name, ...aliases]) {
    const value = process.env[key]?.trim();
    if (value) return unquote(value);
  }

  return undefined;
}

export function requireEnv(name, aliases = []) {
  const value = readEnv(name, aliases);
  if (value) return value;

  throw new Error(`Missing ${[name, ...aliases].join(" or ")}`);
}

export function getSupabaseRef(url) {
  return new URL(url).host.split(".")[0];
}

function loadEnvFile(file, overrideLoadedValues) {
  if (!fs.existsSync(file)) return;

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (initialEnvKeys.has(key)) continue;
    if (!overrideLoadedValues && process.env[key]) continue;

    process.env[key] = expandVariables(unquote(rawValue));
  }
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function expandVariables(value) {
  return value.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_match, key) => process.env[key] ?? "");
}
