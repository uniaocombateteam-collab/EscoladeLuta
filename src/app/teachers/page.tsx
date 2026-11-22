"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import Sidebar from "@/components/Sidebar";
import {createClient} from "@/lib/supabase/client";

type Teacher={id:string;full_name:string|null;created_at:string};
type ClassRow={id:string;name:string;schedule:string|null;active:boolean;teacher_profile_id:string|null;modalities:{name:string}|null};
const field="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none focus:border-purple-500";

export default function TeachersPage(){
 const db=useMemo(()=>createClient(),[]);
 const [teachers,setTeachers]=useState<Teacher[]>([]);
 const [classes,setClasses]=useState<ClassRow[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState<string|null>(null);
 const [query,setQuery]=useState("");
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");

 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const [t,c]=await Promise.all([
   db.from("profiles").select("id,full_name,created_at").eq("role","teacher").order("full_name"),
   db.from("classes").select("id,name,schedule,active,teacher_profile_id,modalities(name)").order("name")
  ]);
  if(t.error||c.error){setError((t.error||c.error)!.message);}
  else{setTeachers(t.data??[]);setClasses((c.data??[]) as unknown as ClassRow[]);}
  setLoading(false);
 },[db]);
 useEffect(()=>{void load();},[load]);

 async function assign(classId:string,teacherId:string){
  setSaving(classId);setError("");setNotice("");
  const {error}=await db.from("classes").update({teacher_profile_id:teacherId||null}).eq("id",classId);
  if(error)setError(error.message);
  else{setNotice("Responsável da turma atualizado.");await load();}
  setSaving(null);
 }
 const filtered=teachers.filter(t=>(t.full_name||"").toLowerCase().includes(query.toLowerCase()));
 const activeClasses=classes.filter(c=>c.active);
 const assigned=activeClasses.filter(c=>c.teacher_profile_id).length;
 const unassigned=activeClasses.length-assigned;

 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1">
  <header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5"><p className="text-sm text-neutral-400">Administração / Equipe</p><h1 className="text-xl font-semibold">Professores</h1></header>
  <div className="mx-auto max-w-[1200px] space-y-6 p-5 pb-24 md:p-8 lg:pb-8">
   <div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Gestão de equipe</p><h2 className="mt-2 text-2xl font-semibold">Professores e responsabilidades</h2><p className="mt-1 max-w-2xl text-sm text-neutral-500">Consulte os professores com acesso ao sistema e defina quem responde por cada turma.</p></div>
   {notice&&<p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
   {error&&<p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
   <div className="grid gap-3 sm:grid-cols-3">
    {[["Professores cadastrados",teachers.length],["Turmas ativas",activeClasses.length],["Turmas sem responsável",unassigned]].map(([label,value])=><article key={label} className="rounded-xl border border-white/10 bg-[#15151b] p-5"><p className="text-sm text-neutral-400">{label}</p><p className="mt-2 text-3xl font-semibold">{loading?"—":value}</p></article>)}
   </div>
   <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5"><div><h3 className="font-semibold">Equipe docente</h3><p className="mt-1 text-xs text-neutral-500">Contas com perfil de professor</p></div><input className={field+" max-w-xs"} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar professor..."/></div>
    {loading?<p className="p-6 text-sm text-neutral-400">Carregando equipe...</p>:filtered.length===0?<div className="p-7">
      <div className="mx-auto max-w-lg text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl text-purple-300">♟</div><h4 className="mt-4 font-semibold">{teachers.length===0?"Nenhum professor com acesso cadastrado":"Nenhum resultado encontrado"}</h4><p className="mt-2 text-sm leading-6 text-neutral-400">{teachers.length===0?"Quando uma conta for criada e receber o perfil de professor, ela aparecerá automaticamente aqui. A criação de contas será conectada a um fluxo seguro de convite por e-mail; não é permitido transformar qualquer usuário em professor por este formulário.":"Tente outro nome ou limpe a busca."}</p></div>
     </div>:<div className="divide-y divide-white/10">{filtered.map(t=>{const count=classes.filter(c=>c.teacher_profile_id===t.id&&c.active).length;return <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="font-medium">{t.full_name||"Professor sem nome"}</p><p className="mt-1 text-xs text-neutral-500">{count} turma(s) ativa(s) sob responsabilidade</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Acesso de professor</span></div>;})}</div>}
   </section>
   <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]">
    <div className="border-b border-white/10 p-5"><h3 className="font-semibold">Distribuição de turmas</h3><p className="mt-1 text-xs text-neutral-500">Atribua um professor responsável a cada turma ativa.</p></div>
    {loading?<p className="p-6 text-sm text-neutral-400">Carregando turmas...</p>:activeClasses.length===0?<p className="p-6 text-sm text-neutral-400">Nenhuma turma ativa cadastrada.</p>:<div className="divide-y divide-white/10">{activeClasses.map(c=><div key={c.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_minmax(220px,340px)] sm:items-center"><div><p className="font-medium">{c.name}</p><p className="mt-1 text-xs text-neutral-500">{c.modalities?.name||"Sem modalidade"} · {c.schedule||"Horário não definido"}</p></div><select aria-label={"Professor responsável pela turma "+c.name} className={field} value={c.teacher_profile_id||""} disabled={saving===c.id||teachers.length===0} onChange={e=>void assign(c.id,e.target.value)}><option value="">Sem professor responsável</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.full_name||"Professor sem nome"}</option>)}</select></div>)}</div>}
    {teachers.length===0&&!loading&&<p className="border-t border-white/10 px-4 py-3 text-xs text-amber-300">Para atribuir responsáveis, primeiro é necessário criar as contas docentes pelo fluxo seguro de convite.</p>}
   </section>
   <p className="text-xs leading-5 text-neutral-500">As permissões de acesso aos alunos e às informações financeiras serão aplicadas no banco de dados, por meio de políticas de segurança (RLS), antes de liberar o portal do professor.</p>
  </div>
 </section></div></main>;
}
