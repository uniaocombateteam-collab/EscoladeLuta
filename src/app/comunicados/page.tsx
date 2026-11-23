"use client";
import {FormEvent,useCallback,useEffect,useMemo,useState} from "react";
import Sidebar from "@/components/Sidebar";
import {createClient} from "@/lib/supabase/client";

type Role="admin"|"teacher"|"guardian"|"student";
type Notice={id:string;title:string;content:string;category:string;priority:"normal"|"important"|"urgent";target_roles:Role[];status:"draft"|"published"|"archived";pinned:boolean;publish_at:string|null;expires_at:string|null;created_by:string;created_at:string};
type ReadRow={announcement_id:string;profile_id:string;read_at:string};
type Attachment={id:string;file_name:string;file_path:string;mime_type:string};
const input="w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm text-white outline-none focus:border-[#FFD200]";
const categories=["Todas","Geral","Administrativo","Treinamento","Eventos","Urgente","Professores"];
const roles:Role[]=["admin","teacher","guardian","student"];
const roleName:Record<Role,string>={admin:"Administração",teacher:"Professores",guardian:"Responsáveis",student:"Alunos"};
const priorityName={normal:"Normal",important:"Importante",urgent:"Urgente"};
const emptyForm={title:"",content:"",category:"Geral",priority:"normal" as "normal"|"important"|"urgent",target_roles:["admin","teacher","guardian","student"] as Role[],pinned:false,expires_at:""};
export default function ComunicadosPage(){
 const db=useMemo(()=>createClient(),[]);
 const [role,setRole]=useState<Role|null>(null),[userId,setUserId]=useState("");
 const [rows,setRows]=useState<Notice[]>([]),[reads,setReads]=useState<ReadRow[]>([]),[readIds,setReadIds]=useState<string[]>([]);
 const [tab,setTab]=useState<"mural"|"todos"|"gerenciar"|"leituras">("mural"),[category,setCategory]=useState("Todas"),[search,setSearch]=useState("");
 const [selected,setSelected]=useState<Notice|null>(null),[editing,setEditing]=useState(false),[form,setForm]=useState(emptyForm);
 const [files,setFiles]=useState<File[]>([]),[attachments,setAttachments]=useState<Attachment[]>([]),[signedFiles,setSignedFiles]=useState<{name:string;url:string;type:string}[]>([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user){setError("Sessão não identificada. Entre novamente.");setLoading(false);return;}
  setUserId(user.id);
  const profile=await db.from("profiles").select("role").eq("id",user.id).single();
  if(profile.error){setError(profile.error.message);setLoading(false);return;}
  const currentRole=profile.data.role as Role;setRole(currentRole);
  const notices=await db.from("academy_announcements").select("*").order("pinned",{ascending:false}).order("publish_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false});
  if(notices.error){setError(notices.error.message);setLoading(false);return;}
  const ids=(notices.data??[]).map((x:Notice)=>x.id);
  const [myReads,allReads]=await Promise.all([
   db.from("academy_announcement_reads").select("announcement_id").eq("profile_id",user.id),
   currentRole==="admin"&&ids.length?db.from("academy_announcement_reads").select("announcement_id,profile_id,read_at").in("announcement_id",ids):Promise.resolve({data:[],error:null})
  ]);
  if(myReads.error||allReads.error){setError((myReads.error||allReads.error)?.message||"Erro ao carregar leituras.");}
  setRows((notices.data??[]) as Notice[]);setReadIds((myReads.data??[]).map((x:{announcement_id:string})=>x.announcement_id));setReads((allReads.data??[]) as ReadRow[]);
  setLoading(false);
 },[db]);
 useEffect(()=>{void load();},[load]);
 const isAdmin=role==="admin";
 const visible=rows.filter(n=>n.status==="published"&&(n.publish_at===null||new Date(n.publish_at)<=new Date())&&(n.expires_at===null||new Date(n.expires_at)>new Date()));
 const filtered=visible.filter(n=>(category==="Todas"||n.category===category)&&(!search||[n.title,n.content,n.category].join(" ").toLowerCase().includes(search.toLowerCase())));
 const unread=visible.filter(n=>!readIds.includes(n.id));
 async function openNotice(n:Notice){
  setSelected(n);
  if(!readIds.includes(n.id)){
   const {error}=await db.from("academy_announcement_reads").upsert({announcement_id:n.id,profile_id:userId},{onConflict:"announcement_id,profile_id",ignoreDuplicates:true});
   if(!error)setReadIds(prev=>[...prev,n.id]);
  }
 }
 function startNew(){setForm(emptyForm);setFiles([]);setSelected(null);setEditing(true);setTab("gerenciar");}
 function startEdit(n:Notice){setForm({title:n.title,content:n.content,category:n.category,priority:n.priority,target_roles:n.target_roles,pinned:n.pinned,expires_at:n.expires_at?new Date(n.expires_at).toISOString().slice(0,16):""});setSelected(n);setEditing(true);}
 async function save(status:"draft"|"published",e?:FormEvent){
  e?.preventDefault();setBusy(true);setError("");setMessage("");
  if(!form.target_roles.length){setError("Selecione ao menos um público.");setBusy(false);return;}
  if(files.some(file=>file.size>10*1024*1024)){setError("Cada anexo deve ter no máximo 10 MB.");setBusy(false);return;}
  const payload={title:form.title.trim(),content:form.content.trim(),category:form.category,priority:form.priority,target_roles:form.target_roles,pinned:form.pinned,status,publish_at:status==="published"?new Date().toISOString():null,expires_at:form.expires_at?new Date(form.expires_at).toISOString():null,created_by:userId,updated_at:new Date().toISOString()};
  const result=selected?await db.from("academy_announcements").update(payload).eq("id",selected.id).select("id").single():await db.from("academy_announcements").insert(payload).select("id").single();
  if(result.error){setError(result.error.message);setBusy(false);return;}
  const announcementId=result.data.id as string;
  for(const file of files){
   const safeName=file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g,"_");
   const path=announcementId+"/"+crypto.randomUUID()+"-"+safeName;
   const upload=await db.storage.from("academy-announcements").upload(path,file,{contentType:file.type,upsert:false});
   if(upload.error){setError("O comunicado foi salvo, mas um anexo falhou: "+upload.error.message);setBusy(false);return;}
   const meta=await db.from("academy_announcement_attachments").insert({announcement_id:announcementId,file_name:file.name,file_path:path,mime_type:file.type,file_size:file.size,uploaded_by:userId});
   if(meta.error){setError("Arquivo enviado, mas não foi possível registrar o anexo: "+meta.error.message);setBusy(false);return;}
  }
  setMessage(status==="published"?"Comunicado publicado.":"Rascunho salvo.");setEditing(false);setSelected(null);setFiles([]);await load();
  setBusy(false);
 }
 async function changeStatus(n:Notice,status:"published"|"archived"){
  setBusy(true);const {error}=await db.from("academy_announcements").update({status,publish_at:status==="published"?(n.publish_at||new Date().toISOString()):n.publish_at,updated_at:new Date().toISOString()}).eq("id",n.id);
  if(error)setError(error.message);else{setMessage(status==="archived"?"Comunicado arquivado.":"Comunicado publicado.");await load();}
  setBusy(false);
 }
 const tabs:Array<[typeof tab,string]>=[["mural","Mural"],["todos","Todos os comunicados"]];
 if(isAdmin)tabs.push(["gerenciar","Gerenciar"],["leituras","Leituras"]);
 return <main className="min-h-screen bg-[#050505] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1">
  <header className="border-b border-white/10 bg-black px-5 py-5"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#FFD200]">Comunicação interna</p><div className="flex items-center justify-between gap-3"><h1 className="mt-1 text-2xl font-black">Comunicados</h1><span className="rounded-full border border-[#FFD200]/30 bg-[#FFD200]/10 px-3 py-1 text-xs font-bold text-[#FFD200]">{unread.length} não lido(s)</span></div><p className="mt-1 text-sm text-neutral-400">Informações oficiais, avisos e atualizações da academia.</p></header>
  <div className="mx-auto max-w-6xl space-y-5 p-4 pb-24 md:p-7">
   {message&&<p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}{error&&<p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
   <div className="grid grid-cols-2 gap-3 md:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-[#101010] p-4"><p className="text-xs text-neutral-400">Publicados</p><p className="mt-1 text-2xl font-black">{visible.length}</p></div><div className="rounded-2xl border border-white/10 bg-[#101010] p-4"><p className="text-xs text-neutral-400">Não lidos</p><p className="mt-1 text-2xl font-black text-[#FFD200]">{unread.length}</p></div><div className="col-span-2 rounded-2xl border border-white/10 bg-[#101010] p-4 md:col-span-1"><p className="text-xs text-neutral-400">Avisos importantes</p><p className="mt-1 text-2xl font-black">{visible.filter(n=>n.priority!=="normal").length}</p></div></div>
   <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-2">{tabs.map(([id,label])=><button key={id} onClick={()=>{setTab(id);setEditing(false);setSelected(null);}} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${tab===id?"bg-[#FFD200] text-black":"bg-white/5 text-neutral-300 hover:bg-white/10"}`}>{label}</button>)}</div>
   {loading?<p className="py-12 text-center text-sm text-neutral-400">Carregando comunicados...</p>:<>
    {(tab==="mural"||tab==="todos")&&<div className="space-y-4">
     {tab==="mural"&&visible.some(n=>n.pinned)&&<div><p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#FFD200]">Em destaque</p>{visible.filter(n=>n.pinned).slice(0,1).map(n=><button key={n.id} onClick={()=>void openNotice(n)} className="w-full rounded-2xl border border-[#FFD200]/30 bg-gradient-to-br from-[#211c00] to-[#101010] p-5 text-left"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#FFD200] px-2.5 py-1 text-[10px] font-black uppercase text-black">Fixado</span><span className="text-xs text-neutral-400">{n.category}</span></div><h2 className="mt-3 text-xl font-black">{n.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-300">{n.content}</p><p className="mt-4 text-xs font-bold text-[#FFD200]">Abrir comunicado →</p></button>)}</div>}
     <div className="flex flex-col gap-3 sm:flex-row"><input className={input+" flex-1"} placeholder="Buscar comunicado..." value={search} onChange={e=>setSearch(e.target.value)}/><select className={input+" sm:max-w-56"} value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
     <div className="space-y-3">{filtered.filter(n=>tab==="todos"||!n.pinned).map(n=><button key={n.id} onClick={()=>void openNotice(n)} className="w-full rounded-2xl border border-white/10 bg-[#101010] p-4 text-left transition hover:border-white/25"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase tracking-wide text-[#FFD200]">{n.category}</span>{n.priority!=="normal"&&<span className={`rounded-full px-2 py-1 text-[10px] font-bold ${n.priority==="urgent"?"bg-red-500/15 text-red-300":"bg-amber-500/15 text-amber-200"}`}>{priorityName[n.priority]}</span>}{!readIds.includes(n.id)&&<span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white">Novo</span>}<span className="ml-auto text-xs text-neutral-500">{new Date(n.publish_at||n.created_at).toLocaleDateString("pt-BR")}</span></div><h3 className="mt-2 font-bold">{n.title}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-400">{n.content}</p></button>)}{filtered.length===0&&<div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-neutral-500">Nenhum comunicado encontrado.</div>}</div>
    </div>}
    {tab==="gerenciar"&&isAdmin&&<div className="space-y-4">
     {!editing?<><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Painel de publicação</h2><p className="text-sm text-neutral-400">Crie, edite e organize os avisos oficiais.</p></div><button onClick={startNew} className="rounded-xl bg-[#FFD200] px-4 py-3 text-sm font-black text-black">+ Novo comunicado</button></div>
      <div className="space-y-3">{rows.map(n=><div key={n.id} className="rounded-2xl border border-white/10 bg-[#101010] p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-xs text-[#FFD200]">{n.category}</span><span className="rounded-full bg-white/10 px-2 py-1 text-[10px]">{n.status==="published"?"Publicado":n.status==="draft"?"Rascunho":"Arquivado"}</span><span className="ml-auto text-xs text-neutral-500">{new Date(n.created_at).toLocaleDateString("pt-BR")}</span></div><h3 className="mt-2 font-bold">{n.title}</h3><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>startEdit(n)} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Editar</button>{n.status!=="published"&&<button disabled={busy} onClick={()=>void changeStatus(n,"published")} className="rounded-lg bg-[#FFD200] px-3 py-2 text-xs font-bold text-black">Publicar</button>}{n.status==="published"&&<button disabled={busy} onClick={()=>void changeStatus(n,"archived")} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Arquivar</button>}</div></div>)}{rows.length===0&&<p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-neutral-500">Ainda não há comunicados cadastrados.</p>}</div>
     </>:<form onSubmit={e=>void save("draft",e)} className="space-y-4 rounded-2xl border border-white/10 bg-[#101010] p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{selected?"Editar comunicado":"Novo comunicado"}</h2><button type="button" onClick={()=>{setEditing(false);setSelected(null);}} className="text-sm text-neutral-400">Cancelar</button></div>
      <label className="block space-y-2 text-sm"><span className="text-neutral-300">Título</span><input required maxLength={140} className={input} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ex.: Alteração no horário das aulas"/></label>
      <label className="block space-y-2 text-sm"><span className="text-neutral-300">Conteúdo</span><textarea required rows={7} className={input+" resize-y"} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Escreva o comunicado completo..."/></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-2 text-sm"><span className="block text-neutral-300">Categoria</span><select className={input} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label className="space-y-2 text-sm"><span className="block text-neutral-300">Prioridade</span><select className={input} value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as typeof form.priority})}><option value="normal">Normal</option><option value="important">Importante</option><option value="urgent">Urgente</option></select></label></div>
      <div><p className="mb-2 text-sm text-neutral-300">Público destinatário</p><div className="flex flex-wrap gap-2">{roles.map(r=><label key={r} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"><input type="checkbox" checked={form.target_roles.includes(r)} onChange={e=>setForm({...form,target_roles:e.target.checked?[...form.target_roles,r]:form.target_roles.filter(x=>x!==r)})}/>{roleName[r]}</label>)}</div></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.pinned} onChange={e=>setForm({...form,pinned:e.target.checked})}/>Fixar no mural</label><label className="space-y-2 text-sm"><span className="block text-neutral-300">Validade (opcional)</span><input type="datetime-local" className={input} value={form.expires_at} onChange={e=>setForm({...form,expires_at:e.target.value})}/></label></div>
      <div className="space-y-2"><label className="block text-sm text-neutral-300">Anexos (PDF ou imagem, até 10 MB cada)</label><input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" className={input} onChange={e=>setFiles(Array.from(e.target.files??[]))}/>{files.length>0&&<p className="text-xs text-neutral-400">{files.map(f=>f.name).join(" • ")}</p>}</div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4"><button type="submit" disabled={busy} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold">Salvar rascunho</button><button type="button" disabled={busy} onClick={()=>void save("published")} className="rounded-xl bg-[#FFD200] px-4 py-3 text-sm font-black text-black">{busy?"Salvando...":"Publicar agora"}</button></div>
     </form>}
    </div>}
    {tab==="leituras"&&isAdmin&&<div className="space-y-3"><h2 className="text-lg font-bold">Confirmação de leitura</h2><p className="text-sm text-neutral-400">Acompanhe quantas contas registraram a leitura de cada publicação.</p>{visible.map(n=>{const count=reads.filter(r=>r.announcement_id===n.id).length;return <div key={n.id} className="rounded-2xl border border-white/10 bg-[#101010] p-4"><div className="flex justify-between gap-3"><p className="font-semibold">{n.title}</p><p className="shrink-0 text-sm text-[#FFD200]">{count} leitura(s)</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#FFD200]" style={{width:count?"100%":"0%"}}/></div></div>})}{visible.length===0&&<p className="text-sm text-neutral-500">Nenhum comunicado publicado.</p>}</div>}
   </>}
  </div>
 </section></div>
 {selected&&!editing&&tab!=="gerenciar"&&<div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-5" onClick={()=>setSelected(null)}><article onClick={e=>e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#111] p-6 sm:rounded-3xl"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#FFD200]">{selected.category}</span><button onClick={()=>setSelected(null)} className="rounded-lg px-3 py-2 text-sm text-neutral-400">Fechar ✕</button></div><h2 className="mt-4 text-2xl font-black">{selected.title}</h2><div className="mt-2 text-xs text-neutral-500">{new Date(selected.publish_at||selected.created_at).toLocaleString("pt-BR")}</div><div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-neutral-200">{selected.content}</div>{signedFiles.length>0&&<div className="mt-7 border-t border-white/10 pt-5"><h3 className="mb-3 text-sm font-bold">Anexos</h3><div className="space-y-2">{signedFiles.map(file=><a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#FFD200]/50"><span className="truncate pr-3">{file.type==="application/pdf"?"📄":"🖼️"} {file.name}</span><span className="shrink-0 text-[#FFD200]">Abrir ↗</span></a>)}</div></div>}<p className="mt-8 border-t border-white/10 pt-4 text-xs text-emerald-300">✓ Leitura registrada nesta conta</p></article></div>}
 </main>;
}
