"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = { id:string; full_name:string; enrollment_status:string; plan_name:string|null; monthly_fee:number|null; class_label:string|null; modalities:{name:string}[]|null };
type Modality = { id:string; name:string };
type Banner = { id:string; title:string; description:string|null; image_url:string|null; button_label:string|null; button_target:string|null };
type Slot = { id:string; title:string; modality_name:string; weekday:number; start_time:string; end_time:string; location:string|null };
type Entry = { id:string; description:string; amount:number; due_date:string|null; status:string };
const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const prices:Record<string,number>={"Jiu-Jitsu":80,"Boxe":80,"Kickboxing":80,"Capoeira":40};
const days=["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const defaultBanners:Banner[]=[
 {id:"welcome",title:"Sua próxima conquista começa aqui.",description:"Conheça as modalidades da Escola de Lutas Rafael Mota e descubra novas formas de treinar, evoluir e fazer parte da equipe.",image_url:null,button_label:"Explorar modalidades",button_target:"#modalidades"},
 {id:"trial",title:"Experimente uma nova modalidade.",description:"Você já treina conosco. Que tal conhecer outra modalidade e ampliar seus desafios?",image_url:null,button_label:"Solicitar aula experimental",button_target:"#modalidades"}
];
export default function StudentPortalPage(){
 const db=useMemo(()=>createClient(),[]),router=useRouter();
 const [student,setStudent]=useState<Student|null>(null),[entries,setEntries]=useState<Entry[]>([]);
 const [modalities,setModalities]=useState<Modality[]>([]),[banners,setBanners]=useState<Banner[]>(defaultBanners),[slots,setSlots]=useState<Slot[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[modalOpen,setModalOpen]=useState(false);
 const [chosen,setChosen]=useState(""),[requestedDate,setRequestedDate]=useState(""),[message,setMessage]=useState(""),[sending,setSending]=useState(false),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError||!user){router.replace("/login");return;}
  const {data:roles,error:roleError}=await db.from("profile_roles").select("role").eq("profile_id",user.id);
  if(roleError||!(roles??[]).some((r:any)=>r.role==="student")){router.replace("/");return;}
  const {data:s,error:sError}=await db.from("students").select("id,full_name,enrollment_status,plan_name,monthly_fee,class_label,modalities(name)").eq("profile_id",user.id).maybeSingle();
  if(sError){setError("Não foi possível carregar sua matrícula: "+sError.message);setLoading(false);return;}
  if(!s){setError("Sua conta ainda não está vinculada a uma matrícula. Procure a administração.");setLoading(false);return;}
  setStudent(s as Student);
  const [mods,bannerRows,schedule,finance]=await Promise.all([
   db.from("modalities").select("id,name").eq("active",true).order("name"),
   db.from("academy_portal_banners").select("id,title,description,image_url,button_label,button_target").eq("active",true).order("sort_order"),
   db.from("academy_schedule_slots").select("id,title,modality_name,weekday,start_time,end_time,location").eq("active",true).order("weekday").order("start_time"),
   db.from("financial_entries").select("id,description,amount,due_date,status").eq("student_id",s.id).eq("direction","income").order("due_date",{ascending:false}).limit(50)
  ]);
  if(mods.error) setError("Não foi possível carregar as modalidades.");
  else setModalities((mods.data??[]) as Modality[]);
  if(!bannerRows.error && (bannerRows.data??[]).length) setBanners(bannerRows.data as Banner[]);
  if(!schedule.error) setSlots((schedule.data??[]) as Slot[]);
  if(!finance.error) setEntries((finance.data??[]) as Entry[]);
  setLoading(false);
 },[db,router]);
 useEffect(()=>{void load();},[load]);
 async function logout(){await db.auth.signOut();router.replace("/login");router.refresh();}
 async function submitTrial(e:React.FormEvent){
  e.preventDefault();if(!student||!chosen)return;
  setSending(true);setNotice("");
  const {error:insertError}=await db.from("academy_trial_class_requests").insert({student_id:student.id,modality_id:chosen,requested_date:requestedDate||null,message:message.trim()||null});
  if(insertError){setNotice("Não foi possível enviar a solicitação: "+insertError.message);}
  else{setNotice("Solicitação enviada! A administração confirmará a disponibilidade pelo portal.");setModalOpen(false);setChosen("");setRequestedDate("");setMessage("");}
  setSending(false);
 }
 const pending=entries.filter(e=>e.status==="pending").reduce((n,e)=>n+Number(e.amount),0);
 const paid=entries.filter(e=>e.status==="paid").reduce((n,e)=>n+Number(e.amount),0);
 const ownModality=student?.modalities?.[0]?.name;
 const otherModalities=modalities.filter(m=>m.name!==ownModality);
 return <main className="min-h-screen bg-[#050505] text-white">
  <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#090909]/95 px-4 py-4 backdrop-blur md:px-8">
   <div><p className="text-[10px] font-black uppercase tracking-[.25em] text-[#FFD200]">Escola de Lutas</p><h1 className="text-lg font-black">Rafael Mota</h1></div>
   <nav className="hidden items-center gap-5 text-sm text-neutral-300 md:flex"><a href="#inicio" className="hover:text-[#FFD200]">Início</a><a href="#modalidades" className="hover:text-[#FFD200]">Modalidades</a><a href="#agenda" className="hover:text-[#FFD200]">Horários</a><a href="#minha-area" className="hover:text-[#FFD200]">Minha área</a></nav>
   <div className="flex gap-2"><button onClick={()=>router.push("/acesso")} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-300">Perfis</button><button onClick={logout} className="rounded-lg bg-[#FFD200] px-3 py-2 text-xs font-bold text-black">Sair</button></div>
  </header>
  <div id="inicio" className="mx-auto max-w-7xl space-y-12 px-4 py-6 md:px-8 md:py-10">
   <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
    <article className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl border border-[#FFD200]/20 bg-[radial-gradient(ellipse_at_80%_15%,rgba(255,210,0,.24),transparent_40%),linear-gradient(120deg,#202020,#090909_70%)] p-7 md:min-h-[390px] md:p-10">
     <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full border border-[#FFD200]/15"/><div className="relative max-w-2xl">
      <p className="text-xs font-black uppercase tracking-[.25em] text-[#FFD200]">Portal do aluno · {student?.full_name.split(" ")[0]||"Bem-vindo"}</p>
      <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Sua jornada.<br/><span className="text-[#FFD200]">Seu próximo nível.</span></h2>
      <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-300">Treine, descubra novas modalidades, acompanhe sua rotina e aproveite tudo o que a Escola de Lutas Rafael Mota oferece.</p>
      <a href="#modalidades" className="mt-7 inline-flex rounded-xl bg-[#FFD200] px-5 py-3 text-sm font-black text-black hover:bg-yellow-300">Conheça as modalidades</a>
     </div>
    </article>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
     {banners.slice(0,2).map((b,i)=><article key={b.id} className="relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(125deg,#242424,#101010)] p-6">
      {b.image_url&&<div className="absolute inset-0 bg-cover bg-center opacity-35" style={{backgroundImage:"linear-gradient(0deg,#090909 0%,transparent 100%),url("+b.image_url+")"}}/>}
      <div className="relative"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FFD200]">{i===0?"Destaque da academia":"Novas experiências"}</p><h3 className="mt-2 text-xl font-black">{b.title}</h3><p className="mt-2 text-sm text-neutral-400">{b.description}</p><a href={b.button_target||"#modalidades"} onClick={b.button_target==="#experimental"?(e)=>{e.preventDefault();setModalOpen(true);}:undefined} className="mt-4 inline-block text-xs font-bold text-[#FFD200]">{b.button_label||"Saiba mais"} →</a></div>
     </article>)}
    </div>
   </section>
   {error&&<p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">{error}</p>}
   {notice&&<p role="status" className="rounded-xl border border-[#FFD200]/20 bg-[#FFD200]/10 p-4 text-sm text-yellow-100">{notice}</p>}
   <section id="modalidades" className="scroll-mt-24">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black tracking-[.25em] text-[#FFD200]">DESCUBRA</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Nossas modalidades</h2><p className="mt-2 text-sm text-neutral-400">Explore outras práticas e encontre seu próximo desafio.</p></div><span className="text-xs text-neutral-500">Valores mensais de referência</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
     {modalities.map((m,i)=>{const active=m.name===ownModality;const amount=prices[m.name];return <article key={m.id} className={"overflow-hidden rounded-2xl border bg-[#111] "+(active?"border-[#FFD200]/50":"border-white/10")}>
      <div className={"flex h-32 items-end bg-[radial-gradient(ellipse_at_70%_10%,rgba(255,210,0,.2),transparent_50%),linear-gradient(135deg,#252525,#0c0c0c)] p-5"}><span className="text-xs font-black uppercase tracking-[.2em] text-[#FFD200]">{["01","02","03","04"][i%4]} / TREINAMENTO</span></div>
      <div className="p-5"><div className="flex items-start justify-between gap-2"><h3 className="text-xl font-black">{m.name}</h3>{active&&<span className="rounded-full bg-[#FFD200]/10 px-2 py-1 text-[10px] font-bold text-[#FFD200]">Sua modalidade</span>}</div><p className="mt-2 text-sm text-neutral-400">{active?"Você já faz parte desta modalidade. Continue evoluindo!":"Conheça a modalidade, consulte os horários e experimente uma aula."}</p><p className="mt-4 text-lg font-black">{amount?money(amount):"Consulte a administração"}<span className="text-xs font-normal text-neutral-500"> / mês</span></p>
       {!active&&<button onClick={()=>{setChosen(m.id);setModalOpen(true);}} className="mt-4 w-full rounded-xl border border-[#FFD200]/50 px-4 py-3 text-sm font-bold text-[#FFD200] hover:bg-[#FFD200] hover:text-black">Solicitar aula experimental</button>}
      </div>
     </article>})}
     {modalities.length===0&&!loading&&<p className="col-span-full rounded-xl border border-white/10 p-6 text-sm text-neutral-400">As modalidades ativas serão exibidas aqui assim que cadastradas pela administração.</p>}
    </div>
   </section>
   <section id="agenda" className="scroll-mt-24">
    <div className="mb-5"><p className="text-xs font-black tracking-[.25em] text-[#FFD200]">PROGRAME-SE</p><h2 className="mt-2 text-3xl font-black">Horários das aulas</h2><p className="mt-2 text-sm text-neutral-400">Consulte a grade disponível da academia.</p></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{slots.map(s=><article key={s.id} className="rounded-xl border border-white/10 bg-[#111] p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#FFD200]">{days[s.weekday]||"Aula"}</span><span className="text-xs text-neutral-500">{s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}</span></div><h3 className="mt-2 font-bold">{s.title}</h3><p className="mt-1 text-xs text-neutral-400">{s.modality_name}{s.location?" · "+s.location:""}</p></article>)}
     {slots.length===0&&<p className="rounded-xl border border-white/10 p-5 text-sm text-neutral-400">A grade de horários será exibida aqui quando publicada pela academia.</p>}</div>
   </section>
   <section id="minha-area" className="scroll-mt-24">
    <div className="mb-5"><p className="text-xs font-black tracking-[.25em] text-[#FFD200]">SUA CONTA</p><h2 className="mt-2 text-3xl font-black">Minha área</h2></div>
    <div className="grid gap-4 md:grid-cols-3">
     <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><p className="text-xs text-neutral-500">MINHA MODALIDADE</p><h3 className="mt-2 text-xl font-black">{student?.modalities?.[0]?.name||"A definir"}</h3><p className="mt-1 text-sm text-neutral-400">{student?.class_label||"Turma a definir"}</p></article>
     <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><p className="text-xs text-neutral-500">MENSALIDADE</p><h3 className="mt-2 text-xl font-black">{student?.monthly_fee==null?"—":money(Number(student.monthly_fee))}</h3><p className="mt-1 text-sm text-neutral-400">Em aberto: {money(pending)}</p></article>
     <article className="rounded-2xl border border-white/10 bg-[#111] p-5"><p className="text-xs text-neutral-500">SITUAÇÃO DA MATRÍCULA</p><h3 className="mt-2 text-xl font-black">{student?.enrollment_status==="active"?"Ativa":student?.enrollment_status==="pending"?"Pendente":"Verificar"}</h3><p className="mt-1 text-sm text-neutral-400">Pagamentos registrados: {money(paid)}</p></article>
    </div>
    <div className="mt-4 flex flex-wrap gap-3"></div>
   </section>
  </div>
  {modalOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true"><form onSubmit={submitTrial} className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
   <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#FFD200]">Nova experiência</p><h2 className="mt-2 text-2xl font-black">Aula experimental</h2><p className="mt-1 text-sm text-neutral-400">Escolha a modalidade que deseja conhecer.</p></div><button type="button" onClick={()=>setModalOpen(false)} className="rounded-lg border border-white/10 px-3 py-2 text-sm">Fechar</button></div>
   <label className="block text-sm font-semibold">Modalidade<select required value={chosen} onChange={e=>setChosen(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-white"><option value="">Selecione</option>{otherModalities.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
   <label className="block text-sm font-semibold">Data preferencial (opcional)<input type="date" min={new Date().toISOString().slice(0,10)} value={requestedDate} onChange={e=>setRequestedDate(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-white"/></label>
   <label className="block text-sm font-semibold">Observação (opcional)<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Conte qual período ou horário prefere..." className="mt-2 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-white"/></label>
   <p className="text-xs leading-5 text-neutral-500">Sua solicitação será enviada à administração. A aula só estará confirmada depois da aprovação da academia.</p>
   <button disabled={sending||!chosen} className="w-full rounded-xl bg-[#FFD200] px-4 py-3 font-black text-black disabled:opacity-50">{sending?"Enviando...":"Enviar solicitação"}</button>
  </form></div>}
 </main>;
}
