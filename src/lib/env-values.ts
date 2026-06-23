export function readEnvValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return undefined;

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim() || undefined;
  }

  return value;
}

export function readEnvNumber(name: string) {
  const value = readEnvValue(name);
  return value ? Number(value) : 0;
}
