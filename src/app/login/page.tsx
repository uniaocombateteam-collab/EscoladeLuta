"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const supabase=createClient();
      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error) throw error;
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 py-12 text-white">
    <section className="w-full max-w-md">
      <div className="mb-9 flex items-center justify-center gap-3"><div className="text-4xl font-black italic text-[#d6ad55]">RM</div><div><p className="text-xs font-bold tracking-[.18em]">ESCOLA DE LUTAS</p><p className="mt-1 text-[10px] tracking-[.28em] text-[#d6ad55]">RAFAEL MOTA</p></div></div>
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-[#15151b] p-7 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-purple-300">Acesso restrito</p><h1 className="mt-2 text-2xl font-semibold">Entrar no sistema</h1><p className="mt-2 text-sm text-neutral-500">Use as credenciais fornecidas pela administração.</p>
        <label className="mt-7 block"><span className="mb-2 block text-xs text-neutral-400">E-mail</span><input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm outline-none focus:border-purple-500"/></label>
        <label className="mt-4 block"><span className="mb-2 block text-xs text-neutral-400">Senha</span><input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm outline-none focus:border-purple-500"/></label>
        {error&&<p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold hover:bg-purple-600 disabled:opacity-50">{loading?"Entrando...":"Entrar"}</button>
      </form>
      <p className="mt-5 text-center text-xs text-neutral-600">A criação de contas é controlada pela administração.</p>
    </section>
  </main>;
}
