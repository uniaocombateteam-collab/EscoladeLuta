"use client";

import { useState } from "react";

const navigation = [
  ["⌂", "Início"], ["♙", "Alunos"], ["♟", "Professores"],
  ["◈", "Modalidades"], ["▦", "Turmas"], ["＄", "Financeiro"],
  ["◉", "Comunicados"], ["▣", "Agenda"], ["▤", "Relatórios"],
];
const stats = [
  { label: "Alunos ativos", value: "248", note: "+4,2% neste mês", tone: "purple", icon: "♙" },
  { label: "Professores", value: "12", note: "Equipe cadastrada", tone: "gold", icon: "♟" },
  { label: "Mensalidades pendentes", value: "18", note: "7,3% dos alunos", tone: "red", icon: "◈" },
  { label: "Recebimentos do mês", value: "R$ 12.480", note: "+8,1% neste mês", tone: "green", icon: "↗" },
];
const activities = [
  ["Nova matrícula", "João Silva · Capoeira", "Há 2 horas", "＋"],
  ["Pagamento registrado", "Maria Oliveira · Mensalidade", "Há 4 horas", "＄"],
  ["Evento criado", "Aulão de Capoeira · 23/11", "Há 6 horas", "▣"],
  ["Aluno atualizado", "Carlos Santos · Troca de turma", "Há 8 horas", "✎"],
];
const events = [
  ["21 NOV", "Treino geral · Adultos", "19:00 – 21:00"],
  ["23 NOV", "Aulão de Capoeira", "19:30 – 21:00"],
  ["24 NOV", "Seminário · Luta Livre", "09:00 – 12:00"],
];

export default function HomePage() {
  const [active, setActive] = useState("Início");
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#101014] transition-transform lg:static lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="border-b border-white/10 px-6 py-7">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-black italic text-[#d6ad55]">RM</div>
              <div><p className="text-xs font-bold tracking-[.18em]">ESCOLA DE LUTAS</p><p className="mt-1 text-[10px] tracking-[.28em] text-[#d6ad55]">RAFAEL MOTA</p></div>
            </div>
          </div>
          <div className="px-4 pt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-neutral-500">Menu principal</div>
          <nav className="mt-3 flex-1 space-y-1 px-3">
            {navigation.map(([icon, label]) => <button key={label} onClick={() => {setActive(label);setMenuOpen(false);}} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active === label ? "bg-gradient-to-r from-purple-800/80 to-purple-600/40 text-white shadow-lg shadow-purple-950/30" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}><span className="w-5 text-center text-lg">{icon}</span>{label}</button>)}
          </nav>
          <div className="m-4 rounded-xl border border-white/10 bg-white/[.03] p-4"><p className="text-xs font-semibold">Disciplina · Técnica · Evolução</p><p className="mt-2 text-[10px] text-neutral-500">Sistema de gestão da academia</p></div>
        </aside>
        {menuOpen && <button aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-20 bg-black/70 lg:hidden" />}
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-white/10 bg-[#0d0d11]/95 px-5 backdrop-blur md:px-8">
            <div className="flex items-center gap-4"><button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-white/10 px-3 py-2 text-neutral-300 lg:hidden">☰</button><div><p className="text-sm text-neutral-400">Painel administrativo</p><h1 className="text-lg font-semibold">Olá, Administrador</h1></div></div>
            <div className="flex items-center gap-4"><button aria-label="Notificações" className="relative text-xl text-neutral-300">♧<span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-purple-500"/></button><div className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#d6ad55]/60 bg-neutral-800 text-sm font-semibold text-[#d6ad55] sm:flex">RM</div><div className="hidden sm:block"><p className="text-sm font-medium">Administrador</p><p className="text-xs text-neutral-500">Escola Rafael Mota</p></div></div>
          </header>
          <div className="mx-auto max-w-[1600px] space-y-6 p-5 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c49aee]">Visão geral</p><h2 className="mt-2 text-2xl font-semibold">Resumo da academia</h2><p className="mt-1 text-sm text-neutral-500">Acompanhe os principais indicadores da escola.</p></div><span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-xs text-neutral-400">Novembro · 2026</span></div>
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {stats.map((s) => <article key={s.label} className="rounded-2xl border border-white/10 bg-[#15151b] p-5 shadow-xl shadow-black/10"><div className="flex items-center justify-between"><p className="text-sm text-neutral-400">{s.label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${s.tone === "purple" ? "bg-purple-500/15 text-purple-300" : s.tone === "gold" ? "bg-amber-400/10 text-amber-300" : s.tone === "red" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>{s.icon}</span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{s.value}</p><p className="mt-2 text-xs text-neutral-500">{s.note}</p></article>)}
            </div>
            <div className="grid gap-5 2xl:grid-cols-[1.35fr_1fr_0.9fr]">
              <article className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Evolução de alunos</h3><p className="mt-1 text-xs text-neutral-500">Crescimento nos últimos seis meses</p></div><span className="text-xs text-neutral-500">Jun – Nov</span></div><div className="mt-6 flex h-44 items-end gap-3 border-b border-l border-white/10 px-3 pb-2">{[48,57,62,72,84,94].map((v,i)=><div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-md bg-gradient-to-t from-purple-900 to-purple-400" style={{height:`${v}%`}}/><span className="text-[10px] text-neutral-500">{["Jun","Jul","Ago","Set","Out","Nov"][i]}</span></div>)}</div><p className="mt-4 text-xs text-neutral-500">Visualização demonstrativa — dados reais serão conectados ao banco.</p></article>
              <article className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><h3 className="font-semibold">Alunos por modalidade</h3><p className="mt-1 text-xs text-neutral-500">Distribuição ilustrativa</p><div className="mt-5 space-y-4">{[["Capoeira","34%","bg-purple-500"],["Luta Livre","28%","bg-violet-400"],["Jiu-Jitsu","16%","bg-fuchsia-300"],["Kickboxing","12%","bg-amber-300"],["Boxe","10%","bg-neutral-500"]].map(([name,pct,color])=><div key={name}><div className="mb-2 flex justify-between text-xs"><span className="text-neutral-300">{name}</span><span className="text-neutral-500">{pct}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${color}`} style={{width:pct}}/></div></div>)}</div></article>
              <article className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">Próximas atividades</h3><button onClick={()=>setActive("Agenda")} className="text-xs text-purple-300">Ver agenda →</button></div><div className="mt-4 space-y-4">{events.map(([date,title,time])=><div key={title} className="flex gap-3 border-b border-white/5 pb-4 last:border-0"><div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-purple-500/15 text-[10px] font-bold text-purple-200">{date}</div><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-neutral-500">{time}</p></div></div>)}</div></article>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
              <article className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">Atividades recentes</h3><button onClick={()=>setActive("Alunos")} className="text-xs text-purple-300">Ver registros →</button></div><div className="mt-3">{activities.map(([title,desc,time,icon])=><div key={title} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-neutral-300">{icon}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{title}</p><p className="truncate text-xs text-neutral-500">{desc}</p></div><span className="whitespace-nowrap text-[10px] text-neutral-600">{time}</span></div>)}</div></article>
              <article className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><h3 className="font-semibold">Situação das mensalidades</h3><p className="mt-1 text-xs text-neutral-500">Exemplo de acompanhamento mensal</p><div className="mt-6"><div className="flex justify-between text-sm"><span>Pagas</span><span className="text-emerald-400">230 · 92,7%</span></div><div className="mt-2 h-3 rounded-full bg-white/5"><div className="h-full w-[92.7%] rounded-full bg-emerald-500"/></div></div><div className="mt-5"><div className="flex justify-between text-sm"><span>Pendentes</span><span className="text-red-400">18 · 7,3%</span></div><div className="mt-2 h-3 rounded-full bg-white/5"><div className="h-full w-[7.3%] rounded-full bg-red-500"/></div></div><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={()=>setActive("Alunos")} className="rounded-lg bg-purple-700 px-3 py-3 text-xs font-semibold hover:bg-purple-600">Nova matrícula +</button><button onClick={()=>setActive("Financeiro")} className="rounded-lg border border-white/10 px-3 py-3 text-xs font-semibold hover:bg-white/5">Registrar pagamento</button></div></article>
            </div>
            <footer className="border-t border-white/10 pt-5 text-center text-[10px] tracking-[.16em] text-neutral-600">ESCOLA DE LUTAS RAFAEL MOTA · DISCIPLINA · TÉCNICA · EVOLUÇÃO</footer>
          </div>
        </section>
      </div>
    </main>
  );
}
