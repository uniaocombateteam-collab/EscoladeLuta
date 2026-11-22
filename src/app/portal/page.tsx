"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = { id:string; full_name:string; birth_date:string|null; enrollment_status:string; plan_name:string|null; monthly_fee:number|null; class_label:string|null; modalities:{name:string}|null };
type LinkRow = { relationship:string|null; is_primary:boolean; students:Student };
type Entry = { id:string; description:string; amount:number; due_date:string|null; status:string; direction:string; paid_at:string|null };

const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const date=(v:string|null)=>v?new Date(v+"T12:00:00").toLocaleDateString("pt-BR"):"—";

export default function PortalPage(){
 const db=useMemo(()=>createClient(),[]),router=useRouter();
 const [name,setName]=useState("Responsável"),[students,setStudents]=useState<Student[]>([]),[entries,setEntries]=useState<Entry[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError||!user){router.replace("/login");return;}
  const [profile,roles,guardian,links]=await Promise.all([
   db.from("profiles").select("full_name").eq("id",user.id).single(),
   db.from("profile_roles").select("role").eq("profile_id",user.id),
   db.from("guardians").select("id,full_name").eq("profile_id",user.id).maybeSingle(),
   db.from("student_guardians").select("relationship,is_primary,students(id,full_name,birth_date,enrollment_status,plan_name,monthly_fee,class_label,modalities(name))")
  ]);
  const isGuardian=(roles.data??[]).some((r:any)=>r.role==="guardian");
  if(profile.error||roles.error||!isGuardian){router.replace("/");return;}
  setName(profile.data?.full_name||"Responsável");
  if(guardian.error||links.error){setError((guardian.error||links.error)?.message||"Não foi possível carregar o portal.");setLoading(false);return;}
  if(!guardian.data){setStudents([]);setEntries([]);setError("Seu acesso ainda não está vinculado a um cadastro de responsável. Entre em contato com a administração da academia.");setLoading(false);return;}
  const linked=(links.data??[]).map((x:any)=>x.students).filter(Boolean) as Student[];
  setStudents(linked);
  const studentIds=linked.map(s=>s.id);
  if(studentIds.length===0){setEntries([]);setLoading(false);return;}
  const finance=await db.from("financial_entries").select("id,description,amount,due_date,status,direction,paid_at").eq("direction","income").in("student_id",studentIds).order("due_date",{ascending:false}).limit(100);
  if(finance.error){setError(finance.error.message);setLoading(false);return;}
  setEntries((finance.data??[]) as Entry[]);
  setLoading(false);
 },[db,router]);
 useEffect(()=>{void load();},[load]);
 const pending=entries.filter(e=>e.status==="pending").reduce((n,e)=>n+Number(e.amount),0);
 const paid=entries.filter(e=>e.status==="paid").reduce((n,e)=>n+Number(e.amount),0);
 async function logout(){await db.auth.signOut();router.replace("/login");router.refresh();}
 return <main className="min-h-screen bg-[#050505] text-white"><div className="min-h-screen"><section className="min-w-0">
  <header className="flex items-center justify-between border-b border-white/10 bg-[#0b0b0b] px-5 py-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Área do responsável</p><h1 className="mt-1 text-xl font-bold">Meu portal</h1></div><button onClick={logout} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-300 hover:border-[#FFD200]">Sair</button></header>
  <div className="mx-auto max-w-6xl space-y-6 p-5 pb-24 md:p-8 lg:pb-8">
   <section className="rounded-3xl border border-[#FFD200]/20 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,210,0,.12),transparent_45%),#111] p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Escola de Lutas Rafael Mota</p><h2 className="mt-3 text-3xl font-black">Olá, {name.split(" ")[0]}.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">Acompanhe os dados dos alunos vinculados à sua responsabilidade, consulte informações de matrícula e visualize os lançamentos financeiros.</p></section>
   {error&&<p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">{error}</p>}
   <section><div className="mb-4"><p className="text-xs font-bold tracking-[.2em] text-[#FFD200]">ACOMPANHAMENTO</p><h3 className="mt-1 text-2xl font-bold">Alunos vinculados</h3></div>
    {loading?<p className="rounded-xl border border-white/10 bg-[#111] p-6 text-sm text-neutral-400">Carregando informações...</p>:students.length===0?<p className="rounded-xl border border-white/10 bg-[#111] p-6 text-sm text-neutral-400">Nenhum aluno vinculado a este acesso.</p>:<div className="grid gap-4 md:grid-cols-2">{students.map(s=><article key={s.id} className="rounded-2xl border border-white/10 bg-[#111] p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="text-lg font-bold">{s.full_name}</h4><p className="mt-1 text-xs text-neutral-500">{s.modalities?.name||"Modalidade não definida"} · {s.class_label||"Turma a definir"}</p></div><span className={s.enrollment_status==="active"?"rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300":"rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-200"}>{s.enrollment_status==="active"?"Ativo":s.enrollment_status==="pending"?"Pendente":"Inativo"}</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4"><div><p className="text-xs text-neutral-500">Plano</p><p className="mt-1 text-sm font-semibold">{s.plan_name||"—"}</p></div><div><p className="text-xs text-neutral-500">Mensalidade</p><p className="mt-1 text-sm font-semibold">{s.monthly_fee===null?"—":money(Number(s.monthly_fee))}</p></div></div></article>)}</div>}
   </section>
   <section><div className="mb-4"><p className="text-xs font-bold tracking-[.2em] text-[#FFD200]">FINANCEIRO</p><h3 className="mt-1 text-2xl font-bold">Resumo de mensalidades</h3></div><div className="grid gap-3 sm:grid-cols-2"><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Em aberto</p><p className="mt-2 text-2xl font-bold text-amber-200">{loading?"—":money(pending)}</p></article><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Pagamentos registrados</p><p className="mt-2 text-2xl font-bold text-emerald-300">{loading?"—":money(paid)}</p></article></div>
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#111]"><div className="border-b border-white/10 p-4"><h4 className="font-semibold">Lançamentos</h4></div>{entries.length===0?<p className="p-5 text-sm text-neutral-500">Não há lançamentos financeiros para exibir.</p>:<div className="divide-y divide-white/5">{entries.map(e=><div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium">{e.description}</p><p className="mt-1 text-xs text-neutral-500">Vencimento: {date(e.due_date)}</p></div><div className="text-right"><p className="font-semibold">{money(Number(e.amount))}</p><p className={e.status==="paid"?"text-xs text-emerald-300":"text-xs text-amber-200"}>{e.status==="paid"?"Pago":e.status==="pending"?"Em aberto":"Cancelado"}</p></div></div>)}</div>}</div>
   </section>
   <section className="rounded-2xl border border-white/10 bg-[#111] p-5"><h3 className="font-bold">Precisa de ajuda?</h3><p className="mt-2 text-sm leading-6 text-neutral-400">Para corrigir dados cadastrais, solicitar alteração de modalidade ou tratar de pagamentos, entre em contato diretamente com a administração da academia.</p></section>
  </div>
 </section></div></main>;
}
