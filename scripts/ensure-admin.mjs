import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "contact@totem-ancestral.com").toLowerCase();

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const cwd = process.cwd();
const env = {
  ...parseEnvFile(path.join(cwd, ".env")),
  ...parseEnvFile(path.join(cwd, ".env.local")),
  ...process.env,
};

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase service credentials");
}

if (!adminPassword) {
  throw new Error("Missing ADMIN_PASSWORD");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 100) return null;
  }
  return null;
}

const existing = await findUserByEmail(ADMIN_EMAIL);
const userPayload = {
  email: ADMIN_EMAIL,
  password: adminPassword,
  email_confirm: true,
  user_metadata: { prenom: "Admin", role: "admin" },
};

const { data: authData, error: authError } = existing
  ? await supabase.auth.admin.updateUserById(existing.id, userPayload)
  : await supabase.auth.admin.createUser(userPayload);

if (authError) throw authError;

const user = authData.user;
if (!user) throw new Error("Admin user was not returned by Supabase");

const { error: profileError } = await supabase.from("profiles").upsert({
  id: user.id,
  email: ADMIN_EMAIL,
  prenom: "Admin",
  langue: "fr",
});

if (profileError) throw profileError;

const { error: roleError } = await supabase
  .from("user_roles")
  .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

if (roleError) throw roleError;

const { error: userRoleError } = await supabase
  .from("user_roles")
  .delete()
  .eq("user_id", user.id)
  .eq("role", "user");

if (userRoleError) throw userRoleError;

console.log(JSON.stringify({ email: ADMIN_EMAIL, id: user.id, role: "admin" }, null, 2));
