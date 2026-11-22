"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
 id:string; full_name:string; enrollment_status:string; plan_name:string|null;
 monthly_fee:number|null; class_label:string|null; class_id:string|null;
 modality_id:string|null; profile_id:string|null;
 modalities:{name:string;image_url:string|null}[]|null;
};
type Slot = {id:string;title:string;modality_name:string;weekday:number;start_time:string;end_time:string;location:string|null;class_id:string|null};
type Exception = {id:string;slot_id:string;exception_date:string;status:string;reason:string;note:string|null;replacement_date:string|null;replacement_start_time:string|null;replacement_end_time:string|null};
type Attendance = {id:string;class_date:string;status:"present"|"absent"|"justified";note:string|null};
type Entry = {id:string;description:string;amount:number;due_date:string|null;status:string;paid_at:string|null;competence_month:string|null};
type Announcement = {id:string;title:string;content:string;category:string;priority:"normal"|"important"|"urgent";pinned:boolean;publish_at:string|null;created_at:string};
const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const date=(v:string|null)=>v?new Date(v+"T12:00:00").toLocaleDateString("pt-BR"):"—";
const days=["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const statusLabel=(s:string)=>s==="paid"?"Pago":s==="pending"?"Em aberto":s==="cancelled"?"Cancelado":s;
const attendanceLabel=(s:string)=>s==="present"?"Presente":s==="absent"?"Ausente":"Justificada";
const todayISO=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};

export default function StudentPortalPage(){
 const db=useMemo(()=>createClient(),[]),router=useRouter();
 const [student,setStudent]=useState<Student|null>(null),[slots,setSlots]=useState<Slot[]>([]);
 const [exceptions,setExceptions]=useState<Exception[]>([]),[attendance,setAttendance]=useState<Attendance[]>([]);
 const [entries,setEntries]=useState<Entry[]>([]),[announcements,setAnnouncements]=useState<Announcement[]>([]);
 const [readIds,setReadIds]=useState<string[]>([]),[selectedAnnouncement,setSelectedAnnouncement]=useState<Announcement|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [activeTab,setActiveTab]=useState("inicio");
 const [financeFilter,setFinanceFilter]=useState("all");
 const [announcementFilter,setAnnouncementFilter]=useState("all");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user){router.replace("/login");return;}
  const {data:roles,error:roleError}=await db.from("profile_roles").select("role").eq("profile_id",user.id);
  if(roleError||!(roles??[]).some((r:any)=>r.role==="student")){router.replace("/");return;}
  const {data:s,error:sError}=await db.from("students").select("id,full_name,enrollment_status,plan_name,monthly_fee,class_label,class_id,modality_id,profile_id,modalities(name,image_url)").eq("profile_id",user.id).maybeSingle();
  if(sError){setError("Não foi possível carregar sua matrícula: "+sError.message);setLoading(false);return;}
  if(!s){setError("Sua conta ainda não está vinculada a uma matrícula. Procure a administração.");setLoading(false);return;}
  const current:Student={...s,modalities:Array.isArray(s.modalities)?s.modalities:s.modalities?[s.modalities]:null};setStudent(current);
  const [schedule,finance,attendanceRows,noticeRows,readRows]=await Promise.all([
   current.class_id
    ? db.from("academy_schedule_slots").select("id,title,modality_name,weekday,start_time,end_time,location,class_id").eq("active",true).eq("class_id",current.class_id).order("weekday").order("start_time")
    : current.modality_id
      ? db.from("academy_schedule_slots").select("id,title,modality_name,weekday,start_time,end_time,location,class_id").eq("active",true).eq("modality_id",current.modality_id).order("weekday").order("start_time")
      : Promise.resolve({data:[],error:null}),
   db.from("financial_entries").select("id,description,amount,due_date,status,paid_at,competence_month").eq("student_id",current.id).eq("direction","income").order("due_date",{ascending:false}).limit(100),
   db.from("student_attendance").select("id,class_date,status,note").eq("student_id",current.id).order("class_date",{ascending:false}).limit(500),
   db.from("academy_announcements").select("id,title,content,category,priority,pinned,publish_at,created_at").eq("status","published").order("pinned",{ascending:false}).order("publish_at",{ascending:false,nullsFirst:false}).limit(50),
   db.from("academy_announcement_reads").select("announcement_id").eq("profile_id",user.id)
  ]);
  if(schedule.error)setError("Não foi possível carregar sua grade de aulas: "+schedule.error.message);else setSlots((schedule.data??[]) as Slot[]);
  if(finance.error)setError("Não foi possível carregar seu financeiro: "+finance.error.message);else setEntries((finance.data??[]) as Entry[]);
  if(attendanceRows.error)setError("Não foi possível carregar seu histórico de frequência: "+attendanceRows.error.message);else setAttendance((attendanceRows.data??[]) as Attendance[]);
  if(noticeRows.error)setError("Não foi possível carregar os comunicados: "+noticeRows.error.message);else setAnnouncements((noticeRows.data??[]) as Announcement[]);
  if(readRows.error)setError("Não foi possível carregar as leituras dos comunicados: "+readRows.error.message);else setReadIds((readRows.data??[]).map((r:any)=>r.announcement_id));
  const slotIds=(schedule.data??[]).map((x:any)=>x.id);
  if(slotIds.length){
   const from=todayISO(),to=new Date(Date.now()+45*86400000).toISOString().slice(0,10);
   const {data:changes,error:changesError}=await db.from("academy_schedule_exceptions").select("id,slot_id,exception_date,status,reason,note,replacement_date,replacement_start_time,replacement_end_time").in("slot_id",slotIds).gte("exception_date",from).lte("exception_date",to).order("exception_date");
   if(!changesError)setExceptions((changes??[]) as Exception[]);
  }
  setLoading(false);
 },[db,router]);
 useEffect(()=>{void load();},[load]);
 async function logout(){await db.auth.signOut();router.replace("/login");router.refresh();}
 async function openAnnouncement(item:Announcement){
  setSelectedAnnouncement(item);
  if(readIds.includes(item.id))return;
  const {error:readError}=await db.from("academy_announcement_reads").upsert({announcement_id:item.id,profile_id:(await db.auth.getUser()).data.user?.id},{onConflict:"announcement_id,profile_id",ignoreDuplicates:true});
  if(!readError)setReadIds(prev=>[...prev,item.id]);
 }
 const pending=entries.filter(e=>e.status==="pending").reduce((n,e)=>n+Number(e.amount),0);
 const paid=entries.filter(e=>e.status==="paid").reduce((n,e)=>n+Number(e.amount),0);
 const present=attendance.filter(a=>a.status==="present").length;
 const absence=attendance.filter(a=>a.status==="absent").length;
 const justified=attendance.filter(a=>a.status==="justified").length;
 const attendanceRate=attendance.length?Math.round(present/attendance.length*100):0;
 const currentMonth=todayISO().slice(0,7);
 const monthAttendance=attendance.filter(a=>a.class_date.startsWith(currentMonth)).length;
 const unread=announcements.filter(a=>!readIds.includes(a.id)).length;
 const visibleEntries=entries.filter(e=>financeFilter==="all"||e.status===financeFilter);
 const visibleAnnouncements=announcements.filter(a=>announcementFilter==="all"||(announcementFilter==="unread"?!readIds.includes(a.id):readIds.includes(a.id)));
 const nextSlots=[...slots].sort((a,b)=>a.weekday-b.weekday||a.start_time.localeCompare(b.start_time));
 const nav=[["inicio","Início"],["rotina","Minha rotina"],["evolucao","Minha evolução"],["financeiro","Financeiro"],["comunicados","Comunicados"]];
 const jump=(id:string)=>{setActiveTab(id);document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});};
 return <main className="min-h-screen bg-[#050505] text-white">
  <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090909]/95 px-4 py-3 backdrop-blur md:px-8">
   <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
    <div><p className="text-[10px] font-black uppercase tracking-[.25em] text-[#FFD200]">Escola de Lutas</p><h1 className="text-base font-black md:text-lg">Rafael Mota · Portal do aluno</h1></div>
    <div className="flex items-center gap-2"><button onClick={()=>router.push("/acesso")} className="hidden rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-300 sm:block">Perfis</button><button onClick={logout} className="rounded-lg bg-[#FFD200] px-3 py-2 text-xs font-bold text-black">Sair</button></div>
   </div>
   <nav aria-label="Navegação do portal" className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1">
    {nav.map(([id,label])=><button key={id} onClick={()=>jump(id)} className={"shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition "+(activeTab===id?"bg-[#FFD200] text-black":"border border-white/10 bg-white/5 text-neutral-300 hover:border-[#FFD200]/50")}>{label}{id==="comunicados"&&unread>0?" · "+unread:""}</button>)}
   </nav>
  </header>
  <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 pb-28 md:px-8 md:py-9">
   {error&&<p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">{error}</p>}
   {notice&&<p role="status" className="rounded-xl border border-[#FFD200]/20 bg-[#FFD200]/10 p-4 text-sm text-yellow-100">{notice}</p>}
   <section id="inicio" className="scroll-mt-36 space-y-5">
    <article className="relative overflow-hidden rounded-3xl border border-[#FFD200]/20 bg-[radial-gradient(ellipse_at_85%_10%,rgba(255,210,0,.2),transparent_42%),linear-gradient(120deg,#202020,#090909_75%)] p-6 md:p-9">
     <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#FFD200]/15"/><div className="relative">
      <p className="text-xs font-black uppercase tracking-[.22em] text-[#FFD200]">Seu espaço na academia</p>
      <h2 className="mt-3 text-3xl font-black md:text-5xl">Olá, {student?.full_name.split(" ")[0]||"atleta"}.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">Aqui você acompanha sua rotina, frequência, informações financeiras e comunicados da Escola de Lutas Rafael Mota.</p>
      <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-neutral-200">{student?.modalities?.[0]?.name||"Modalidade a definir"}</span><span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-neutral-200">{student?.class_label||"Turma a definir"}</span><span className={"rounded-full px-3 py-1.5 text-xs "+(student?.enrollment_status==="active"?"bg-emerald-500/15 text-emerald-300":"bg-amber-500/15 text-amber-200")}>{student?.enrollment_status==="active"?"Matrícula ativa":student?.enrollment_status==="pending"?"Matrícula pendente":"Verificar matrícula"}</span></div>
     </div>
    </article>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
     <article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Aulas neste mês</p><p className="mt-2 text-3xl font-black">{loading?"—":monthAttendance}</p><p className="mt-1 text-[11px] text-neutral-500">Registros de frequência</p></article>
     <article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Presença acumulada</p><p className="mt-2 text-3xl font-black text-emerald-300">{loading?"—":attendanceRate+"%"}</p><p className="mt-1 text-[11px] text-neutral-500">{present} presença(s) registrada(s)</p></article>
     <article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Financeiro em aberto</p><p className="mt-2 text-2xl font-black text-amber-200">{loading?"—":money(pending)}</p><p className="mt-1 text-[11px] text-neutral-500">Lançamentos pendentes</p></article>
     <article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Novos comunicados</p><p className="mt-2 text-3xl font-black text-[#FFD200]">{loading?"—":unread}</p><p className="mt-1 text-[11px] text-neutral-500">Ainda não lidos</p></article>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
     <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#FFD200]">Próximos treinos</p><h3 className="mt-1 text-lg font-bold">Sua grade</h3></div><button onClick={()=>jump("rotina")} className="text-xs font-semibold text-[#FFD200]">Ver rotina →</button></div>{nextSlots.length?<div className="mt-4 space-y-3">{nextSlots.slice(0,3).map(s=><div key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3"><div><p className="text-sm font-semibold">{s.title}</p><p className="mt-1 text-xs text-neutral-400">{days[s.weekday]} · {s.modality_name}</p></div><p className="shrink-0 text-sm font-bold text-[#FFD200]">{s.start_time.slice(0,5)}</p></div>)}</div>:<p className="mt-4 text-sm text-neutral-500">Sua turma ainda não possui horários publicados.</p>}</article>
     <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#FFD200]">Avisos da academia</p><h3 className="mt-1 text-lg font-bold">Comunicados recentes</h3></div><button onClick={()=>jump("comunicados")} className="text-xs font-semibold text-[#FFD200]">Ver todos →</button></div>{announcements.slice(0,3).map(a=><button key={a.id} onClick={()=>void openAnnouncement(a)} className="mt-3 block w-full rounded-xl bg-white/5 p-3 text-left"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase text-[#FFD200]">{a.category}</span>{!readIds.includes(a.id)&&<span className="rounded-full bg-[#FFD200]/15 px-2 py-1 text-[10px] text-[#FFD200]">Novo</span>}</div><p className="mt-1 text-sm font-semibold">{a.title}</p><p className="mt-1 line-clamp-1 text-xs text-neutral-500">{a.content}</p></button>)}{announcements.length===0&&<p className="mt-4 text-sm text-neutral-500">Nenhum comunicado publicado no momento.</p>}</article>
    </div>
   </section>
   <section id="rotina" className="scroll-mt-36 space-y-4">
    <div><p className="text-xs font-black tracking-[.22em] text-[#FFD200]">ORGANIZE-SE</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Minha rotina</h2><p className="mt-1 text-sm text-neutral-400">Horários vinculados à sua turma ou modalidade.</p></div>
    {slots.length?<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{nextSlots.map(s=><article key={s.id} className="rounded-2xl border border-white/10 bg-[#111] p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-[#FFD200]">{days[s.weekday]||"Aula"}</span><span className="text-xs text-neutral-400">{s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}</span></div><h3 className="mt-3 font-bold">{s.title}</h3><p className="mt-1 text-sm text-neutral-400">{s.modality_name}</p>{s.location&&<p className="mt-2 text-xs text-neutral-500">Local: {s.location}</p>}</article>)}</div>:<p className="rounded-2xl border border-white/10 bg-[#111] p-5 text-sm text-neutral-400">Não há horários vinculados à sua turma. Se acredita que isso está incorreto, fale com a administração.</p>}
    {exceptions.length>0&&<article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"><h3 className="font-bold text-amber-200">Alterações na grade</h3><div className="mt-3 space-y-2">{exceptions.map(e=><div key={e.id} className="rounded-xl bg-black/20 p-3 text-sm"><p className="font-semibold">{date(e.exception_date)} · {e.status==="cancelled"?"Aula cancelada":"Aula remarcada"}</p><p className="mt-1 text-xs text-neutral-300">{e.reason}{e.note?" — "+e.note:""}{e.status==="rescheduled"&&e.replacement_date?" · Nova data: "+date(e.replacement_date):""}</p></div>)}</div></article>}
   </section>
   <section id="evolucao" className="scroll-mt-36 space-y-4">
    <div><p className="text-xs font-black tracking-[.22em] text-[#FFD200]">ACOMPANHAMENTO</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Minha evolução</h2><p className="mt-1 text-sm text-neutral-400">Seu histórico de participação, com base nos registros feitos pelos professores.</p></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Presenças</p><p className="mt-2 text-3xl font-black text-emerald-300">{present}</p></article><article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Ausências</p><p className="mt-2 text-3xl font-black text-rose-300">{absence}</p></article><article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Justificadas</p><p className="mt-2 text-3xl font-black">{justified}</p></article><article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Frequência</p><p className="mt-2 text-3xl font-black text-[#FFD200]">{attendanceRate}%</p></article></div>
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]"><div className="border-b border-white/10 p-4"><h3 className="font-bold">Histórico de aulas</h3></div>{attendance.length?<div className="divide-y divide-white/5">{attendance.slice(0,30).map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-4"><div><p className="text-sm font-semibold">{date(a.class_date)}</p>{a.note&&<p className="mt-1 text-xs text-neutral-500">{a.note}</p>}</div><span className={"rounded-full px-3 py-1 text-xs "+(a.status==="present"?"bg-emerald-500/10 text-emerald-300":a.status==="absent"?"bg-rose-500/10 text-rose-300":"bg-amber-500/10 text-amber-200")}>{attendanceLabel(a.status)}</span></div>)}</div>:<p className="p-5 text-sm text-neutral-500">Ainda não há registros de frequência.</p>}</article>
   </section>
   <section id="financeiro" className="scroll-mt-36 space-y-4">
    <div><p className="text-xs font-black tracking-[.22em] text-[#FFD200]">SUA CONTA</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Financeiro</h2><p className="mt-1 text-sm text-neutral-400">Consulte suas mensalidades e o histórico de lançamentos.</p></div>
    <div className="grid gap-3 sm:grid-cols-3"><article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Mensalidade contratada</p><p className="mt-2 text-xl font-black">{student?.monthly_fee==null?"—":money(Number(student.monthly_fee))}</p></article><article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Em aberto</p><p className="mt-2 text-xl font-black text-amber-200">{money(pending)}</p></article><article className="rounded-2xl border border-white/10 bg-[#111] p-4"><p className="text-xs text-neutral-400">Pagamentos registrados</p><p className="mt-2 text-xl font-black text-emerald-300">{money(paid)}</p></article></div>
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4"><h3 className="font-bold">Lançamentos</h3><div className="flex gap-2 overflow-x-auto">{[["all","Todos"],["pending","Em aberto"],["paid","Pagos"],["cancelled","Cancelados"]].map(([id,label])=><button key={id} onClick={()=>setFinanceFilter(id)} className={"shrink-0 rounded-full px-3 py-2 text-xs "+(financeFilter===id?"bg-[#FFD200] font-bold text-black":"bg-white/5 text-neutral-300")}>{label}</button>)}</div></div>{visibleEntries.length?<div className="divide-y divide-white/5">{visibleEntries.map(e=><div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-semibold">{e.description}</p><p className="mt-1 text-xs text-neutral-500">Vencimento: {date(e.due_date)}{e.competence_month?" · Competência: "+date(e.competence_month):""}</p></div><div className="text-right"><p className="font-bold">{money(Number(e.amount))}</p><p className={"mt-1 text-xs "+(e.status==="paid"?"text-emerald-300":e.status==="pending"?"text-amber-200":"text-neutral-500")}>{statusLabel(e.status)}</p></div></div>)}</div>:<p className="p-5 text-sm text-neutral-500">Nenhum lançamento nesta categoria.</p>}</article>
    <p className="text-xs leading-5 text-neutral-500">O portal é somente para consulta. Para corrigir lançamentos ou tratar de pagamentos, entre em contato com a administração.</p>
   </section>
   <section id="comunicados" className="scroll-mt-36 space-y-4">
    <div><p className="text-xs font-black tracking-[.22em] text-[#FFD200]">FIQUE POR DENTRO</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Comunicados</h2><p className="mt-1 text-sm text-neutral-400">Avisos oficiais publicados pela academia para alunos.</p></div>
    <div className="flex gap-2 overflow-x-auto">{[["all","Todos"],["unread","Não lidos"],["read","Lidos"]].map(([id,label])=><button key={id} onClick={()=>setAnnouncementFilter(id)} className={"shrink-0 rounded-full px-4 py-2 text-xs font-semibold "+(announcementFilter===id?"bg-[#FFD200] text-black":"border border-white/10 bg-white/5 text-neutral-300")}>{label}</button>)}</div>
    <div className="space-y-3">{visibleAnnouncements.map(a=><button key={a.id} onClick={()=>void openAnnouncement(a)} className="block w-full rounded-2xl border border-white/10 bg-[#111] p-4 text-left hover:border-[#FFD200]/40"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-wide text-[#FFD200]">{a.category}</span>{a.pinned&&<span className="text-[10px] text-neutral-400">Fixado</span>}{a.priority!=="normal"&&<span className={"rounded-full px-2 py-1 text-[10px] "+(a.priority==="urgent"?"bg-rose-500/10 text-rose-300":"bg-amber-500/10 text-amber-200")}>{a.priority==="urgent"?"Urgente":"Importante"}</span>}{!readIds.includes(a.id)&&<span className="rounded-full bg-[#FFD200]/15 px-2 py-1 text-[10px] text-[#FFD200]">Novo</span>}<span className="ml-auto text-xs text-neutral-500">{date((a.publish_at||a.created_at).slice(0,10))}</span></div><h3 className="mt-2 font-bold">{a.title}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-400">{a.content}</p></button>)}{visibleAnnouncements.length===0&&<p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-neutral-500">Não há comunicados nesta categoria.</p>}</div>
   </section>
  </div>
  {selectedAnnouncement&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-5" onClick={()=>setSelectedAnnouncement(null)}><article onClick={e=>e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#111] p-6 sm:rounded-3xl"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#FFD200]">{selectedAnnouncement.category}</span><button onClick={()=>setSelectedAnnouncement(null)} className="rounded-lg px-3 py-2 text-sm text-neutral-400">Fechar ✕</button></div><h2 className="mt-4 text-2xl font-black">{selectedAnnouncement.title}</h2><p className="mt-2 text-xs text-neutral-500">{date((selectedAnnouncement.publish_at||selectedAnnouncement.created_at).slice(0,10))}</p><div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-neutral-200">{selectedAnnouncement.content}</div><p className="mt-8 border-t border-white/10 pt-4 text-xs text-emerald-300">✓ Leitura registrada nesta conta</p></article></div>}
 </main>;
}
