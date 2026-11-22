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
 const [formOpen,setFormOpen]=useState(false);
 const [fullName,setFullName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [confirmPassword,setConfirmPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [createdCredentials,setCreatedCredentials]=useState<{name:string;email:string;password:string}|null>(null);

 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const [t,c]=await Promise.all([
   db.from("profiles").select("id,full_name,created_at").eq("role","teacher").order("full_name"),
   db.from("classes").select("id,name,schedule,active,teacher_profile_id,modalities(name)").order("name")
  ]);
  if(t.error||c.error)setError((t.error||c.error)!.message);
  else{setTeachers(t.data??[]);setClasses((c.data??[]) as unknown as ClassRow[]);}
  setLoading(false);
 },[db]);
 useEffect(()=>{void load();},[load]);

 async function createTeacher(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setNotice("");
  if(password.length<10){setError("A senha inicial precisa ter pelo menos 10 caracteres.");return;}
  if(password!==confirmPassword){setError("A confirmação da senha não corresponde.");return;}
  setBusy(true);
  try{
   const {data,error}=await db.functions.invoke("create-teacher",{body:{full_name:fullName.trim(),email:email.trim(),password}});
   if(error)throw error;
   if(data?.error)throw new Error(data.error);
   setCreatedCredentials({name:fullName.trim(),email:email.trim(),password});
   setFormOpen(false);setFullName("");setEmail("");setPassword("");setConfirmPassword("");
   setNotice("Conta de professor criada. Copie os dados de acesso e envie ao professor por um canal privado.");
   await load();
  }catch(err){setError(err instanceof Error?err.message:"Não foi possível criar a conta.");}
  finally{setBusy(false);}
 }

 async function assign(classId:string,teacherId:string){
  setSaving(classId);setError("");setNotice("");
  const {error}=await db.from("classes").update({teacher_profile_id:teacherId||null}).eq("id",classId);
  if(error)setError(error.message);
  else{setNotice("Responsável da turma atualizado.");await load();}
  setSaving(null);
 }
 async function copyCredentials(){
  if(!createdCredentials)return;
  await navigator.clipboard.writeText("Acesso à Escola de Lutas Rafael Mota\nNome: "+createdCredentials.name+"\nLogin: "+createdCredentials.email+"\nSenha inicial: "+createdCredentials.password+"\nNo primeiro acesso, será necessário criar uma nova senha.");
  setNotice("Dados de acesso copiados.");
 }
 function closeCredentials(){setCreatedCredentials(null);setNotice("");}
 const filtered=teachers.filter(t=>(t.full_name||"").toLowerCase().includes(query.toLowerCase()));
 const activeClasses=classes.filter(c=>c.active);
 const assigned=activeClasses.filter(c=>c.teacher_profile_id).length;
 const unassigned=activeClasses.length-assigned;

 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1">
  <header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5"><p className="text-sm text-neutral-400">Administração / Equipe</p><h1 className="text-xl font-semibold">Professores</h1></header>
  <div className="mx-auto max-w-[1200px] space-y-6 p-5 pb-24 md:p-8 lg:pb-8">
   <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-purple-300">Gestão de equipe</p><h2 className="mt-2 text-2xl font-semibold">Professores e responsabilidades</h2><p className="mt-1 max-w-2xl text-sm text-neutral-500">Crie os acessos dos professores e defina quem responde por cada turma.</p></div><button onClick={()=>{setFormOpen(true);setError("");setNotice("");}} className="rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold">＋ Cadastrar professor</button></div>
   {notice&&<p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
   {error&&<p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
   <div className="grid gap-3 sm:grid-cols-3">
    {[[ "Professores cadastrados",teachers.length],["Turmas ativas",activeClasses.length],["Turmas sem responsável",unassigned]].map(([label,value])=><article key={label} className="rounded-xl border border-white/10 bg-[#15151b] p-5"><p className="text-sm text-neutral-400">{label}</p><p className="mt-2 text-3xl font-semibold">{loading?"—":value}</p></article>)}
   </div>
   <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5"><div><h3 className="font-semibold">Equipe docente</h3><p className="mt-1 text-xs text-neutral-500">Contas com perfil de professor</p></div><input className={field+" max-w-xs"} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar professor..."/></div>
    {loading?<p className="p-6 text-sm text-neutral-400">Carregando equipe...</p>:filtered.length===0?<div className="p-7"><div className="mx-auto max-w-lg text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl text-purple-300">♟</div><h4 className="mt-4 font-semibold">{teachers.length===0?"Nenhum professor cadastrado":"Nenhum resultado encontrado"}</h4><p className="mt-2 text-sm leading-6 text-neutral-400">{teachers.length===0?"Cadastre o primeiro professor para liberar a distribuição de turmas.":"Tente outro nome ou limpe a busca."}</p></div></div>:<div className="divide-y divide-white/10">{filtered.map(t=>{const count=classes.filter(c=>c.teacher_profile_id===t.id&&c.active).length;return <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="font-medium">{t.full_name||"Professor sem nome"}</p><p className="mt-1 text-xs text-neutral-500">{count} turma(s) ativa(s) sob responsabilidade</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Acesso de professor</span></div>;})}</div>}
   </section>
   <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]">
    <div className="border-b border-white/10 p-5"><h3 className="font-semibold">Distribuição de turmas</h3><p className="mt-1 text-xs text-neutral-500">Atribua um professor responsável a cada turma ativa.</p></div>
    {loading?<p className="p-6 text-sm text-neutral-400">Carregando turmas...</p>:activeClasses.length===0?<p className="p-6 text-sm text-neutral-400">Nenhuma turma ativa cadastrada.</p>:<div className="divide-y divide-white/10">{activeClasses.map(c=><div key={c.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_minmax(220px,340px)] sm:items-center"><div><p className="font-medium">{c.name}</p><p className="mt-1 text-xs text-neutral-500">{c.modalities?.name||"Sem modalidade"} · {c.schedule||"Horário não definido"}</p></div><select aria-label={"Professor responsável pela turma "+c.name} className={field} value={c.teacher_profile_id||""} disabled={saving===c.id||teachers.length===0} onChange={e=>void assign(c.id,e.target.value)}><option value="">Sem professor responsável</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.full_name||"Professor sem nome"}</option>)}</select></div>)}</div>}
    {teachers.length===0&&!loading&&<p className="border-t border-white/10 px-4 py-3 text-xs text-amber-300">Cadastre os professores antes de atribuir responsáveis às turmas.</p>}
   </section>
   <p className="text-xs leading-5 text-neutral-500">No primeiro acesso, o professor será obrigado a trocar a senha inicial. As permissões de alunos e dados financeiros continuam restritas ao perfil docente.</p>
  </div>
 </section></div>
 {formOpen&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3"><form onSubmit={createTeacher} className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#17171d] p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-purple-300">Acesso à equipe</p><h2 className="mt-2 text-xl font-semibold">Cadastrar professor</h2><p className="mt-1 text-sm text-neutral-400">Você define o login e a senha inicial. O professor deverá criar uma nova senha no primeiro acesso.</p></div><button type="button" onClick={()=>setFormOpen(false)} className="text-2xl text-neutral-400">×</button></div><label className="block text-xs text-neutral-400">Nome completo<input required maxLength={120} value={fullName} onChange={e=>setFullName(e.target.value)} className={field+" mt-2"} placeholder="Nome do professor"/></label><label className="block text-xs text-neutral-400">E-mail (login)<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className={field+" mt-2"} placeholder="professor@exemplo.com"/></label><label className="block text-xs text-neutral-400">Senha inicial<input required type="password" minLength={10} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className={field+" mt-2"} placeholder="Mínimo de 10 caracteres"/></label><label className="block text-xs text-neutral-400">Confirmar senha inicial<input required type="password" minLength={10} autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={field+" mt-2"} placeholder="Repita a senha inicial"/></label><p className="text-xs leading-5 text-neutral-500">A senha será usada apenas na criação da conta. O sistema exigirá a troca antes de liberar qualquer outra área.</p><div className="flex justify-end gap-3 border-t border-white/10 pt-4"><button type="button" onClick={()=>setFormOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm">Cancelar</button><button disabled={busy} className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-semibold disabled:opacity-50">{busy?"Criando acesso...":"Criar acesso"}</button></div></form></div>}
 {createdCredentials&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3"><section className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#17171d] p-6"><p className="text-xs uppercase tracking-widest text-emerald-300">Conta criada</p><h2 className="text-xl font-semibold">Acesso pronto para compartilhar</h2><p className="text-sm text-neutral-400">Envie estes dados diretamente ao professor. A senha inicial será substituída no primeiro acesso.</p><div className="space-y-3 rounded-xl bg-[#0d0d11] p-4 text-sm"><p><span className="text-neutral-500">Professor</span><br/>{createdCredentials.name}</p><p><span className="text-neutral-500">Login</span><br/>{createdCredentials.email}</p><p><span className="text-neutral-500">Senha inicial</span><br/><span className="break-all font-mono">{createdCredentials.password}</span></p></div><div className="flex flex-wrap justify-end gap-3"><button onClick={closeCredentials} className="rounded-lg border border-white/10 px-4 py-2 text-sm">Fechar</button><button onClick={()=>void copyCredentials()} className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-semibold">Copiar dados de acesso</button></div></section></div>}
 </main>;
}
