"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Student = {
  id: number; name: string; birthDate: string; cpf: string; email: string; phone: string;
  address: string; guardian: string; guardianPhone: string; emergencyContact: string;
  modality: string; className: string; teacher: string; enrollmentDate: string;
  plan: string; monthlyFee: string; dueDay: string; status: "Ativo" | "Pendente" | "Inativo";
};

const initialStudents: Student[] = [
  { id: 1, name: "João Silva", birthDate: "2014-03-12", cpf: "", email: "", phone: "(21) 99911-2233", address: "São João de Meriti", guardian: "Mariana Silva", guardianPhone: "(21) 99911-2233", emergencyContact: "Mariana Silva", modality: "Capoeira", className: "Infantil · 18h", teacher: "Professor Rafael", enrollmentDate: "2026-02-10", plan: "Mensal", monthlyFee: "120.00", dueDay: "10", status: "Ativo" },
  { id: 2, name: "Maria Oliveira", birthDate: "1998-07-22", cpf: "", email: "", phone: "(21) 98822-3344", address: "Coelho da Rocha", guardian: "A própria aluna", guardianPhone: "", emergencyContact: "Contato cadastrado na secretaria", modality: "Luta Livre", className: "Adulto · 20h", teacher: "Professor Rafael", enrollmentDate: "2025-11-04", plan: "Mensal", monthlyFee: "150.00", dueDay: "5", status: "Ativo" },
  { id: 3, name: "Carlos Santos", birthDate: "2005-09-18", cpf: "", email: "", phone: "(21) 97733-4455", address: "Vilar dos Teles", guardian: "O próprio aluno", guardianPhone: "", emergencyContact: "", modality: "Jiu-Jitsu", className: "Adulto · 19h", teacher: "Professor Marcos", enrollmentDate: "2026-04-02", plan: "Mensal", monthlyFee: "160.00", dueDay: "10", status: "Pendente" },
  { id: 4, name: "Ana Clara Costa", birthDate: "2015-01-09", cpf: "", email: "", phone: "(21) 96644-5566", address: "São João de Meriti", guardian: "Roberto Costa", guardianPhone: "(21) 96644-5566", emergencyContact: "Roberto Costa", modality: "Capoeira", className: "Infantil · 17h", teacher: "Professor Rafael", enrollmentDate: "2026-03-15", plan: "Mensal", monthlyFee: "120.00", dueDay: "15", status: "Ativo" },
];

const menu = [["⌂","Início","/"],["♙","Alunos","/students"],["♟","Professores","#"],["◈","Modalidades","#"],["▦","Turmas","#"],["＄","Financeiro","#"],["◉","Comunicados","#"],["▣","Agenda","#"],["▤","Relatórios","#"]];
const emptyForm = {
  name:"", birthDate:"", cpf:"", email:"", phone:"", address:"", guardian:"", guardianPhone:"",
  emergencyContact:"", modality:"Capoeira", className:"", teacher:"", enrollmentDate:"",
  plan:"Mensal", monthlyFee:"", dueDay:"10", status:"Ativo" as Student["status"]
};

function Field({label,children,required=false}:{label:string;children:React.ReactNode;required?:boolean}) {
  return <label className="block"><span className="mb-2 block text-xs font-medium text-neutral-400">{label}{required ? " *" : ""}</span>{children}</label>;
}
const inputClass="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-purple-500";
const selectClass=inputClass;

export default function StudentsPage() {
  const [students,setStudents]=useState(initialStudents);
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("Todos");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [selected,setSelected]=useState<Student|null>(null);

  const visible=useMemo(()=>students.filter(s=>{
    const text=[s.name,s.modality,s.guardian,s.className].join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (filter==="Todos" || s.status===filter);
  }),[students,query,filter]);

  function update<K extends keyof typeof emptyForm>(key:K,value:typeof emptyForm[K]) {
    setForm(current=>({...current,[key]:value}));
  }
  function saveStudent(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!form.name.trim() || !form.birthDate || !form.phone.trim() || !form.modality || !form.className.trim() || !form.enrollmentDate) return;
    const student:Student={...form,id:Date.now(),name:form.name.trim(),cpf:form.cpf.trim(),email:form.email.trim(),phone:form.phone.trim(),address:form.address.trim(),guardian:form.guardian.trim()||"Não informado",guardianPhone:form.guardianPhone.trim(),emergencyContact:form.emergencyContact.trim(),className:form.className.trim(),teacher:form.teacher.trim()||"A definir",monthlyFee:form.monthlyFee,dueDay:form.dueDay};
    setStudents(current=>[student,...current]);
    setForm(emptyForm);
    setShowForm(false);
  }
  const count=(status:string)=>students.filter(s=>status==="Todos"||s.status===status).length;

  return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen">
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#101014] lg:flex">
      <div className="border-b border-white/10 px-6 py-7"><div className="flex items-center gap-3"><div className="text-4xl font-black italic text-[#d6ad55]">RM</div><div><p className="text-xs font-bold tracking-[.18em]">ESCOLA DE LUTAS</p><p className="mt-1 text-[10px] tracking-[.28em] text-[#d6ad55]">RAFAEL MOTA</p></div></div></div>
      <div className="px-4 pt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-neutral-500">Menu principal</div>
      <nav className="mt-3 flex-1 space-y-1 px-3">{menu.map(([icon,label,href])=><Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${label==="Alunos"?"bg-gradient-to-r from-purple-800/80 to-purple-600/40 text-white":"text-neutral-400 hover:bg-white/5 hover:text-white"}`}><span className="w-5 text-center text-lg">{icon}</span>{label}</Link>)}</nav>
      <div className="m-4 rounded-xl border border-white/10 bg-white/[.03] p-4"><p className="text-xs font-semibold">Disciplina · Técnica · Evolução</p><p className="mt-2 text-[10px] text-neutral-500">Sistema de gestão da academia</p></div>
    </aside>
    <section className="min-w-0 flex-1">
      <header className="flex h-[76px] items-center justify-between border-b border-white/10 bg-[#0d0d11] px-5 md:px-8"><div><p className="text-sm text-neutral-400">Administração / Cadastros</p><h1 className="text-lg font-semibold">Gestão de alunos</h1></div><div className="flex items-center gap-3"><span className="hidden text-xs text-neutral-500 sm:block">Administrador</span><div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6ad55]/60 bg-neutral-800 text-sm font-semibold text-[#d6ad55]">RM</div></div></header>
      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c49aee]">Base de alunos</p><h2 className="mt-2 text-2xl font-semibold">Cadastro e matrículas</h2><p className="mt-1 text-sm text-neutral-500">Dados pessoais, responsáveis, vínculo com turmas e plano contratado.</p></div><button onClick={()=>{setForm(emptyForm);setShowForm(true);}} className="rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-950/30 hover:bg-purple-600">＋ Novo aluno</button></div>
        <div className="grid gap-3 sm:grid-cols-3">{[["Todos os alunos",count("Todos"),"text-white"],["Ativos",count("Ativo"),"text-emerald-400"],["Pendentes / inativos",count("Pendente")+count("Inativo"),"text-amber-300"]].map(([label,value,tone])=><article key={label} className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><p className="text-sm text-neutral-400">{label}</p><p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p></article>)}</div>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]">
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between md:p-5"><div><h3 className="font-semibold">Relação de alunos</h3><p className="mt-1 text-xs text-neutral-500">{visible.length} registro(s) encontrados</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar aluno, modalidade ou responsável..." className={`${inputClass} sm:w-72`}/><select value={filter} onChange={e=>setFilter(e.target.value)} className={`${selectClass} sm:w-36`}><option>Todos</option><option>Ativo</option><option>Pendente</option><option>Inativo</option></select></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-white/[.03] text-xs uppercase tracking-wide text-neutral-500"><tr>{["Aluno","Modalidade / Turma","Responsável","Contato","Plano","Situação",""].map((x,i)=><th key={i} className="px-5 py-4 font-medium">{x}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{visible.map(s=><tr key={s.id} className="transition hover:bg-white/[.025]"><td className="px-5 py-4"><p className="font-medium">{s.name}</p><p className="mt-1 text-xs text-neutral-500">Matrícula desde {s.enrollmentDate.split("-").reverse().join("/")}</p></td><td className="px-5 py-4"><p>{s.modality}</p><p className="mt-1 text-xs text-neutral-500">{s.className}</p></td><td className="px-5 py-4 text-neutral-400">{s.guardian}</td><td className="px-5 py-4 text-neutral-400">{s.phone}</td><td className="px-5 py-4"><p>{s.plan}</p><p className="mt-1 text-xs text-neutral-500">{s.monthlyFee ? "R$ "+Number(s.monthlyFee).toFixed(2).replace(".",",") : "Valor a definir"}</p></td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${s.status==="Ativo"?"bg-emerald-500/10 text-emerald-400":s.status==="Pendente"?"bg-amber-500/10 text-amber-300":"bg-neutral-500/15 text-neutral-400"}`}>{s.status}</span></td><td className="px-5 py-4"><button onClick={()=>setSelected(s)} className="whitespace-nowrap text-xs text-purple-300 hover:text-purple-200">Ver cadastro →</button></td></tr>)}</tbody></table>{visible.length===0&&<div className="p-12 text-center text-sm text-neutral-500">Nenhum aluno encontrado.</div>}</div>
          <div className="border-t border-white/10 px-5 py-3 text-xs text-amber-300/80">Protótipo com dados fictícios: cadastros não são persistidos e não representam alunos reais.</div>
        </section>
      </div>
    </section>
  </div>

  {showForm&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 md:p-6" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false);}}>
    <form onSubmit={saveStudent} className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#17171d] p-5 shadow-2xl md:p-7">
      <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-6 flex items-start justify-between border-b border-white/10 bg-[#17171d] px-5 py-5 md:-mx-7 md:-mt-7 md:px-7"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-purple-300">Ficha de matrícula</p><h2 className="mt-2 text-xl font-semibold">Cadastro completo do aluno</h2><p className="mt-1 text-sm text-neutral-500">Organize os dados iniciais e o vínculo com a academia.</p></div><button type="button" onClick={()=>setShowForm(false)} className="rounded-lg px-3 py-1 text-2xl text-neutral-400 hover:bg-white/5">×</button></div>

      <div className="space-y-7">
        <section><div className="mb-4 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-sm text-purple-200">01</span><div><h3 className="font-semibold">Dados pessoais</h3><p className="text-xs text-neutral-500">Identificação e formas de contato do aluno</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2"><Field label="Nome completo" required><input required value={form.name} onChange={e=>update("name",e.target.value)} className={inputClass} placeholder="Nome completo"/></Field></div>
          <Field label="Data de nascimento" required><input required type="date" value={form.birthDate} onChange={e=>update("birthDate",e.target.value)} className={inputClass}/></Field>
          <Field label="CPF (opcional)"><input value={form.cpf} onChange={e=>update("cpf",e.target.value)} className={inputClass} placeholder="000.000.000-00"/></Field>
          <Field label="Telefone / WhatsApp" required><input required value={form.phone} onChange={e=>update("phone",e.target.value)} className={inputClass} placeholder="(21) 99999-9999"/></Field>
          <Field label="E-mail"><input type="email" value={form.email} onChange={e=>update("email",e.target.value)} className={inputClass} placeholder="aluno@email.com"/></Field>
          <div className="sm:col-span-2"><Field label="Endereço"><input value={form.address} onChange={e=>update("address",e.target.value)} className={inputClass} placeholder="Rua, número, bairro e cidade"/></Field></div>
        </div></section>

        <section className="border-t border-white/10 pt-6"><div className="mb-4 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-sm text-purple-200">02</span><div><h3 className="font-semibold">Responsável e emergência</h3><p className="text-xs text-neutral-500">Preencher para menores ou quando houver responsável vinculado</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nome do responsável"><input value={form.guardian} onChange={e=>update("guardian",e.target.value)} className={inputClass} placeholder="Nome completo"/></Field>
          <Field label="Telefone do responsável"><input value={form.guardianPhone} onChange={e=>update("guardianPhone",e.target.value)} className={inputClass} placeholder="(21) 99999-9999"/></Field>
          <Field label="Contato para emergência"><input value={form.emergencyContact} onChange={e=>update("emergencyContact",e.target.value)} className={inputClass} placeholder="Nome e telefone"/></Field>
        </div></section>

        <section className="border-t border-white/10 pt-6"><div className="mb-4 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-sm text-purple-200">03</span><div><h3 className="font-semibold">Vínculo esportivo</h3><p className="text-xs text-neutral-500">Modalidade, turma, professor e início das atividades</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Modalidade" required><select value={form.modality} onChange={e=>update("modality",e.target.value)} className={selectClass}><option>Capoeira</option><option>Luta Livre</option><option>Jiu-Jitsu</option><option>Kickboxing</option><option>Boxe</option><option>Outra</option></select></Field>
          <Field label="Turma / horário" required><input required value={form.className} onChange={e=>update("className",e.target.value)} className={inputClass} placeholder="Ex.: Infantil · 18h"/></Field>
          <Field label="Professor responsável"><input value={form.teacher} onChange={e=>update("teacher",e.target.value)} className={inputClass} placeholder="Nome do professor"/></Field>
          <Field label="Data da matrícula" required><input required type="date" value={form.enrollmentDate} onChange={e=>update("enrollmentDate",e.target.value)} className={inputClass}/></Field>
          <Field label="Situação da matrícula"><select value={form.status} onChange={e=>update("status",e.target.value as Student["status"])} className={selectClass}><option>Ativo</option><option>Pendente</option><option>Inativo</option></select></Field>
        </div></section>

        <section className="border-t border-white/10 pt-6"><div className="mb-4 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-sm text-purple-200">04</span><div><h3 className="font-semibold">Plano e cobrança</h3><p className="text-xs text-neutral-500">Parâmetros iniciais para integração com o módulo financeiro</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Plano"><select value={form.plan} onChange={e=>update("plan",e.target.value)} className={selectClass}><option>Mensal</option><option>Trimestral</option><option>Semestral</option><option>Anual</option><option>Experimental</option><option>Bolsa / Isento</option></select></Field>
          <Field label="Valor contratado (R$)"><input type="number" min="0" step="0.01" value={form.monthlyFee} onChange={e=>update("monthlyFee",e.target.value)} className={inputClass} placeholder="0,00"/></Field>
          <Field label="Dia de vencimento"><select value={form.dueDay} onChange={e=>update("dueDay",e.target.value)} className={selectClass}>{Array.from({length:28},(_,i)=><option key={i+1} value={String(i+1)}>{i+1}</option>)}</select></Field>
        </div><p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200/80">O preenchimento do plano não registra pagamento nem cria cobrança real. A geração de mensalidades será implementada no módulo financeiro, com histórico e controle de permissões.</p></section>
      </div>

      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5"><button type="button" onClick={()=>setShowForm(false)} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5">Cancelar</button><button type="submit" className="rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold hover:bg-purple-600">Salvar cadastro demonstrativo</button></div>
      <p className="mt-4 text-xs text-neutral-500">Os campos são armazenados somente no estado desta página nesta versão de protótipo. Ainda não há persistência no banco.</p>
    </form>
  </div>}

  {selected&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#17171d] p-6"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Ficha do aluno</p><h2 className="mt-2 text-xl font-semibold">{selected.name}</h2><p className="mt-1 text-sm text-neutral-500">{selected.modality} · {selected.className}</p></div><button onClick={()=>setSelected(null)} className="text-2xl text-neutral-400">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{[["Nascimento",selected.birthDate],["CPF",selected.cpf||"Não informado"],["Telefone",selected.phone],["E-mail",selected.email||"Não informado"],["Endereço",selected.address||"Não informado"],["Responsável",selected.guardian],["Telefone do responsável",selected.guardianPhone||"Não informado"],["Emergência",selected.emergencyContact||"Não informado"],["Professor",selected.teacher],["Data da matrícula",selected.enrollmentDate],["Plano",selected.plan],["Valor contratado",selected.monthlyFee? "R$ "+Number(selected.monthlyFee).toFixed(2).replace(".",","):"Não informado"],["Vencimento", "Dia "+selected.dueDay],["Situação",selected.status]].map(([label,value])=><div key={label} className="rounded-lg border border-white/5 bg-white/[.025] p-3"><p className="text-xs text-neutral-500">{label}</p><p className="mt-1 text-sm text-neutral-200">{value}</p></div>)}</div></section></div>}
 </main>;
}
