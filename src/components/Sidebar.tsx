"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
const items = [
  ["⌂", "Início", "/"], ["♙", "Alunos", "/students"], ["♟", "Professores", "/teachers"],
  ["◈", "Modalidades", "/modalities"], ["▦", "Turmas", "/classes"], ["＄", "Financeiro", "/finance"],
  ["◉", "Comunicados", "/comunicados"], ["▣", "Agenda", "/agenda"], ["▤", "Relatórios", "#"],
] as const;
export default function Sidebar() {
  const pathname=usePathname(); const router=useRouter(); const [signingOut,setSigningOut]=useState(false);
  async function handleSignOut(){if(signingOut)return;setSigningOut(true);const {error}=await createClient().auth.signOut();if(error){setSigningOut(false);alert("Não foi possível encerrar a sessão. Tente novamente.");return;}router.replace("/login");router.refresh();}
  return (<>
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#080808] md:flex">
      <div className="border-b border-white/10 px-5 py-8"><p className="text-center text-sm font-black uppercase leading-snug tracking-[.13em] text-white">Escola de Lutas</p><p className="mt-1 text-center text-lg font-black uppercase tracking-[.2em] text-[#FFD200]">Rafael Mota</p><div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#FFD200]"/></div>
      <p className="px-5 pt-7 text-[10px] font-bold uppercase tracking-[.2em] text-neutral-500">Menu principal</p>
      <nav className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto px-3">{items.map(([icon,label,href])=><Link key={label} href={href} aria-current={pathname===href?"page":undefined} className={`flex gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${pathname===href?"bg-[#FFD200] font-bold text-black":"text-neutral-300 hover:bg-white/5 hover:text-[#FFD200]"}`}><span className="w-4 text-center">{icon}</span>{label}</Link>)}</nav>
      <div className="border-t border-white/10 p-3"><button type="button" onClick={handleSignOut} disabled={signingOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-[#FFD200] disabled:opacity-50"><span aria-hidden="true">↪</span>{signingOut?"Saindo...":"Sair da conta"}</button></div>
    </aside>
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-white/10 bg-[#080808]/95 p-2 backdrop-blur md:hidden">{items.map(([icon,label,href])=><Link key={label} href={href} aria-current={pathname===href?"page":undefined} className={`flex min-w-fit flex-col items-center gap-1 rounded-lg px-3 py-2 text-[10px] ${pathname===href?"bg-[#FFD200] text-black":"text-neutral-300"}`}><span className="text-base">{icon}</span>{label}</Link>)}<button type="button" onClick={handleSignOut} disabled={signingOut} className="flex min-w-fit flex-col items-center gap-1 rounded-lg px-3 py-2 text-[10px] text-neutral-300 disabled:opacity-50"><span className="text-base" aria-hidden="true">↪</span>{signingOut?"Saindo...":"Sair"}</button></nav>
  </>);
}
