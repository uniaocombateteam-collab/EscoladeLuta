"use client";
import {FormEvent,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

export default function ChangePasswordPage(){
 const router=useRouter();
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");
  if(password.length<10){setError("A nova senha precisa ter pelo menos 10 caracteres.");return;}
  if(password!==confirm){setError("As senhas não correspondem.");return;}
  setBusy(true);
  const db=createClient();
  try{
   const {data,error:invokeError}=await db.functions.invoke("complete-password-change",{body:{password}});
   if(invokeError)throw invokeError;
   if(data?.error)throw new Error(data.error);
   await db.auth.signOut();
   router.replace("/login?password=updated");
   router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Não foi possível atualizar a senha.");}
  finally{setBusy(false);}
 }
 return <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-white"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#15151b] p-8"><div className="text-center"><p className="text-4xl font-black italic text-[#d6ad55]">RM</p><p className="mt-2 text-xs tracking-[.2em]">ESCOLA DE LUTAS RAFAEL MOTA</p></div><div><p className="text-xs uppercase tracking-widest text-purple-300">Primeiro acesso</p><h1 className="mt-2 text-2xl font-semibold">Crie sua nova senha</h1><p className="mt-2 text-sm leading-6 text-neutral-400">Por segurança, a senha inicial fornecida pela administração precisa ser substituída antes de continuar.</p></div><label className="block text-xs text-neutral-400">Nova senha<input required type="password" minLength={10} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#0d0d11] p-3 text-sm text-white" placeholder="Mínimo de 10 caracteres"/></label><label className="block text-xs text-neutral-400">Confirmar nova senha<input required type="password" minLength={10} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#0d0d11] p-3 text-sm text-white" placeholder="Repita a nova senha"/></label>{error&&<p role="alert" className="text-sm text-red-300">{error}</p>}<button disabled={busy} className="w-full rounded-lg bg-purple-700 p-3 text-sm font-semibold disabled:opacity-50">{busy?"Atualizando...":"Salvar nova senha"}</button></form></main>;
}