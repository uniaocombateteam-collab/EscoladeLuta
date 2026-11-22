"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type StudentRow = {
  id:string; full_name:string; birth_date:string; phone:string; email:string|null;
  enrollment_date:string; enrollment_status:"active"|"pending"|"inactive";
  plan_name:string|null; monthly_fee:number|null; class_label:string|null;
  modality: {name:string}|null;
  student_guardians: { guardians: {full_name:string;phone:string}|null }[];
};
type StudentForm = {
  full_name:string; birth_date:string; cpf:string; email:string; phone:string; address:string;
  guardian_name:string; guardian_phone:string; guardian_relationship:string; emergency_contact:string;
  modality:string; class_name:string; teacher_name:string; enrollment_date:string;
  enrollment_status:"active"|"pending"|"inactive"; plan_name:string; monthly_fee:string; due_day:string;
};
const blank:StudentForm={full_name:"",birth_date:"",cpf:"",email:"",phone:"",address:"",guardian_name:"",guardian_phone:"",guardian_relationship:"",emergency_contact:"",modality:"Capoeira",class_name:"",teacher_name:"",enrollment_date:new Date().toISOString().slice(0,10),enrollment_status:"active",plan_name:"Mensal",monthly_fee:"",due_day:"10"};
const nav=[["⌂","Início","/"],["♙","Alunos","/students"],["♟","Professores","#"],["◈","Modalidades","#"],["▦","Turmas","#"],["＄","Financeiro","#"],["◉","Comunicados","#"],["▣","Agenda","#"],["▤","Relatórios","#"]];
const input="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-purple-500";
const label="mb-2 block text-xs font-medium text-neutral-400";
const statusLabel=(s:string)=>s==="active"?"Ativo":s==="pending"?"Pendente":"Inativo";

export default function StudentsPage(){
 const [students,setStudents]=useState<StudentRow[]>([]);
 const [query,setQuery]=useState(""); const [filter,setFilter]=useState("all");
 const [showForm,setShowForm]=useState(false); const [form,setForm]=useState<StudentForm>(blank);
 const [selected,setSelected]=useState<StudentRow|null>(null);
 const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(""); const [notice,setNotice]=useState("");
 const supabase=createClient();

 const loadStudents=useCallback(async()=>{
  setLoading(true);setError("");
  const {data,error}=await supabase.from("students").select("id,full_name,birth_date,phone,email,enrollment_date,enrollment_status,plan_name,monthly_fee,class_label,modalities(name),student_guardians(guardians(full_name,phone))").order("full_name");
  if(error){setError(error.message);setStudents([]);}else setStudents((data??[]) as unknown as StudentRow[]);
  setLoading(false);
 },[supabase]);

 useEffect(()=>{void loadStudents();},[loadStudents]);

 const visible=students.filter(s=>{
  const guardian=s.student_guardians?.[0]?.guardians?.full_name??"";
  const search=[s.full_name,s.modalities?.name??"",s.class_label??"",guardian].join(" ").toLowerCase();
  return search.includes(query.toLowerCase())&&(filter==="all"||s.enrollment_status===filter);
 });
 const update=(key:keyof StudentForm,value:string)=>setForm(current=>({...current,[key]:value}));

 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setSaving(true);setError("");setNotice("");
  try{
   const {data,error}=await supabase.rpc("admin_create_student",{payload:{
    ...form,modality:form.modality,class_name:form.class_name,teacher_name:form.teacher_name,
    monthly_fee:form.monthly_fee||null,due_day:form.due_day||null
   }});
   if(error)throw error;
   setShowForm(false);setForm(blank);setNotice("Cadastro salvo no banco de dados.");
   await loadStudents();
  }catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar o cadastro.");}
  finally{setSaving(false);}
 }

 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen">
  <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#101014] lg:flex"><div className="border-b border-white/10 px-6 py-7"><div className="flex items-center gap-3"><div className="text-4xl font-black italic text-[#d6ad55]">RM</div><div><p className="text-xs font-bold tracking-[.18em]">ESCOLA DE LUTAS</p><p className="mt-1 text-[10px] tracking-[.28em] text-[#d6ad55]">RAFAEL MOTA</p></div></div></div><div className="px-4 pt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-neutral-500">Menu principal</div><nav className="mt-3 flex-1 space-y-1 px-3">{nav.map(([icon,name,href])=><Link key={name} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${name==="Alunos"?"bg-gradient-to-r from-purple-800/80 to-purple-600/40 text-white":"text-neutral-400 hover:bg-white/5"}`}><span className="w-5 text-center">{icon}</span>{name}</Link>)}</nav></aside>
  <section className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-white/10 bg-[#0d0d11] px-5 md:px-8"><div><p className="text-sm text-neutral-400">Administração / Cadastros</p><h1 className="text-lg font-semibold">Gestão de alunos</h1></div><span className="rounded-full border border-[#d6ad55]/40 px-3 py-2 text-xs text-[#d6ad55]">Área administrativa</span></header>
   <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-purple-300">Base de alunos</p><h2 className="mt-2 text-2xl font-semibold">Cadastro e matrículas</h2><p className="mt-1 text-sm text-neutral-500">Registros consultados diretamente no banco de dados.</p></div><button onClick={()=>{setForm(blank);setShowForm(true);setError("");}} className="rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold hover:bg-purple-600">＋ Novo aluno</button></div>
    {notice&&<p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
    {error&&<p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-3">{[["Todos",students.length],["Ativos",students.filter(s=>s.enrollment_status==="active").length],["Pendentes / inativos",students.filter(s=>s.enrollment_status!=="active").length]].map(([n,v])=><article key={n} className="rounded-2xl border border-white/10 bg-[#15151b] p-5"><p className="text-sm text-neutral-400">{n}</p><p className="mt-2 text-3xl font-semibold">{loading?"—":v}</p></article>)}</div>
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]"><div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between"><div><h3 className="font-semibold">Relação de alunos</h3><p className="mt-1 text-xs text-neutral-500">{visible.length} registro(s)</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar aluno..." className={`${input} sm:w-72`}/><select value={filter} onChange={e=>setFilter(e.target.value)} className={`${input} sm:w-36`}><option value="all">Todos</option><option value="active">Ativos</option><option value="pending">Pendentes</option><option value="inactive">Inativos</option></select></div></div>
     <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-white/[.03] text-xs uppercase tracking-wide text-neutral-500"><tr>{["Aluno","Modalidade / turma","Responsável","Telefone","Plano","Situação",""].map((h,i)=><th key={i} className="px-5 py-4 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{visible.map(s=><tr key={s.id} className="hover:bg-white/[.025]"><td className="px-5 py-4"><p className="font-medium">{s.full_name}</p><p className="mt-1 text-xs text-neutral-500">Desde {s.enrollment_date.split("-").reverse().join("/")}</p></td><td className="px-5 py-4"><p>{s.modalities?.name??"—"}</p><p className="mt-1 text-xs text-neutral-500">{s.class_label??"Turma a definir"}</p></td><td className="px-5 py-4 text-neutral-400">{s.student_guardians?.[0]?.guardians?.full_name??"—"}</td><td className="px-5 py-4 text-neutral-400">{s.phone}</td><td className="px-5 py-4">{s.plan_name??"—"}<p className="mt-1 text-xs text-neutral-500">{s.monthly_fee==null?"Valor a definir":"R$ "+Number(s.monthly_fee).toFixed(2).replace(".",",")}</p></td><td className="px-5 py-4"><span className="rounded-full bg-white/5 px-3 py-1 text-xs">{statusLabel(s.enrollment_status)}</span></td><td className="px-5 py-4"><button onClick={()=>setSelected(s)} className="text-xs text-purple-300">Detalhes →</button></td></tr>)}</tbody></table>{!loading&&visible.length===0&&<p className="p-10 text-center text-sm text-neutral-500">Nenhum aluno encontrado.</p>}{loading&&<p className="p-10 text-center text-sm text-neutral-500">Carregando alunos...</p>}</div>
    </section>
   </div>
  </section>
 </div>

 {showForm&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 md:p-6" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false);}}><form onSubmit={save} className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#17171d] p-5 md:p-7">
  <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-6 flex justify-between border-b border-white/10 bg-[#17171d] px-5 py-5 md:-mx-7 md:-mt-7 md:px-7"><div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Ficha de matrícula</p><h2 className="mt-2 text-xl font-semibold">Novo aluno</h2></div><button type="button" onClick={()=>setShowForm(false)} className="text-2xl text-neutral-400">×</button></div>
  <div className="space-y-7">
   <section><h3 className="mb-4 font-semibold">01 · Dados pessoais</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <label className="sm:col-span-2"><span className={label}>Nome completo *</span><input required value={form.full_name} onChange={e=>update("full_name",e.target.value)} className={input}/></label>
    <label><span className={label}>Nascimento *</span><input required type="date" value={form.birth_date} onChange={e=>update("birth_date",e.target.value)} className={input}/></label>
    <label><span className={label}>CPF</span><input value={form.cpf} onChange={e=>update("cpf",e.target.value)} className={input}/></label>
    <label><span className={label}>Telefone *</span><input required value={form.phone} onChange={e=>update("phone",e.target.value)} className={input}/></label>
    <label><span className={label}>E-mail</span><input type="email" value={form.email} onChange={e=>update("email",e.target.value)} className={input}/></label>
    <label className="sm:col-span-2"><span className={label}>Endereço</span><input value={form.address} onChange={e=>update("address",e.target.value)} className={input}/></label>
   </div></section>
   <section className="border-t border-white/10 pt-6"><h3 className="mb-4 font-semibold">02 · Responsável e emergência</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <label><span className={label}>Nome do responsável</span><input value={form.guardian_name} onChange={e=>update("guardian_name",e.target.value)} className={input}/></label>
    <label><span className={label}>Telefone do responsável</span><input value={form.guardian_phone} onChange={e=>update("guardian_phone",e.target.value)} className={input}/></label>
    <label><span className={label}>Parentesco</span><input value={form.guardian_relationship} onChange={e=>update("guardian_relationship",e.target.value)} className={input}/></label>
    <label className="sm:col-span-2"><span className={label}>Contato de emergência</span><input value={form.emergency_contact} onChange={e=>update("emergency_contact",e.target.value)} className={input}/></label>
   </div></section>
   <section className="border-t border-white/10 pt-6"><h3 className="mb-4 font-semibold">03 · Vínculo esportivo</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <label><span className={label}>Modalidade *</span><select value={form.modality} onChange={e=>update("modality",e.target.value)} className={input}><option>Capoeira</option><option>Luta Livre</option><option>Jiu-Jitsu</option><option>Kickboxing</option><option>Boxe</option><option>Outra</option></select></label>
    <label><span className={label}>Turma / horário</span><input value={form.class_name} onChange={e=>update("class_name",e.target.value)} className={input} placeholder="Ex.: Infantil · 18h"/></label>
    <label><span className={label}>Professor responsável</span><input value={form.teacher_name} onChange={e=>update("teacher_name",e.target.value)} className={input}/></label>
    <label><span className={label}>Data da matrícula *</span><input required type="date" value={form.enrollment_date} onChange={e=>update("enrollment_date",e.target.value)} className={input}/></label>
    <label><span className={label}>Situação</span><select value={form.enrollment_status} onChange={e=>update("enrollment_status",e.target.value)} className={input}><option value="active">Ativo</option><option value="pending">Pendente</option><option value="inactive">Inativo</option></select></label>
   </div></section>
   <section className="border-t border-white/10 pt-6"><h3 className="mb-4 font-semibold">04 · Plano e cobrança</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <label><span className={label}>Plano</span><select value={form.plan_name} onChange={e=>update("plan_name",e.target.value)} className={input}><option>Mensal</option><option>Trimestral</option><option>Semestral</option><option>Anual</option><option>Experimental</option><option>Bolsa / Isento</option></select></label>
    <label><span className={label}>Valor contratado (R$)</span><input type="number" min="0" step="0.01" value={form.monthly_fee} onChange={e=>update("monthly_fee",e.target.value)} className={input}/></label>
    <label><span className={label}>Dia de vencimento</span><select value={form.due_day} onChange={e=>update("due_day",e.target.value)} className={input}>{Array.from({length:28},(_,i)=><option key={i+1}>{i+1}</option>)}</select></label>
   </div><p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/80">O cadastro guarda o plano e o valor contratado, mas não gera cobrança ou pagamento automaticamente.</p></section>
  </div>
  {error&&<p className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
  <div className="mt-7 flex justify-end gap-3 border-t border-white/10 pt-5"><button type="button" onClick={()=>setShowForm(false)} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm">Cancelar</button><button disabled={saving} className="rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{saving?"Salvando...":"Salvar no banco"}</button></div>
 </form></div>}

 {selected&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#17171d] p-6"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Ficha do aluno</p><h2 className="mt-2 text-xl font-semibold">{selected.full_name}</h2></div><button onClick={()=>setSelected(null)} className="text-2xl text-neutral-400">×</button></div><div className="mt-5 grid grid-cols-2 gap-3">{[["Nascimento",selected.birth_date],["Telefone",selected.phone],["E-mail",selected.email??"—"],["Modalidade",selected.modalities?.name??"—"],["Turma",selected.class_label??"—"],["Responsável",selected.student_guardians?.[0]?.guardians?.full_name??"—"],["Plano",selected.plan_name??"—"],["Situação",statusLabel(selected.enrollment_status)]].map(([k,v])=><div key={k} className="rounded-lg bg-white/[.03] p-3"><p className="text-xs text-neutral-500">{k}</p><p className="mt-1 text-sm">{v}</p></div>)}</div></section></div>}
 </main>;
}
