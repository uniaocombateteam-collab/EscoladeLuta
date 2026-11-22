import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "Método não permitido." });

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return reply(401, { error: "Sessão não identificada." });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return reply(500, { error: "Configuração interna de autenticação incompleta." });

  const token = authorization.slice("Bearer ".length);
  const authClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return reply(401, { error: "Sessão inválida ou expirada." });

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: actor, error: actorError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (actorError || actor?.role !== "admin") return reply(403, { error: "Somente a gestão pode convidar professores." });

  let payload: { email?: unknown; full_name?: unknown };
  try {
    payload = await req.json();
  } catch {
    return reply(400, { error: "Corpo da solicitação inválido." });
  }
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const fullName = typeof payload.full_name === "string" ? payload.full_name.trim() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(400, { error: "Informe um e-mail válido." });
  }
  if (!fullName || fullName.length > 120) {
    return reply(400, { error: "Informe o nome completo do professor." });
  }

  const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: "https://escoladeluta1343.vercel.app/auth/callback?next=%2F",
  });
  if (inviteError || !invitation.user) {
    return reply(400, { error: inviteError?.message ?? "Não foi possível enviar o convite." });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: invitation.user.id,
    full_name: fullName,
    role: "teacher",
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(invitation.user.id);
    return reply(500, { error: "Não foi possível concluir o perfil docente. O convite foi revertido; tente novamente." });
  }

  return reply(200, { success: true, message: "Convite enviado. O professor receberá um e-mail para ativar o acesso." });
});
