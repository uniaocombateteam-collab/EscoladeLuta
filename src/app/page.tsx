import Sidebar from "@/components/Sidebar";

const modalities = [
  { name: "Jiu-Jitsu", detail: "Técnica, estratégia e evolução no tatame", icon: "🥋", price: "R$ 80,00" },
  { name: "Boxe", detail: "Condicionamento, precisão e resistência", icon: "🥊", price: "R$ 80,00" },
  { name: "Kickboxing", detail: "Potência, coordenação e preparo físico", icon: "⚡", price: "R$ 80,00" },
  { name: "Capoeira", detail: "Movimento, cultura, ritmo e tradição", icon: "◎", price: "R$ 40,00" },
];
const quickLinks = [
  { title: "Alunos", detail: "Acesse os cadastros", href: "/students", icon: "♙" },
  { title: "Professores", detail: "Equipe e responsáveis", href: "/teachers", icon: "♟" },
  { title: "Modalidades", detail: "Gerencie as modalidades", href: "/modalities", icon: "◈" },
  { title: "Financeiro", detail: "Acompanhe as finanças", href: "/finance", icon: "＄" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/95 px-5 py-4 backdrop-blur">
            <div><p className="text-sm font-black uppercase tracking-[.16em] text-white sm:text-base">Escola de Lutas <span className="text-[#FFD200]">Rafael Mota</span></p><h1 className="text-xl font-semibold">Início</h1></div>
            <span className="hidden text-xs text-neutral-400 sm:block">Painel da academia</span>
          </header>
          <div className="mx-auto max-w-[1500px] space-y-8 p-5 pb-24 lg:p-8">
            <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#111]">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_30%,rgba(255,210,0,.13),transparent_40%),linear-gradient(110deg,#080808,#171717_65%,#080808)]" />
              <div className="grid items-center gap-8 p-7 md:grid-cols-[1.1fr_.9fr] md:p-10">
                <div>
                  <p className="text-xs font-bold tracking-[.28em] text-[#FFD200]">ESCOLA DE LUTAS RAFAEL MOTA</p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5" aria-label="Convênios aceitos">
                    <span className="text-4xl font-black lowercase tracking-[-.06em] text-white sm:text-5xl">total<span className="text-[#FFD200]">pass</span></span>
                    <span className="text-4xl font-extrabold tracking-[-.05em] text-white sm:text-5xl">well<span className="text-[#FFD200]">hub</span></span>
                  </div>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-300">Artes marciais, esporte, cultura e formação pessoal em um só lugar. Bem-vindo ao ambiente de gestão da academia.</p>
                </div>
                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#FFD200]/25 bg-black/45 p-8 text-center">
                  <div><p className="text-xs font-semibold uppercase tracking-[.35em] text-[#FFD200]">Bem-vindo à</p><p className="mt-4 text-3xl font-black uppercase leading-tight sm:text-4xl">Escola de Lutas</p><p className="mt-1 text-2xl font-bold tracking-[.12em] text-[#FFD200] sm:text-3xl">Rafael Mota</p><div className="mx-auto mt-5 h-1 w-16 rounded-full bg-white/80"/></div>
                </div>
              </div>
            </section>
            <section>
              <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold tracking-[.22em] text-[#FFD200]">ACESSO RÁPIDO</p><h2 className="mt-1 text-2xl font-bold">Gestão da academia</h2></div><span className="text-xs text-neutral-500">Atalhos principais</span></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{quickLinks.map(item => <a key={item.title} href={item.href} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:border-[#FFD200]/60 hover:bg-[#171717]"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#FFD200] text-2xl font-bold text-black">{item.icon}</span><span><strong className="block text-base">{item.title}</strong><span className="mt-1 block text-xs text-neutral-400">{item.detail}</span></span><span className="ml-auto text-xl text-[#FFD200] transition group-hover:translate-x-1">→</span></a>)}</div>
            </section>
            <section>
              <div className="mb-4"><p className="text-xs font-bold tracking-[.22em] text-[#FFD200]">TREINE COM A GENTE</p><h2 className="mt-1 text-2xl font-bold">Modalidades e mensalidades</h2></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{modalities.map((item,index) => <article key={item.name} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#191919] to-[#0c0c0c] p-5 transition hover:border-[#FFD200]/50"><span className="text-3xl">{item.icon}</span><p className="mt-5 text-xs font-semibold text-[#FFD200]">0{index+1}</p><h3 className="mt-1 text-xl font-bold">{item.name}</h3><p className="mt-2 min-h-10 text-sm text-neutral-400">{item.detail}</p><p className="mt-4 text-lg font-black text-[#FFD200]">{item.price}<span className="ml-1 text-xs font-normal text-neutral-500">/ mês</span></p></article>)}</div>
            </section>
            <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
              <article className="rounded-2xl border border-white/10 bg-[#111] p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFD200] text-xl text-black">▦</span><div><p className="text-xs font-bold tracking-widest text-[#FFD200]">AGENDA</p><h2 className="text-xl font-bold">Próximos eventos</h2></div></div><p className="mt-5 text-sm leading-relaxed text-neutral-400">A programação de aulas especiais, aulões e eventos poderá ser acompanhada nesta área. Os eventos serão exibidos aqui quando cadastrados na agenda.</p><a href="#" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#FFD200]">Acessar agenda <span>→</span></a></article>
              <article className="rounded-2xl border border-white/10 bg-[#111] p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFD200] text-xl text-black">◉</span><div><p className="text-xs font-bold tracking-widest text-[#FFD200]">COMUNICADOS</p><h2 className="text-xl font-bold">Mural da academia</h2></div></div><p className="mt-5 text-sm leading-relaxed text-neutral-400">Avisos, campanhas e informações importantes da Escola de Lutas Rafael Mota terão destaque neste espaço.</p><a href="#" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#FFD200]">Ver comunicados <span>→</span></a></article>
            </section>
            <section className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#FFD200]/25 bg-[#111] p-6 sm:flex-row sm:items-center"><div><p className="text-xs font-bold tracking-[.22em] text-[#FFD200]">CONVÊNIOS ACEITOS</p><h2 className="mt-1 text-xl font-bold">TotalPass e Wellhub</h2><p className="mt-1 text-sm text-neutral-400">Consulte as condições de acesso e disponibilidade diretamente com a academia.</p></div><div className="flex gap-3"><span className="rounded-lg border border-white/15 px-4 py-3 font-bold">TotalPass</span><span className="rounded-lg border border-white/15 px-4 py-3 font-bold">Wellhub</span></div></section>
            <footer className="border-t border-white/10 pt-5 text-xs text-neutral-500">© {new Date().getFullYear()} Escola de Lutas Rafael Mota · Disciplina, técnica e evolução.</footer>
          </div>
        </section>
      </div>
    </main>
  );
}
