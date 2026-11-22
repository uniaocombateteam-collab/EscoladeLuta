"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Sidebar from "@/components/Sidebar";
import {createClient} from "@/lib/supabase/client";
type Student={id:string;full_name:string;email:string|null;profile_id:string|null};
type Guardian={id:string;full_name:string;email:string|null;profile_id:string|null};
const field="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none focus:border-[#FFD200]";
export default function AccessManagementPage(){
 const db=useMemo(()=>createClient(),[]);
 const [students,setStudents]=useState<Student[]>([]),[guardians,setGuardians]=useState<Guardian[]>([]);
 const [studentEmails,setStudentEmails]=useState<Record<string,string>>({}),[guardianEmails,setGuardianEmails]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data:{user}}=await db.auth.getUser();
  if(!user){setError("Entre novamente com uma conta administrativa.");setLoading(false);return;}
  const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(profile?.role!=="admin"){setError("Acesso restrito à administração.");setLoading(false);return;}
  const [s,g]=await Promise.all([
   db.from("students").select("id,full_name,email,profile_id").order("full_name"),
   db.from("guardians").select("id,full_name,email,profile_id").order("full_name")
  ]);
  if(s.error||g.error)setError((s.error||g.error)?.message||"Falha ao carregar cadastros.");
  else{setStudents((s.data??[]) as Student[]);setGuardians((g.data??[]) as Guardian[]);}
  setLoading(false);
 },[db]);
 useEffect(()=>{void load();},[load]);
 async function invite(kind:"student"|"guardian",row:Student|Guardian){
  const email=(kind==="student"?studentEmails[row.id]:guardianEmails[row.id])?.trim()||row.email?.trim()||"";
  if(!email){setError("Informe o e-mail para enviar o convite.");return;}
  setBusy("invite"+kind+row.id);setError("");setNotice("");
  const {data,error}=await db.functions.invoke("invite-portal-user",{body:{email,full_name:row.full_name,kind,record_id:row.id}});
  if(error||data?.error){setError(data?.error||error?.message||"Não foi possível enviar o convite.");}
  else{setNotice(data?.message||"Convite enviado.");await load();}
  setBusy("");
 }
 async function link(kind:"student"|"guardian",id:string){
  const email=(kind==="student"?studentEmails[id]:guardianEmails[id])?.trim();
  if(!email){setError("Informe o e-mail da conta que será vinculada.");return;}
  setBusy(kind+id);setError("");setNotice("");
  const {error}=await db.rpc(kind==="student"?"admin_link_student_account":"admin_link_guardian_account",kind==="student"?{p_student_id:id,p_email:email}:{p_guardian_id:id,p_email:email});
  if(error)setError(error.message);else{setNotice(kind==="student"?"Conta de aluno vinculada com sucesso.":"Conta de responsável vinculada com sucesso.");if(kind==="student")setStudentEmails(v=>({...v,[id]:""}));else setGuardianEmails(v=>({...v,[id]:""}));await load();}
  setBusy("");
 }
 const renderRows=(kind:"student"|"guardian")=>{
  const rows=kind==="student"?students:guardians;
  const values=kind==="student"?studentEmails:guardianEmails;
  const setter=kind==="student"?setStudentEmails:setGuardianEmails;
  return <div className="divide-y divide-white/10">{rows.map(row=><div key={row.id} className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto] md:items-center"><div><p className="font-semibold">{row.full_name}</p><p className="mt-1 text-xs text-neutral-500">{row.email||"Sem e-mail cadastrado"}</p><p className={row.profile_id?"mt-2 text-xs text-emerald-300":"mt-2 text-xs text-amber-300"}>{row.profile_id?"Conta vinculada":"Sem acesso vinculado"}</p></div><input type="email" className={field} placeholder="E-mail da conta existente" value={values[row.id]??row.email??""} onChange={e=>setter(v=>({...v,[row.id]:e.target.value}))}/><div className="flex flex-wrap gap-2"><button disabled={!!row.profile_id||busy==="invite"+kind+row.id} onClick={()=>void invite(kind,row)} className="rounded-lg bg-[#FFD200] px-4 py-3 text-sm font-bold text-black disabled:opacity-40">{busy==="invite"+kind+row.id?"Enviando...":"Convidar e vincular"}</button><button disabled={busy===kind+row.id} onClick={()=>void link(kind,row.id)} className="rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-neutral-200 disabled:opacity-50">{busy===kind+row.id?"Vinculando...":row.profile_id?"Atualizar vínculo":"Vincular conta existente"}</button></div></div>)}</div>;
 };
 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1"><header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5"><p className="text-sm text-neutral-400">Administração / Segurança</p><h1 className="text-xl font-semibold">Contas e acessos</h1></header><div className="mx-auto max-w-5xl space-y-5 p-5 pb-24 md:p-8 lg:pb-8"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Autenticação e permissões</p><h2 className="mt-2 text-2xl font-bold">Vincular contas individuais</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Você pode enviar um convite para criar a conta e vinculá-la automaticamente, ou associar um cadastro a uma conta que já existe. O usuário receberá um e-mail para definir a própria senha.</p></div>{notice&&<p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}{error&&<p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]"><div className="border-b border-white/10 p-4"><h3 className="font-semibold">Alunos</h3><p className="mt-1 text-xs text-neutral-500">{students.length} cadastro(s)</p></div>{loading?<p className="p-6 text-sm text-neutral-400">Carregando...</p>:students.length?renderRows("student"):<p className="p-6 text-sm text-neutral-400">Nenhum aluno cadastrado.</p>}</section><section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]"><div className="border-b border-white/10 p-4"><h3 className="font-semibold">Responsáveis</h3><p className="mt-1 text-xs text-neutral-500">{guardians.length} cadastro(s)</p></div>{loading?<p className="p-6 text-sm text-neutral-400">Carregando...</p>:guardians.length?renderRows("guardian"):<p className="p-6 text-sm text-neutral-400">Nenhum responsável cadastrado.</p>}</section><p className="text-xs leading-5 text-neutral-500">O convite cria a conta no Auth, atribui o perfil e vincula o cadastro. O usuário define a própria senha pelo link recebido. Para contas já existentes, use a opção de vínculo. Um mesmo usuário pode ter os dois vínculos.</p></div></section></div></main>;
}
