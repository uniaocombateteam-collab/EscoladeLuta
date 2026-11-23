"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Sidebar from "@/components/Sidebar";
import {createClient} from "@/lib/supabase/client";
type Person={id:string;full_name:string;email:string|null;profile_id:string|null};
const field="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none focus:border-[#FFD200]";
export default function AccessManagementPage(){
 const db=useMemo(()=>createClient(),[]);
 const [students,setStudents]=useState<Person[]>([]),[guardians,setGuardians]=useState<Person[]>([]);
 const [emails,setEmails]=useState<Record<string,string>>({}),[passwords,setPasswords]=useState<Record<string,string>>({}),[confirmations,setConfirmations]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data:{user}}=await db.auth.getUser();
  if(!user){setError("Entre novamente com uma conta administrativa.");setLoading(false);return;}
  const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(profile?.role!=="admin"){setError("Acesso restrito à administração.");setLoading(false);return;}
  const [s,g]=await Promise.all([db.from("students").select("id,full_name,email,profile_id").order("full_name"),db.from("guardians").select("id,full_name,email,profile_id").order("full_name")]);
  if(s.error||g.error)setError((s.error||g.error)?.message||"Falha ao carregar cadastros.");
  else{setStudents((s.data??[]) as Person[]);setGuardians((g.data??[]) as Person[]);}
  setLoading(false);
 },[db]);
 useEffect(()=>{void load();},[load]);
 async function createAccess(kind:"student"|"guardian",row:Person){
  const email=(emails[row.id]??row.email??"").trim(),password=passwords[row.id]??"",confirm=confirmations[row.id]??"";
  if(!email){setError("Informe o e-mail do usuário.");return;}
  if(password.length<10){setError("A senha inicial precisa ter pelo menos 10 caracteres.");return;}
  if(password!==confirm){setError("As senhas não correspondem.");return;}
  setBusy("create"+row.id);setError("");setNotice("");
  const {data,error:invokeError}=await db.functions.invoke("invite-portal-user",{body:{email,full_name:row.full_name,kind,record_id:row.id,password,confirm_password:confirm}});
  if(invokeError||data?.error)setError(data?.error||invokeError?.message||"Não foi possível criar o acesso.");
  else{setNotice(data?.message||"Acesso criado.");setPasswords(v=>({...v,[row.id]:""}));setConfirmations(v=>({...v,[row.id]:""}));await load();}
  setBusy("");
 }
 async function linkExisting(kind:"student"|"guardian",row:Person){
  const email=(emails[row.id]??row.email??"").trim();
  if(!email){setError("Informe o e-mail da conta existente.");return;}
  setBusy("link"+row.id);setError("");setNotice("");
  const {error:rpcError}=await db.rpc(kind==="student"?"admin_link_student_account":"admin_link_guardian_account",kind==="student"?{p_student_id:row.id,p_email:email}:{p_guardian_id:row.id,p_email:email});
  if(rpcError)setError(rpcError.message);else{setNotice("Conta existente vinculada com sucesso.");await load();}
  setBusy("");
 }
 function renderRows(kind:"student"|"guardian"){
  const rows=kind==="student"?students:guardians;
  return <div className="divide-y divide-white/10">{rows.map(row=><article key={row.id} className="space-y-3 p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">{row.full_name}</p><p className="mt-1 text-xs text-neutral-500">{row.email||"Sem e-mail cadastrado"}</p></div><span className={row.profile_id?"text-xs text-emerald-300":"text-xs text-amber-300"}>{row.profile_id?"Conta vinculada":"Sem acesso vinculado"}</span></div>
   {!row.profile_id&&<div className="grid gap-3 md:grid-cols-2"><label className="text-xs text-neutral-400">E-mail de acesso<input type="email" className={field+" mt-2"} placeholder="usuario@email.com" value={emails[row.id]??row.email??""} onChange={e=>setEmails(v=>({...v,[row.id]:e.target.value}))}/></label><label className="text-xs text-neutral-400">Senha inicial<input type="password" autoComplete="new-password" className={field+" mt-2"} placeholder="Mínimo de 10 caracteres" value={passwords[row.id]??""} onChange={e=>setPasswords(v=>({...v,[row.id]:e.target.value}))}/></label><label className="text-xs text-neutral-400 md:col-span-2">Confirmar senha inicial<input type="password" autoComplete="new-password" className={field+" mt-2"} placeholder="Digite a senha novamente" value={confirmations[row.id]??""} onChange={e=>setConfirmations(v=>({...v,[row.id]:e.target.value}))}/></label></div>}
   <div className="flex flex-wrap gap-2">{!row.profile_id&&<button disabled={busy==="create"+row.id} onClick={()=>void createAccess(kind,row)} className="rounded-lg bg-[#FFD200] px-4 py-3 text-sm font-bold text-black disabled:opacity-40">{busy==="create"+row.id?"Criando acesso...":"Criar acesso e definir senha"}</button>}<button disabled={busy==="link"+row.id} onClick={()=>void linkExisting(kind,row)} className="rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-neutral-200 disabled:opacity-50">{busy==="link"+row.id?"Vinculando...":row.profile_id?"Atualizar vínculo":"Vincular conta existente"}</button></div>
  </article>)}</div>;
 }
 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1"><header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5"><p className="text-sm text-neutral-400">Administração / Segurança</p><h1 className="text-xl font-semibold">Contas e acessos</h1></header><div className="mx-auto max-w-5xl space-y-5 p-5 pb-24 md:p-8 lg:pb-8">
  <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Autenticação e permissões</p><h2 className="mt-2 text-2xl font-bold">Criar acessos individuais</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Defina o e-mail e a senha inicial de cada aluno ou responsável. A conta será criada e vinculada automaticamente, sem depender de convite por e-mail. No primeiro login, o usuário deverá trocar a senha inicial por uma senha pessoal.</p></div>
  {notice&&<p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}{error&&<p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
  <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]"><div className="border-b border-white/10 p-4"><h3 className="font-semibold">Alunos</h3><p className="mt-1 text-xs text-neutral-500">{students.length} cadastro(s)</p></div>{loading?<p className="p-6 text-sm text-neutral-400">Carregando...</p>:students.length?renderRows("student"):<p className="p-6 text-sm text-neutral-400">Nenhum aluno cadastrado.</p>}</section>
  <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]"><div className="border-b border-white/10 p-4"><h3 className="font-semibold">Responsáveis</h3><p className="mt-1 text-xs text-neutral-500">{guardians.length} cadastro(s)</p></div>{loading?<p className="p-6 text-sm text-neutral-400">Carregando...</p>:guardians.length?renderRows("guardian"):<p className="p-6 text-sm text-neutral-400">Nenhum responsável cadastrado.</p>}</section>
  <div className="rounded-xl border border-white/10 bg-[#111116] p-4 text-xs leading-5 text-neutral-400"><p className="font-semibold text-neutral-200">Segurança</p><p className="mt-1">A senha é enviada diretamente ao Supabase Auth e não é gravada nas tabelas da academia. O administrador não poderá consultar a senha depois da criação. Para contas já existentes, use “Vincular conta existente”.</p></div>
 </div></section></div></main>;
}
