import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return out(405, { error: "Método não permitido." });
  const header = req.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) return out(401, { error: "Sessão não identificada." });
  const url = Deno.env.get("SUPABASE_URL"), anon = Deno.env.get("SUPABASE_ANON_KEY"), service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return out(500, { error: "Configuração interna incompleta." });
  const token = header.slice(7);
  const auth = createClient(url, anon, { global: { headers: { Authorization: header } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: current, error: authError } = await auth.auth.getUser(token);
  if (authError || !current.user) return out(401, { error: "Sessão inválida." });
  if (current.user.app_metadata?.force_password_change !== true) return out(400, { error: "Esta conta não exige troca inicial de senha." });
  let body: { password?: string };
  try { body = await req.json(); } catch { return out(400, { error: "Dados inválidos." }); }
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 10 || password.length > 128) return out(400, { error: "A nova senha deve ter entre 10 e 128 caracteres." });
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.updateUserById(current.user.id, { password, app_metadata: { ...current.user.app_metadata, force_password_change: false } });
  if (error) return out(400, { error: error.message });
  return out(200, { success: true, message: "Senha atualizada. Entre novamente com a nova senha." });
});