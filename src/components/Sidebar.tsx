"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const items = [
  ["⌂", "Início", "/"], ["♙", "Alunos", "/students"], ["♟", "Professores", "/teachers"],
  ["◈", "Modalidades", "/modalities"], ["▦", "Turmas", "/classes"], ["＄", "Financeiro", "/finance"],
  ["◉", "Comunicados", "/comunicados"], ["▣", "Agenda", "/agenda"], ["▤", "Relatórios", "/relatorios"],
  ["♧", "Responsáveis", "/responsaveis"], ["⚿", "Contas e acessos", "/acessos"],
] as const;

const mobilePrimary = [items[0], items[1], items[4], items[5]] as const;
const mobileMore = items.filter((item) => !mobilePrimary.some((primary) => primary[2] === item[2]));

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    const { error } = await createClient().auth.signOut();
    if (error) {
      setSigningOut(false);
      alert("Não foi possível encerrar a sessão. Tente novamente.");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  const linkClass = (href: string) =>
    pathname === href
      ? "bg-[#FFD200] font-bold text-black"
      : "text-neutral-300 hover:bg-white/5 hover:text-[#FFD200]";

  const moreActive = mobileMore.some(([, , href]) => pathname === href);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#080808] md:flex">
        <div className="border-b border-white/10 px-5 py-8">
          <p className="text-center text-sm font-black uppercase leading-snug tracking-[.13em] text-white">Escola de Lutas</p>
          <p className="mt-1 text-center text-lg font-black uppercase tracking-[.2em] text-[#FFD200]">Rafael Mota</p>
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#FFD200]" />
        </div>
        <p className="px-5 pt-7 text-[10px] font-bold uppercase tracking-[.2em] text-neutral-500">Menu principal</p>
        <nav className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
          {items.map(([icon, label, href]) => (
            <Link key={label} href={href} aria-current={pathname === href ? "page" : undefined} className={`flex gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${linkClass(href)}`}>
              <span className="w-4 text-center">{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button type="button" onClick={handleSignOut} disabled={signingOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-[#FFD200] disabled:opacity-50">
            <span aria-hidden="true">↪</span>{signingOut ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        {moreOpen && (
          <>
            <button type="button" aria-label="Fechar menu" className="fixed inset-0 bg-black/60" onClick={() => setMoreOpen(false)} />
            <section className="absolute inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] rounded-2xl border border-white/10 bg-[#141414] p-3 shadow-2xl">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Mais áreas</p>
                <button type="button" onClick={() => setMoreOpen(false)} className="rounded-lg px-2 py-1 text-sm text-neutral-400">Fechar</button>
              </div>
              <nav aria-label="Mais opções" className="grid grid-cols-2 gap-2">
                {mobileMore.map(([icon, label, href]) => (
                  <Link key={href} href={href} className={`flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-sm ${linkClass(href)}`}>
                    <span className="w-5 text-center">{icon}</span><span>{label}</span>
                  </Link>
                ))}
                <button type="button" onClick={handleSignOut} disabled={signingOut} className="flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/5 disabled:opacity-50">
                  <span className="w-5 text-center">↪</span>{signingOut ? "Saindo..." : "Sair da conta"}
                </button>
              </nav>
            </section>
          </>
        )}
        <nav aria-label="Navegação principal" className="relative flex items-stretch justify-around border-t border-white/10 bg-[#080808]/95 px-1 pt-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] backdrop-blur">
          {mobilePrimary.map(([icon, label, href]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] ${linkClass(href)}`}>
              <span className="text-lg leading-none">{icon}</span><span className="max-w-full truncate">{label}</span>
            </Link>
          ))}
          <button type="button" aria-expanded={moreOpen} aria-controls="mobile-more-menu" onClick={() => setMoreOpen((open) => !open)} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] ${moreOpen || moreActive ? "bg-[#FFD200] font-bold text-black" : "text-neutral-300"}`}>
            <span className="text-lg leading-none">•••</span><span>Mais</span>
          </button>
        </nav>
      </div>
    </>
  );
}
