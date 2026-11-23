"use client";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
export default function AccessSelector(){
 const db=useMemo(()=>createClient(),[]),router=useRouter();
 const [name,setName]=useState(""),[roles,setRoles]=useState<string[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let alive=true;(async()=>{
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError||!user){router.replace("/login");return;}
  const [p,r]=await Promise.all([db.from("profiles").select("full_name,role").eq("id",user.id).maybeSingle(),db.from("profile_roles").select("role").eq("profile_id",user.id)]);
  if(!alive)return;
  if(r.error){setError("Não foi possível carregar seus vínculos: "+r.error.message);setLoading(false);return;}
  const list=[...new Set((r.data??[]).map((x:any)=>String(x.role)))];
  if(list.length===0&&p.data?.role)list.push(String(p.data.role));
  setName(p.data?.full_name??"");setRoles(list);
  const isStudent=list.includes("student"),isGuardian=list.includes("guardian");
  if(isStudent&&!isGuardian){router.replace("/aluno");return;}
  if(isGuardian&&!isStudent){router.replace("/portal");return;}
  if(!isStudent&&!isGuardian){router.replace("/");return;}
  setLoading(false);
 })();return()=>{alive=false;};},[db,router]);
 async function logout(){await db.auth.signOut();router.replace("/login");router.refresh();}
 return <main className="flex min-h-screen items-center justify-center bg-[#050505] p-5 text-white"><section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#101010] p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FFD200]">Escola de Lutas Rafael Mota</p><h1 className="mt-3 text-2xl font-black">Escolha seu perfil</h1><p className="mt-2 text-sm text-neutral-400">Olá, {name.split(" ")[0]||"bem-vindo"}. Sua conta possui os dois vínculos.</p>{loading?<p className="mt-6 text-sm text-neutral-400">Identificando seus acessos...</p>:error?<p role="alert" className="mt-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>:<div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={()=>router.replace("/aluno")} className="rounded-xl border border-white/10 bg-[#181818] p-5 text-left hover:border-[#FFD200]"><span className="text-2xl">♙</span><span className="mt-3 block font-bold">Portal do Aluno</span><span className="mt-1 block text-xs text-neutral-400">Acesse sua matrícula e suas informações pessoais.</span></button><button onClick={()=>router.replace("/portal")} className="rounded-xl border border-white/10 bg-[#181818] p-5 text-left hover:border-[#FFD200]"><span className="text-2xl">♧</span><span className="mt-3 block font-bold">Portal do Responsável</span><span className="mt-1 block text-xs text-neutral-400">Acompanhe os alunos vinculados a você.</span></button></div>}<button onClick={logout} className="mt-6 text-xs text-neutral-400 hover:text-white">Sair da conta</button></section></main>;
}
