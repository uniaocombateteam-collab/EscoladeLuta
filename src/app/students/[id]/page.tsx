"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {useCallback,useEffect,useMemo,useState,FormEvent} from "react";
import {useParams} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

type Student={
 id:string;full_name:string;birth_date:string|null;phone:string|null;email:string|null;
 enrollment_date:string|null;enrollment_status:string|null;plan_name:string|null;
 monthly_fee:number|null;class_label:string|null;
 modalities:{name:string}|null;
 student_guardians:{guardians:{full_name:string;phone:string|null}|null}[];
};
const field="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none focus:border-purple-500";
const label="mb-1 block text-xs text-neutral-400";
export default function StudentProfilePage(){
 const params=useParams<{id:string}>(); const id=params.id;
 const supabase=useMemo(()=>createClient(),[]);
 const [student,setStudent]=useState<Student|null>(null);
 const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 const [editing,setEditing]=useState(false); const [saving,setSaving]=useState(false); const [notice,setNotice]=useState("");
 const [form,setForm]=useState({full_name:"",birth_date:"",phone:"",email:"",enrollment_date:"",enrollment_status:"active",plan_name:"",monthly_fee:"",class_label:""});
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data,error}=await supabase.from("students").select("id,full_name,birth_date,phone,email,enrollment_date,enrollment_status,plan_name,monthly_fee,class_label,modalities(name),student_guardians(guardians(full_name,phone))").eq("id",id).single();
  if(error){setError(error.message);setStudent(null);}
  else {const s=data as unknown as Student;setStudent(s);setForm({full_name:s.full_name??"",birth_date:s.birth_date??"",phone:s.phone??"",email:s.email??"",enrollment_date:s.enrollment_date??"",enrollment_status:s.enrollment_status??"active",plan_name:s.plan_name??"",monthly_fee:s.monthly_fee==null?"":String(s.monthly_fee),class_label:s.class_label??""});}
  setLoading(false);
 },[supabase,id]);
 useEffect(()=>{void load();},[load]);
 function change(k:keyof typeof form,v:string){setForm(old=>({...old,[k]:v}));}
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setError("");setNotice("");
  const {error}=await supabase.from("students").update({full_name:form.full_name,birth_date:form.birth_date||null,phone:form.phone,email:form.email||null,enrollment_date:form.enrollment_date||null,enrollment_status:form.enrollment_status,plan_name:form.plan_name||null,monthly_fee:form.monthly_fee===""?null:Number(form.monthly_fee),class_label:form.class_label||null}).eq("id",id);
  if(error)setError(error.message);else{setEditing(false);setNotice("Dados atualizados com sucesso.");await load();}
  setSaving(false);
 }
 const status=student?.enrollment_status==="active"?"Ativo":student?.enrollment_status==="pending"?"Pendente":"Inativo";
 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1">
 <header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5"><p className="text-sm text-neutral-400">Administração / Alunos / Perfil</p><h1 className="text-xl font-semibold">Ficha do aluno</h1></header>
 <div className="mx-auto max-w-[1200px] space-y-5 p-5 pb-24 md:p-8 lg:pb-8">
 <Link href="/students" className="text-sm text-purple-300 hover:underline">← Voltar para alunos</Link>
 {loading?<p className="py-12 text-center text-neutral-400">Carregando perfil...</p>:error?<p role="alert" className="rounded-lg bg-red-500/10 p-4 text-sm text-red-300">Não foi possível carregar o aluno: {error}</p>:student&&<>
 <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#15151b] p-6">
  <div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Perfil cadastral</p><h2 className="mt-2 text-2xl font-semibold">{student.full_name}</h2><p className="mt-1 text-sm text-neutral-400">{student.modalities?.name??"Modalidade não informada"} · {student.class_label??"Turma a definir"}</p></div>
  <div className="flex items-center gap-3"><span className="rounded-full border border-white/10 px-3 py-1 text-xs">{status}</span><button onClick={()=>{setNotice("");setEditing(v=>!v);}} className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold">{editing?"Cancelar edição":"Editar cadastro"}</button></div>
 </div>
 {notice&&<p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
 {editing?<form onSubmit={save} className="space-y-5 rounded-xl border border-white/10 bg-[#15151b] p-5">
  <h3 className="font-semibold">Editar dados cadastrais</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {([["full_name","Nome completo","text"],["birth_date","Data de nascimento","date"],["phone","Telefone","tel"],["email","E-mail","email"],["enrollment_date","Data da matrícula","date"],["class_label","Turma / horário","text"],["plan_name","Plano contratado","text"],["monthly_fee","Valor contratado","number"]] as const).map(([k,l,t])=><label key={k}><span className={label}>{l}</span><input className={field} type={t} min={t==="number"?"0":undefined} step={t==="number"?"0.01":undefined} value={form[k]} onChange={e=>change(k,e.target.value)} required={k==="full_name"}/></label>)}
  <label><span className={label}>Situação da matrícula</span><select className={field} value={form.enrollment_status} onChange={e=>change("enrollment_status",e.target.value)}><option value="active">Ativo</option><option value="pending">Pendente</option><option value="inactive">Inativo</option></select></label>
  </div><div className="flex justify-end gap-3 border-t border-white/10 pt-4"><button type="button" onClick={()=>setEditing(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm">Cancelar</button><button disabled={saving} className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-semibold disabled:opacity-50">{saving?"Salvando...":"Salvar alterações"}</button></div>
 </form>:<>
  <div className="grid gap-4 md:grid-cols-2">
   <article className="rounded-xl border border-white/10 bg-[#15151b] p-5"><h3 className="mb-4 font-semibold">Dados pessoais</h3><dl className="space-y-3 text-sm"><div><dt className={label}>Nome completo</dt><dd>{student.full_name}</dd></div><div><dt className={label}>Nascimento</dt><dd>{student.birth_date?new Date(student.birth_date+"T12:00:00").toLocaleDateString("pt-BR"):"Não informado"}</dd></div><div><dt className={label}>Telefone</dt><dd>{student.phone||"Não informado"}</dd></div><div><dt className={label}>E-mail</dt><dd>{student.email||"Não informado"}</dd></div></dl></article>
   <article className="rounded-xl border border-white/10 bg-[#15151b] p-5"><h3 className="mb-4 font-semibold">Responsáveis</h3>{student.student_guardians?.length?student.student_guardians.map((x,i)=><div key={i} className="mb-3 text-sm"><p>{x.guardians?.full_name??"Nome não informado"}</p><p className="text-neutral-400">{x.guardians?.phone??"Telefone não informado"}</p></div>):<p className="text-sm text-neutral-500">Nenhum responsável vinculado.</p>}</article>
   <article className="rounded-xl border border-white/10 bg-[#15151b] p-5"><h3 className="mb-4 font-semibold">Vínculo esportivo</h3><dl className="space-y-3 text-sm"><div><dt className={label}>Modalidade</dt><dd>{student.modalities?.name??"Não informada"}</dd></div><div><dt className={label}>Turma</dt><dd>{student.class_label??"A definir"}</dd></div><div><dt className={label}>Data da matrícula</dt><dd>{student.enrollment_date?new Date(student.enrollment_date+"T12:00:00").toLocaleDateString("pt-BR"):"Não informada"}</dd></div><div><dt className={label}>Situação</dt><dd>{status}</dd></div></dl></article>
   <article className="rounded-xl border border-white/10 bg-[#15151b] p-5"><h3 className="mb-4 font-semibold">Plano contratado</h3><dl className="space-y-3 text-sm"><div><dt className={label}>Plano</dt><dd>{student.plan_name??"Não informado"}</dd></div><div><dt className={label}>Valor</dt><dd>{student.monthly_fee==null?"Não informado":student.monthly_fee.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</dd></div><p className="pt-2 text-xs text-amber-300">Este perfil exibe o valor contratado; cobranças e pagamentos serão tratados no módulo Financeiro.</p></dl></article>
  </div>
 </>}
 </div></section></div></main>;
}
