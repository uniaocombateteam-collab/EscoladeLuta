import Sidebar from "@/components/Sidebar";

const modalities = [
  { name: "Jiu-Jitsu", detail: "Técnica, estratégia e evolução no tatame", icon: "🥋" },
  { name: "Boxe", detail: "Condicionamento, precisão e resistência", icon: "🥊" },
  { name: "Kickboxing", detail: "Potência, coordenação e preparo físico", icon: "⚡" },
  { name: "Capoeira", detail: "Movimento, cultura, ritmo e tradição", icon: "◎" },
];

const updates = [
  { label: "Agenda", title: "Acompanhe a programação da academia", description: "Aulões, atividades especiais, encontros e eventos serão divulgados por aqui.", icon: "▦" },
  { label: "Treinos", title: "Um pouco da nossa rotina", description: "Este espaço será atualizado com fotos e registros reais das aulas e dos nossos alunos.", icon: "▧" },
  { label: "Novidades", title: "Fique por dentro", description: "Avisos, novas turmas, campanhas e informações importantes da Escola de Lutas.", icon: "✦" },
];

const gallery = [
  { title: "Treinos e preparação", subtitle: "Registros das aulas" },
  { title: "Nossa equipe", subtitle: "Professores e alunos" },
  { title: "Eventos e atividades", subtitle: "Momentos da academia" },
];

export default function PublicHome() {
  return (
    <main className="min-h-screen bg-[#08080b] text-white">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#09090d]/95 px-5 py-4 backdrop-blur">
            <div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Escola de Lutas Rafael Mota</p><h1 className="text-xl font-semibold">Início</h1></div>
            <span className="hidden text-xs text-neutral-500 sm:block">Mural e informações da academia</span>
          </header>
          <div className="overflow-hidden">
      <section id="inicio" className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(126,34,206,.25),transparent_42%),linear-gradient(115deg,#09090b_15%,#17121e_62%,#09090b)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-[1.05fr_.95fr] md:py-28">
          <div>
            <p className="text-xs font-semibold tracking-[.28em] text-purple-300">ESCOLA DE LUTAS RAFAEL MOTA</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[1.02] sm:text-6xl">Disciplina,<br/> técnica e <span className="text-amber-300">evolução.</span></h1>
            <div className="mt-6 h-1 w-20 rounded-full bg-purple-500" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">Artes marciais, esporte, cultura e formação pessoal em um só lugar. Encontre sua modalidade e faça parte da nossa equipe.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#modalidades" className="rounded-xl bg-purple-700 px-6 py-3 font-semibold hover:bg-purple-600">Conheça as modalidades</a><a href="#agenda" className="rounded-xl border border-white/20 px-6 py-3 font-semibold hover:bg-white/5">Ver novidades</a></div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-purple-300/20 bg-[radial-gradient(ellipse_at_70%_35%,rgba(168,85,247,.35),transparent_48%),linear-gradient(145deg,#24202b,#0d0d11_60%)] p-8 shadow-2xl shadow-purple-950/30 md:min-h-[390px]">
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-purple-300/20" /><div className="absolute -right-5 -top-5 h-52 w-52 rounded-full border border-purple-300/20" />
            <div className="relative flex h-full min-h-[240px] flex-col justify-end">
              <p className="text-xs tracking-[.3em] text-amber-300">MAIS QUE TREINAMENTO</p><p className="mt-3 max-w-sm text-4xl font-black uppercase leading-tight">Força para<br/> superar limites.</p><p className="mt-4 max-w-sm text-sm text-neutral-300">Técnica, respeito, constância e comunidade.</p>
              <span className="mt-8 text-6xl font-black italic text-white/10">RAFAEL MOTA</span>
            </div>
          </div>
        </div>
      </section>

      <section id="modalidades" className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold tracking-[.25em] text-purple-300">TREINE COM A GENTE</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Nossas modalidades</h2></div><p className="max-w-md text-sm text-neutral-400">Escolha sua modalidade e desenvolva técnica, condicionamento e confiança.</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modalities.map((item, index) => <article key={item.name} className="group rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b1721] to-[#101014] p-6 transition hover:-translate-y-1 hover:border-purple-400/50"><span className="text-4xl">{item.icon}</span><p className="mt-8 text-xs text-purple-300">0{index+1}</p><h3 className="mt-1 text-xl font-bold">{item.name}</h3><p className="mt-2 min-h-10 text-sm text-neutral-400">{item.detail}</p><p className="mt-5 text-sm font-semibold text-amber-300">R$ {item.name === "Capoeira" ? "40,00" : "80,00"} <span className="font-normal text-neutral-500">/ mês</span></p></article>)}
        </div>
      </section>

      <section id="planos" className="border-y border-white/10 bg-[#101014]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_.8fr]">
          <div><p className="text-xs font-semibold tracking-[.25em] text-purple-300">INVISTA EM VOCÊ</p><h2 className="mt-2 text-3xl font-bold">Planos e mensalidades</h2><div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-purple-400/50 bg-[#17121e] p-6"><p className="text-sm text-neutral-300">Jiu-Jitsu, Boxe e Kickboxing</p><p className="mt-3 text-4xl font-black text-amber-300">R$ 80,00</p><p className="mt-1 text-sm text-neutral-400">mensais por modalidade</p></div><div className="rounded-2xl border border-amber-300/50 bg-[#171714] p-6"><p className="text-sm text-neutral-300">Capoeira</p><p className="mt-3 text-4xl font-black text-amber-300">R$ 40,00</p><p className="mt-1 text-sm text-neutral-400">mensais</p></div></div></div>
          <div className="flex flex-col justify-center"><h3 className="text-xl font-bold">Convênios aceitos</h3><p className="mt-2 text-sm text-neutral-400">Você também pode treinar utilizando os benefícios parceiros.</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/15 bg-black/30 p-5 text-center text-lg font-black text-emerald-400">TotalPass</div><div className="rounded-xl border border-white/15 bg-black/30 p-5 text-center text-lg font-black text-white">Wellhub</div></div><p className="mt-4 text-xs text-neutral-500">Consulte as condições de acesso e disponibilidade diretamente com a academia.</p></div>
        </div>
      </section>

      <section id="agenda" className="mx-auto max-w-7xl px-5 py-16">
        <p className="text-xs font-semibold tracking-[.25em] text-purple-300">ACONTECE NA ACADEMIA</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Agenda, fotos e novidades</h2><p className="mt-3 max-w-2xl text-sm text-neutral-400">Um espaço para divulgar a rotina da escola, próximos eventos, campanhas, avisos e registros dos treinos.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{updates.map(item=><article key={item.label} className="rounded-2xl border border-white/10 bg-[#141419] p-6"><span className="text-3xl text-purple-300">{item.icon}</span><p className="mt-5 text-xs uppercase tracking-widest text-amber-300">{item.label}</p><h3 className="mt-2 text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.description}</p></article>)}</div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{gallery.map((item,index)=><div key={item.title} className="flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_70%_20%,rgba(126,34,206,.28),transparent_45%),linear-gradient(145deg,#29232f,#111116)] p-6"><span className="text-xs text-purple-200">GALERIA 0{index+1}</span><h3 className="mt-2 text-xl font-bold">{item.title}</h3><p className="mt-1 text-sm text-neutral-400">{item.subtitle}</p><p className="mt-4 text-xs text-neutral-500">Espaço reservado para fotos da academia</p></div>)}</div>
      </section>

      <section id="academia" className="border-y border-white/10 bg-gradient-to-r from-[#17121e] to-[#0c0c10]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 md:items-center"><div><p className="text-xs font-semibold tracking-[.25em] text-purple-300">NOSSA ESCOLA</p><h2 className="mt-2 text-3xl font-bold">Treinar. Aprender. Evoluir.</h2></div><p className="text-base leading-relaxed text-neutral-300">A Escola de Lutas Rafael Mota reúne modalidades de luta e práticas corporais em um ambiente de disciplina, respeito e desenvolvimento. Aqui, cada aluno constrói sua própria trajetória, com orientação e dedicação.</p></div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between"><div><b className="text-white">Escola de Lutas Rafael Mota</b><p className="mt-1 text-xs">Disciplina, técnica e evolução.</p></div><div className="flex flex-wrap gap-5"><a href="#modalidades" className="hover:text-white">Modalidades</a><a href="#agenda" className="hover:text-white">Agenda</a><a href="#agenda" className="hover:text-white">Novidades</a></div><p className="text-xs">© {new Date().getFullYear()} Escola de Lutas Rafael Mota</p></footer>
          </div>
        </section>
      </div>
    </main>
  );
}
