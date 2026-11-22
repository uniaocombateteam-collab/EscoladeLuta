"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    try { const db = createClient(); const { error } = await db.auth.signInWithPassword({ email, password }); if (error) throw error; const { data: { user } } = await db.auth.getUser(); const { data: profile } = await db.from("profiles").select("role").eq("id", user?.id ?? "").maybeSingle(); router.replace(profile?.role === "guardian" ? "/portal" : "/"); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Falha no login."); }
    finally { setBusy(false); }
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,210,0,.10),transparent_45%),linear-gradient(135deg,#050505,#141414_55%,#050505)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl md:grid-cols-2">
        <div className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden border-r border-white/10 bg-[linear-gradient(145deg,#111,#050505)] p-10 md:flex">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#FFD200]/15" />
          <div className="relative mt-16"><p className="text-sm font-bold uppercase tracking-[.3em] text-[#FFD200]">Escola de Lutas</p><h2 className="mt-3 text-5xl font-black uppercase leading-none">Rafael<br/>Mota</h2><div className="mt-6 h-1 w-20 bg-[#FFD200]"/><p className="mt-8 text-xs font-bold tracking-[.3em] text-neutral-300">DISCIPLINA · TÉCNICA · EVOLUÇÃO</p></div>
          <div className="relative"><p className="text-xs font-bold tracking-[.3em] text-[#FFD200]">MAIS QUE TREINAMENTO</p><h2 className="mt-3 text-4xl font-black uppercase leading-tight">Força para<br/> superar limites.</h2><p className="mt-4 text-sm text-neutral-400">Técnica, respeito, constância e comunidade.</p></div>
        </div>
        <div className="flex items-center justify-center p-7 sm:p-12"><form onSubmit={submit} className="w-full max-w-sm">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Escola de Lutas Rafael Mota</p>
          <h1 className="mt-3 text-3xl font-black">Acesse o sistema</h1><p className="mt-2 text-sm text-neutral-400">Faça login para continuar.</p>
          <label className="mt-8 block text-xs font-semibold text-neutral-300">E-mail<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#FFD200]"/></label>
          <label className="mt-4 block text-xs font-semibold text-neutral-300">Senha<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#FFD200]"/></label>
          {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
          <button disabled={busy} className="mt-7 w-full rounded-xl bg-[#FFD200] p-3.5 text-sm font-black text-black transition hover:bg-[#ffe04a] disabled:opacity-50">{busy?"Entrando...":"Entrar"}</button>
          <p className="mt-6 text-center text-xs text-neutral-500">Acesso destinado a usuários cadastrados pela administração.</p>
          <p className="mt-4 text-center text-xs text-neutral-400">Ainda não conhece a academia? <Link href="/conheca" className="font-semibold text-[#FFD200] hover:underline">Conheça nossas modalidades</Link></p>
        </form></div>
      </div>
    </main>
  );
}
