"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {FormEvent,useCallback,useEffect,useMemo,useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Modality={id:string;name:string};
type ClassRow={id:string;name:string;schedule:string|null;modality_id:string|null;teacher_profile_id:string|null;modalities:{name:string}|null;profiles:{full_name:string|null}|null};
type Student={id:string;full_name:string;birth_date:string|null;phone:string|null;email:string|null;enrollment_date:string;enrollment_status:string;plan_name:string|null;monthly_fee:number|null;class_label:string|null;class_id:string|null;teacher_profile_id:string|null;modalities:{name:string}|null;student_guardians:{guardians:{full_name:string;phone:string}|null}[]};
const blank={full_name:"",birth_date:"",cpf:"",email:"",phone:"",address:"",guardian_name:"",guardian_phone:"",guardian_relationship:"",emergency_contact:"",modality_id:"",class_id:"",enrollment_date:new Date().toISOString().slice(0,10),enrollment_status:"active",plan_name:"Mensal",monthly_fee:"",due_day:"10"};
const input="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none focus:border-purple-500";

export default function StudentsPage(){
 const db=useMemo(()=>createClient(),[]);
 const [rows,setRows]=useState<Student[]>([]),[modalities,setModalities]=useState<Modality[]>([]),[classes,setClasses]=useState<ClassRow[]>([]);
 const [form,setForm]=useState(blank),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[query,setQuery]=useState("");
 const [error,setError]=useState(""),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const [s,m,c]=await Promise.all([
   db.from("students").select("id,full_name,birth_date,phone,email,enrollment_date,enrollment_status,plan_name,monthly_fee,class_label,class_id,teacher_profile_id,modalities(name),student_guardians(guardians(full_name,phone))").order("full_name"),
   db.from("modalities").select("id,name").eq("active",true).order("name"),
   db.from("classes").select("id,name,schedule,modality_id,teacher_profile_id,modalities(name),profiles(full_name)").eq("active",true).order("name")
  ]);
  const failure=s.error||m.error||c.error;
  if(failure){setError(failure.message);setRows([]);}
  else{setRows((s.data??[]) as unknown as Student[]);setModalities(m.data??[]);setClasses((c.data??[]) as unknown as ClassRow[]);}
  setLoading(false);
 },[db]);
 useEffect(()=>{void load();},[load]);
 const visible=rows.filter(s=>[s.full_name,s.modalities?.name??"",s.class_label??"",s.student_guardians?.[0]?.guardians?.full_name??""].join(" ").toLowerCase().includes(query.toLowerCase()));
 const availableClasses=classes.filter(c=>c.modality_id===form.modality_id);
 const selectedClass=classes.find(c=>c.id===form.class_id);
 const update=(k:keyof typeof blank,v:string)=>setForm(old=>({...old,[k]:v,...(k==="modality_id"?{class_id:""}:{})}));
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   const {error}=await db.rpc("admin_create_student",{payload:{...form,modality:modalities.find(m=>m.id===form.modality_id)?.name??"",class_name:selectedClass?.name??"",monthly_fee:form.monthly_fee||null,due_day:form.due_day||null}});
   if(error)throw error;
   setOpen(false);setForm(blank);setNotice("Aluno cadastrado e vinculado à estrutura existente.");await load();
  }catch(e){setError(e instanceof Error?e.message:"Falha ao gravar cadastro.");}
  finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1">
  <header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5"><p className="text-sm text-neutral-400">Administração / Cadastros</p><h1 className="text-xl font-semibold">Gestão de alunos</h1></header>
  <div className="mx-auto max-w-[1400px] space-y-5 p-5 pb-24 md:p-8 lg:pb-8">
   <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Base de alunos</p><h2 className="mt-2 text-2xl font-semibold">Cadastro e matrículas</h2><p className="mt-1 text-sm text-neutral-500">Cadastros vinculados às modalidades e turmas já cadastradas.</p></div><button onClick={()=>{setForm({...blank,enrollment_date:new Date().toISOString().slice(0,10)});setOpen(true);setError("");setNotice("");}} className="rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold">＋ Novo aluno</button></div>
   {notice&&<p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}{error&&<p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
   <div className="grid gap-3 sm:grid-cols-3">{[["Total",rows.length],["Ativos",rows.filter(s=>s.enrollment_status==="active").length],["Pendentes / inativos",rows.filter(s=>s.enrollment_status!=="active").length]].map(([k,v])=><article key={k} className="rounded-xl border border-white/10 bg-[#15151b] p-5"><p className="text-sm text-neutral-400">{k}</p><p className="mt-2 text-3xl">{loading?"—":v}</p></article>)}</div>
   <article className="overflow-hidden rounded-xl border border-white/10 bg-[#15151b]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4"><div><h3 className="font-semibold">Relação de alunos</h3><p className="mt-1 text-xs text-neutral-500">{visible.length} registro(s)</p></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar aluno, turma ou responsável..." className={input+" max-w-sm"}/></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/5 text-xs text-neutral-400"><tr>{["Aluno","Modalidade / turma","Responsável","Telefone","Plano","Situação"].map(k=><th key={k} className="px-4 py-3">{k}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{visible.map(s=><tr key={s.id}><td className="px-4 py-4"><Link href={`/students/${s.id}`} className="font-medium text-purple-300 hover:text-purple-200 hover:underline">{s.full_name}</Link><p className="mt-1 text-[11px] text-neutral-500">Abrir perfil →</p></td><td className="px-4 py-4">{s.modalities?.name??"—"}<p className="text-xs text-neutral-500">{s.class_label??"Turma a definir"}</p></td><td className="px-4 py-4">{s.student_guardians?.[0]?.guardians?.full_name??"—"}</td><td className="px-4 py-4">{s.phone||"—"}</td><td className="px-4 py-4">{s.plan_name??"—"}</td><td className="px-4 py-4"><span className={s.enrollment_status==="active"?"text-emerald-300":s.enrollment_status==="pending"?"text-amber-300":"text-neutral-400"}>{s.enrollment_status==="active"?"Ativo":s.enrollment_status==="pending"?"Pendente":"Inativo"}</span></td></tr>)}</tbody></table>
     {loading&&<p className="p-8 text-center text-sm text-neutral-500">Carregando...</p>}{!loading&&!visible.length&&<p className="p-8 text-center text-sm text-neutral-500">Nenhum aluno encontrado.</p>}
    </div>
   </article>
  </div></section></div>
  {open&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3"><form onSubmit={save} className="max-h-[94vh] w-full max-w-4xl space-y-6 overflow-y-auto rounded-2xl border border-white/10 bg-[#17171d] p-6">
   <div className="flex justify-between"><div><p className="text-xs uppercase tracking-widest text-purple-300">Matrícula</p><h2 className="mt-2 text-xl font-semibold">Cadastro completo do aluno</h2></div><button type="button" onClick={()=>setOpen(false)} className="text-2xl text-neutral-400">×</button></div>
   <section><h3 className="mb-3 font-semibold">Dados pessoais</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{([["full_name","Nome completo *","text"],["birth_date","Nascimento *","date"],["cpf","CPF","text"],["phone","Telefone *","tel"],["email","E-mail","email"],["address","Endereço","text"]] as const).map(([k,l,t])=><label key={k} className="text-xs text-neutral-400">{l}<input required={l.includes("*")} type={t} value={form[k]} onChange={e=>update(k,e.target.value)} className={input+" mt-2"}/></label>)}</div></section>
   <section><h3 className="mb-3 font-semibold">Responsável e emergência</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{([["guardian_name","Nome do responsável"],["guardian_phone","Telefone do responsável"],["guardian_relationship","Parentesco"],["emergency_contact","Contato de emergência"]] as const).map(([k,l])=><label key={k} className="text-xs text-neutral-400">{l}<input value={form[k]} onChange={e=>update(k,e.target.value)} className={input+" mt-2"}/></label>)}</div></section>
   <section><h3 className="mb-3 font-semibold">Vínculo esportivo</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <label className="text-xs text-neutral-400">Modalidade *<select required value={form.modality_id} onChange={e=>update("modality_id",e.target.value)} className={input+" mt-2"}><option value="">Selecione a modalidade</option>{modalities.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
    <label className="text-xs text-neutral-400">Turma<select value={form.class_id} onChange={e=>update("class_id",e.target.value)} disabled={!form.modality_id||availableClasses.length===0} className={input+" mt-2"}><option value="">Sem turma definida</option>{availableClasses.map(c=><option key={c.id} value={c.id}>{c.name}{c.schedule?" · "+c.schedule:""}</option>)}</select></label>
    <label className="text-xs text-neutral-400">Professor responsável<div className={input+" mt-2 min-h-[46px] text-neutral-300"}>{selectedClass?.profiles?.full_name??(selectedClass?"Professor a definir":"Definido pela turma selecionada")}</div></label>
    <label className="text-xs text-neutral-400">Data da matrícula<input type="date" value={form.enrollment_date} onChange={e=>update("enrollment_date",e.target.value)} className={input+" mt-2"}/></label>
    <label className="text-xs text-neutral-400">Situação<select value={form.enrollment_status} onChange={e=>update("enrollment_status",e.target.value)} className={input+" mt-2"}><option value="active">Ativo</option><option value="pending">Pendente</option><option value="inactive">Inativo</option></select></label>
   </div>{modalities.length===0&&<p className="mt-3 text-xs text-amber-300">Cadastre uma modalidade ativa antes de matricular alunos.</p>}{form.modality_id&&availableClasses.length===0&&<p className="mt-3 text-xs text-neutral-400">Não há turmas ativas para esta modalidade. O aluno poderá ficar sem turma definida.</p>}</section>
   <section><h3 className="mb-3 font-semibold">Plano e cobrança</h3><div className="grid gap-3 sm:grid-cols-3"><label className="text-xs text-neutral-400">Plano<select value={form.plan_name} onChange={e=>update("plan_name",e.target.value)} className={input+" mt-2"}>{["Mensal","Trimestral","Semestral","Anual","Experimental","Bolsa / Isento"].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs text-neutral-400">Valor contratado<input type="number" min="0" step="0.01" value={form.monthly_fee} onChange={e=>update("monthly_fee",e.target.value)} className={input+" mt-2"}/></label><label className="text-xs text-neutral-400">Dia de vencimento<select value={form.due_day} onChange={e=>update("due_day",e.target.value)} className={input+" mt-2"}>{Array.from({length:28},(_,i)=><option key={i+1}>{i+1}</option>)}</select></label></div><p className="mt-3 text-xs text-amber-300">O cadastro registra o valor contratado, mas não gera cobrança nem registra pagamento.</p></section>
   {error&&<p className="text-sm text-red-300">{error}</p>}<div className="flex justify-end gap-3 border-t border-white/10 pt-4"><button type="button" onClick={()=>setOpen(false)} className="rounded-lg border border-white/10 px-4 py-2">Cancelar</button><button disabled={busy||modalities.length===0} className="rounded-lg bg-purple-700 px-5 py-2 font-semibold disabled:opacity-50">{busy?"Salvando...":"Salvar no banco"}</button></div>
  </form></div>}
 </main>;
}
