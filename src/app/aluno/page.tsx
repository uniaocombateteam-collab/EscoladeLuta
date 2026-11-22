"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
type Student={id:string;full_name:string;enrollment_status:string;plan_name:string|null;monthly_fee:number|null;class_label:string|null;email:string|null;modalities:{name:string}[]|null};
type Entry={id:string;description:string;amount:number;due_date:string|null;status:string;paid_at:string|null};
const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const date=(v:string|null)=>v?new Date(v+"T12:00:00").toLocaleDateString("pt-BR"):"—";
export default function StudentPortalPage(){
 const db=useMemo(()=>createClient(),[]),router=useRouter();
 const [student,setStudent]=useState<Student|null>(null),[entries,setEntries]=useState<Entry[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError||!user){router.replace("/login");return;}
  const {data:roles,error:roleError}=await db.from("profile_roles").select("role").eq("profile_id",user.id);
  if(roleError||!(roles??[]).some((r:any)=>r.role==="student")){router.replace("/");return;}
  const {data:s,error:sError}=await db.from("students").select("id,full_name,enrollment_status,plan_name,monthly_fee,class_label,email,modalities(name)").eq("profile_id",user.id).maybeSingle();
  if(sError){setError(sError.message);setLoading(false);return;}
  if(!s){setError("Sua conta ainda não está vinculada a uma matrícula. Procure a administração da academia.");setStudent(null);setEntries([]);setLoading(false);return;}
  setStudent(s as Student);
  const {data:finance,error:fError}=await db.from("financial_entries").select("id,description,amount,due_date,status,paid_at").eq("student_id",s.id).eq("direction","income").order("due_date",{ascending:false}).limit(100);
  if(fError)setError(fError.message);else setEntries((finance??[]) as Entry[]);
  setLoading(false);
 },[db,router]);
 useEffect(()=>{void load();},[load]);
 async function logout(){await db.auth.signOut();router.replace("/login");router.refresh();}
 const pending=entries.filter(e=>e.status==="pending").reduce((n,e)=>n+Number(e.amount),0);
 const paid=entries.filter(e=>e.status==="paid").reduce((n,e)=>n+Number(e.amount),0);
 return <main className="min-h-screen bg-[#050505] text-white"><header className="flex items-center justify-between border-b border-white/10 bg-[#0b0b0b] px-5 py-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Área do aluno</p><h1 className="mt-1 text-xl font-bold">Meu portal</h1></div><div className="flex gap-2"><button onClick={()=>router.push("/acesso")} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-300">Trocar perfil</button><button onClick={logout} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-300">Sair</button></div></header>
 <div className="mx-auto max-w-6xl space-y-6 p-5 pb-12 md:p-8">
  <section className="rounded-3xl border border-[#FFD200]/20 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,210,0,.12),transparent_45%),#111] p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Escola de Lutas Rafael Mota</p><h2 className="mt-3 text-3xl font-black">{loading?"Carregando...":student?"Olá, "+student.full_name.split(" ")[0]+".":"Meu desenvolvimento"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">Acompanhe sua matrícula e suas informações financeiras em um só lugar.</p></section>
  {error&&<p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">{error}</p>}
  {student&&<><section className="grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Modalidade</p><p className="mt-2 text-lg font-bold">{student.modalities?.[0]?.name||"A definir"}</p></article><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Turma</p><p className="mt-2 text-lg font-bold">{student.class_label||"A definir"}</p></article><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Situação</p><p className="mt-2 text-lg font-bold">{student.enrollment_status==="active"?"Matrícula ativa":student.enrollment_status==="pending"?"Pendente":"Inativa"}</p></article></section>
  <section><div className="mb-4"><p className="text-xs font-bold tracking-[.2em] text-[#FFD200]">FINANCEIRO</p><h3 className="mt-1 text-2xl font-bold">Minha mensalidade</h3></div><div className="grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Valor do plano</p><p className="mt-2 text-2xl font-bold">{student.monthly_fee===null?"—":money(Number(student.monthly_fee))}</p></article><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Em aberto</p><p className="mt-2 text-2xl font-bold text-amber-200">{loading?"—":money(pending)}</p></article><article className="rounded-xl border border-white/10 bg-[#111] p-5"><p className="text-sm text-neutral-400">Pagamentos registrados</p><p className="mt-2 text-2xl font-bold text-emerald-300">{loading?"—":money(paid)}</p></article></div></section>
  <section className="overflow-hidden rounded-xl border border-white/10 bg-[#111]"><div className="border-b border-white/10 p-4"><h3 className="font-semibold">Histórico financeiro</h3></div>{entries.length===0?<p className="p-5 text-sm text-neutral-500">Não há lançamentos financeiros para exibir.</p>:<div className="divide-y divide-white/5">{entries.map(e=><div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium">{e.description}</p><p className="mt-1 text-xs text-neutral-500">Vencimento: {date(e.due_date)}</p></div><div className="text-right"><p className="font-semibold">{money(Number(e.amount))}</p><p className={e.status==="paid"?"text-xs text-emerald-300":"text-xs text-amber-200"}>{e.status==="paid"?"Pago":e.status==="pending"?"Em aberto":"Cancelado"}</p></div></div>)}</div>}</section></>}
 </div></main>;
}
