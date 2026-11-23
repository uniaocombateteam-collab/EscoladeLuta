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
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: actor } = await admin.from("profiles").select("role").eq("id", current.user.id).maybeSingle();
  if (actor?.role !== "admin") return out(403, { error: "Somente a administração pode cadastrar professores." });
  let body: { full_name?: string; email?: string; password?: string };
  try { body = await req.json(); } catch { return out(400, { error: "Dados inválidos." }); }
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!fullName || fullName.length > 120) return out(400, { error: "Informe o nome completo." });
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out(400, { error: "Informe um e-mail válido." });
  if (password.length < 10 || password.length > 128) return out(400, { error: "A senha deve ter entre 10 e 128 caracteres." });
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName }, app_metadata: { role: "teacher", force_password_change: true } });
  if (error || !data.user) return out(400, { error: error?.message ?? "Não foi possível criar a conta." });
  const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, full_name: fullName, role: "teacher" });
  if (profileError) { await admin.auth.admin.deleteUser(data.user.id); return out(500, { error: "Falha ao criar perfil. A conta foi revertida." }); }
  return out(200, { success: true, message: "Conta criada com sucesso." });
});