"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Student = {
  id: number;
  name: string;
  modality: string;
  className: string;
  guardian: string;
  phone: string;
  status: "Ativo" | "Inativo" | "Pendente";
};

const initialStudents: Student[] = [
  { id: 1, name: "João Silva", modality: "Capoeira", className: "Infantil · 18h", guardian: "Mariana Silva", phone: "(21) 99911-2233", status: "Ativo" },
  { id: 2, name: "Maria Oliveira", modality: "Luta Livre", className: "Adulto · 20h", guardian: "A própria aluna", phone: "(21) 98822-3344", status: "Ativo" },
  { id: 3, name: "Carlos Santos", modality: "Jiu-Jitsu", className: "Adulto · 19h", guardian: "O próprio aluno", phone: "(21) 97733-4455", status: "Pendente" },
  { id: 4, name: "Ana Clara Costa", modality: "Capoeira", className: "Infantil · 17h", guardian: "Roberto Costa", phone: "(21) 96644-5566", status: "Ativo" },
  { id: 5, name: "Pedro Henrique", modality: "Kickboxing", className: "Juvenil · 18h", guardian: "Luciana Henrique", phone: "(21) 95555-6677", status: "Inativo" },
  { id: 6, name: "Beatriz Souza", modality: "Boxe", className: "Adulto · 19h", guardian: "A própria aluna", phone: "(21) 94466-7788", status: "Ativo" },
];

const nav = [["⌂", "Início", "/"], ["♙", "Alunos", "/students"], ["♟", "Professores", "#"], ["◈", "Modalidades", "#"], ["▦", "Turmas", "#"], ["＄", "Financeiro", "#"], ["◉", "Comunicados", "#"], ["▣", "Agenda", "#"], ["▤", "Relatórios", "#"]];

export default function StudentsPage() {
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [modality, setModality] = useState("Capoeira");
  const [className, setClassName] = useState("");
  const [guardian, setGuardian] = useState("");
  const [phone, setPhone] = useState("");

  const visible = useMemo(() => students.filter((student) => {
    const matchesQuery = [student.name, student.modality, student.guardian].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "Todos" || student.status === filter);
  }), [students, query, filter]);

  function addStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !className.trim()) return;
    setStudents((current) => [{ id: Date.now(), name: name.trim(), modality, className: className.trim(), guardian: guardian.trim() || "Não informado", phone: phone.trim() || "Não informado", status: "Ativo" }, ...current]);
    setName(""); setClassName(""); setGuardian(""); setPhone(""); setModality("Capoeira"); setShowForm(false);
  }

  const count = (status: string) => students.filter((student) => status === "Todos" || student.status === status).length;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#101014] lg:flex">
          <div className="border-b border-white/10 px-6 py-7"><div className="flex items-center gap-3"><div className="text-4xl font-black italic text-[#d6ad55]">RM</div><div><p className="text-xs font-bold tracking-[.18em]">ESCOLA DE LUTAS</p><p className="mt-1 text-[10px] tracking-[.28em] text-[#d6ad55]">RAFAEL MOTA</p></div></div></div>
          <div className="px-4 pt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-neutral-500">Menu principal</div>
          <nav className="mt-3 flex-1 space-y-1 px-3">{nav.map(([icon,label,href]) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${label === "Alunos" ? "bg-gradient-to-r from-purple-800/80 to-purple-600/40 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}><span className="w-5 text-center text-lg">{icon}</span>{label}</Link>)}</nav>
          <div className="m-4 rounded-xl border border-white/10 bg-white/[.03] p-4"><p className="text-xs font-semibold">Disciplina · Técnica · Evolução</p><p className="mt-2 text-[10px] text-neutral-500">Sistema de gestão da academia</p></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-white/10 bg-[#0d0d11] px-5 md:px-8">
            <div><p className="text-sm text-neutral-400">Administração / Cadastros</p><h1 className="text-lg font-semibold">Gestão de alunos</h1></div>
            <div className="flex items-center gap-3"><span className="hidden text-xs text-neutral-500 sm:block">Administrador</span><div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6ad55]/60 bg-neutral-800 text-sm font-semibold text-[#d6ad55]">RM</div></div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c49aee]">Base de alunos</p><h2 className="mt-2 text-2xl font-semibold">Alunos cadastrados</h2><p className="mt-1 text-sm text-neutral-500">Consulte matrículas, modalidades, turmas e responsáveis.</p></div><button onClick={() => setShowForm(true)} className="rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-950/30 transition hover:bg-purple-600">＋ Novo aluno</button></div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[["Todos os alunos", count("Todos"), "text-white"], ["Ativos", count("Ativo"), "text-emerald-400"], ["Pendentes / inativos", count("Pendente") + count("Inativo"), "text-amber-300"]].map(([label,value,tone]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><p className="text-sm text-neutral-400">{label}</p><p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p></article>)}
            </div>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]">
              <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between md:p-5">
                <div><h3 className="font-semibold">Relação de alunos</h3><p className="mt-1 text-xs text-neutral-500">{visible.length} registro(s) encontrados</p></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, modalidade ou responsável..." className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-purple-500 sm:w-72" />
                  <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-2.5 text-sm text-neutral-200 outline-none focus:border-purple-500"><option>Todos</option><option>Ativo</option><option>Pendente</option><option>Inativo</option></select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-white/[.03] text-xs uppercase tracking-wide text-neutral-500"><tr><th className="px-5 py-4 font-medium">Aluno</th><th className="px-5 py-4 font-medium">Modalidade</th><th className="px-5 py-4 font-medium">Turma</th><th className="px-5 py-4 font-medium">Responsável</th><th className="px-5 py-4 font-medium">Contato</th><th className="px-5 py-4 font-medium">Situação</th></tr></thead>
                  <tbody className="divide-y divide-white/5">{visible.map((student) => <tr key={student.id} className="transition hover:bg-white/[.025]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/15 text-xs font-semibold text-purple-200">{student.name.split(" ").slice(0,2).map((part) => part[0]).join("").toUpperCase()}</div><span className="font-medium text-neutral-100">{student.name}</span></div></td><td className="px-5 py-4 text-neutral-300">{student.modality}</td><td className="px-5 py-4 text-neutral-400">{student.className}</td><td className="px-5 py-4 text-neutral-400">{student.guardian}</td><td className="px-5 py-4 text-neutral-400">{student.phone}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${student.status === "Ativo" ? "bg-emerald-500/10 text-emerald-400" : student.status === "Pendente" ? "bg-amber-500/10 text-amber-300" : "bg-neutral-500/15 text-neutral-400"}`}>{student.status}</span></td></tr>)}</tbody>
                </table>
                {visible.length === 0 && <div className="p-12 text-center text-sm text-neutral-500">Nenhum aluno encontrado com esses critérios.</div>}
              </div>
              <div className="border-t border-white/10 px-5 py-3 text-xs text-neutral-600">Dados demonstrativos nesta etapa; ainda não são gravados no banco de dados.</div>
            </section>
          </div>
        </section>
      </div>

      {showForm && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
        <form onSubmit={addStudent} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#17171d] p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-purple-300">Matrícula</p><h2 className="mt-2 text-xl font-semibold">Cadastrar novo aluno</h2><p className="mt-1 text-sm text-neutral-500">Preencha os dados iniciais do cadastro.</p></div><button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1 text-xl text-neutral-400 hover:bg-white/5">×</button></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-2 block text-xs text-neutral-400">Nome completo *</span><input required value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm outline-none focus:border-purple-500" placeholder="Nome do aluno"/></label>
            <label><span className="mb-2 block text-xs text-neutral-400">Modalidade *</span><select value={modality} onChange={(e)=>setModality(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm outline-none focus:border-purple-500"><option>Capoeira</option><option>Luta Livre</option><option>Jiu-Jitsu</option><option>Kickboxing</option><option>Boxe</option><option>Outra</option></select></label>
            <label><span className="mb-2 block text-xs text-neutral-400">Turma *</span><input required value={className} onChange={(e)=>setClassName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm outline-none focus:border-purple-500" placeholder="Ex.: Adulto · 19h"/></label>
            <label><span className="mb-2 block text-xs text-neutral-400">Responsável</span><input value={guardian} onChange={(e)=>setGuardian(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm outline-none focus:border-purple-500" placeholder="Nome do responsável"/></label>
            <label><span className="mb-2 block text-xs text-neutral-400">Telefone de contato</span><input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm outline-none focus:border-purple-500" placeholder="(21) 99999-9999"/></label>
          </div>
          <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5">Cancelar</button><button type="submit" className="rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold hover:bg-purple-600">Adicionar aluno</button></div>
          <p className="mt-4 text-xs text-amber-300/80">Protótipo: o cadastro fica apenas nesta sessão. A persistência será ligada ao Supabase depois.</p>
        </form>
      </div>}
    </main>
  );
}
