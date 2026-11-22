"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  ["⌂", "Início", "/"], ["♙", "Alunos", "/students"],
  ["♟", "Professores", "#"], ["◈", "Modalidades", "#"],
  ["▦", "Turmas", "#"], ["＄", "Financeiro", "#"],
  ["◉", "Comunicados", "#"], ["▣", "Agenda", "#"],
  ["▤", "Relatórios", "#"],
] as const;
export default function Sidebar() {
  const pathname = usePathname();
  return <>
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#101014] md:block">
      <div className="border-b border-white/10 px-6 py-7">
        <b className="text-3xl italic text-[#d6ad55]">RM</b>
        <p className="mt-1 text-xs tracking-[.18em]">ESCOLA DE LUTAS</p>
        <p className="text-[10px] tracking-[.28em] text-[#d6ad55]">RAFAEL MOTA</p>
      </div>
      <p className="px-5 pt-7 text-[10px] uppercase tracking-[.2em] text-neutral-500">Menu principal</p>
      <nav className="mt-3 space-y-1 px-3">
        {items.map(([icon,label,href]) => <Link key={label} href={href} aria-current={pathname===href?"page":undefined}
          className={`flex gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${pathname===href?"bg-purple-800/70 text-white":"text-neutral-400 hover:bg-white/5 hover:text-white"}`}>
          {icon} {label}
        </Link>)}
      </nav>
    </aside>
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-white/10 bg-[#101014]/95 p-2 backdrop-blur md:hidden">
      {items.map(([icon,label,href]) => <Link key={label} href={href} aria-current={pathname===href?"page":undefined}
        className={`flex min-w-fit flex-col items-center gap-1 rounded-lg px-3 py-2 text-[10px] ${pathname===href?"bg-purple-800/70 text-white":"text-neutral-400"}`}>
        <span className="text-base">{icon}</span>{label}
      </Link>)}
    </nav>
  </>;
}
