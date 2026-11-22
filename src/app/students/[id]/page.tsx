"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {useCallback,useEffect,useMemo,useState,FormEvent,ChangeEvent} from "react";
import {useParams} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

type Student={id:string;full_name:string;birth_date:string|null;phone:string|null;email:string|null;enrollment_date:string|null;enrollment_status:string|null;plan_name:string|null;monthly_fee:number|null;class_label:string|null;class_id:string|null;modality_id:string|null;teacher_profile_id:string|null;photo_path:string|null;modalities:{name:string}|null;student_guardians:{guardians:{full_name:string;phone:string|null}|null}[]};
type Modality={id:string;name:string};
type ClassRow={id:string;name:string;schedule:string|null;modality_id:string;teacher_profile_id:string|null;teacher_name:string|null};
type Note={id:string;body:string;created_at:string};
type Attendance={id:string;class_date:string;status:string;note:string|null};
type History={id:string;old_status:string|null;new_status:string;changed_at:string};
type Audit={id:string;action:string;changed_at:string;old_data:Record<string,unknown>|null;new_data:Record<string,unknown>|null};
const field="w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none focus:border-purple-500";
const label="mb-1 block text-xs text-neutral-400";
const card="rounded-xl border border-white/10 bg-[#15151b] p-5";
const date=(v:string)=>new Date(v).toLocaleDateString("pt-BR");
export default function StudentProfilePage(){
 const params=useParams<{id:string}>();const id=params.id;const supabase=useMemo(()=>createClient(),[]);
 const [student,setStudent]=useState<Student|null>(null),[notes,setNotes]=useState<Note[]>([]),[attendance,setAttendance]=useState<Attendance[]>([]),[history,setHistory]=useState<History[]>([]),[audit,setAudit]=useState<Audit[]>([]),[modalities,setModalities]=useState<Modality[]>([]),[classes,setClasses]=useState<ClassRow[]>([]);
 const [photoUrl,setPhotoUrl]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [editing,setEditing]=useState(false),[saving,setSaving]=useState(false),[noteText,setNoteText]=useState(""),[attendanceDate,setAttendanceDate]=useState(new Date().toISOString().slice(0,10)),[attendanceStatus,setAttendanceStatus]=useState("present"),[attendanceNote,setAttendanceNote]=useState("");
 const [form,setForm]=useState({full_name:"",birth_date:"",phone:"",email:"",enrollment_date:"",enrollment_status:"active",plan_name:"",monthly_fee:"",modality_id:"",class_id:""});
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const [s,n,a,h,l,m,cl,t]=await Promise.all([
   supabase.from("students").select("id,full_name,birth_date,phone,email,enrollment_date,enrollment_status,plan_name,monthly_fee,class_label,photo_path,modalities(name),student_guardians(guardians(full_name,phone))").eq("id",id).single(),
   supabase.from("student_notes").select("id,body,created_at").eq("student_id",id).order("created_at",{ascending:false}),
   supabase.from("student_attendance").select("id,class_date,status,note").eq("student_id",id).order("class_date",{ascending:false}).limit(20),
   supabase.from("student_enrollment_history").select("id,old_status,new_status,changed_at").eq("student_id",id).order("changed_at",{ascending:false}),
   supabase.from("student_audit_log").select("id,action,changed_at,old_data,new_data").eq("student_id",id).order("changed_at",{ascending:false}).limit(20),
   supabase.from("modalities").select("id,name").eq("active",true).order("name"),
   supabase.from("classes").select("id,name,schedule,modality_id,teacher_profile_id").eq("active",true).order("name"),
   supabase.from("profiles").select("id,full_name").eq("role","teacher")
  ]);
  if(s.error){setError(s.error.message);setStudent(null);}else{
   const x=s.data as unknown as Student;setStudent(x);
   setForm({full_name:x.full_name??"",birth_date:x.birth_date??"",phone:x.phone??"",email:x.email??"",enrollment_date:x.enrollment_date??"",enrollment_status:x.enrollment_status??"active",plan_name:x.plan_name??"",monthly_fee:x.monthly_fee==null?"":String(x.monthly_fee),modality_id:x.modality_id??"",class_id:x.class_id??""});
   if(x.photo_path){const {data}=await supabase.storage.from("student-photos").createSignedUrl(x.photo_path,3600);setPhotoUrl(data?.signedUrl??"");}else setPhotoUrl("");
  }
  if(n.error||a.error||h.error||l.error||m.error||cl.error||t.error){setError(v=>v||n.error?.message||a.error?.message||h.error?.message||l.error?.message||m.error?.message||cl.error?.message||t.error?.message||"Falha ao carregar informações complementares.");}
  const teacherNames=new Map((t.data??[]).map(p=>[p.id,p.full_name]));
  setModalities(m.data??[]);setClasses((cl.data??[]).map(row=>({...row,teacher_name:teacherNames.get(row.teacher_profile_id)||null})));
  setNotes(n.data??[]);setAttendance(a.data??[]);setHistory(h.data??[]);setAudit(l.data??[]);
  setLoading(false);
 },[supabase,id]);
 useEffect(()=>{void load();},[load]);
 function change(k:keyof typeof form,v:string){setForm(old=>({...old,[k]:v,...(k==="modality_id"?{class_id:""}:{})}));}
 const availableClasses=classes.filter(c=>c.modality_id===form.modality_id);
 const selectedClass=classes.find(c=>c.id===form.class_id);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setError("");setNotice("");
  const selectedClass=classes.find(c=>c.id===form.class_id);
  if(form.class_id&&(!selectedClass||selectedClass.modality_id!==form.modality_id)){setError("A turma selecionada não corresponde à modalidade.");setSaving(false);return;}
  const {error}=await supabase.from("students").update({full_name:form.full_name,birth_date:form.birth_date||null,phone:form.phone,email:form.email||null,enrollment_date:form.enrollment_date||null,enrollment_status:form.enrollment_status,plan_name:form.plan_name||null,monthly_fee:form.monthly_fee===""?null:Number(form.monthly_fee),modality_id:form.modality_id||null,class_id:selectedClass?.id??null,class_label:selectedClass?.name??null,teacher_profile_id:selectedClass?.teacher_profile_id??null,teacher_label:selectedClass?.teacher_name??null}).eq("id",id);
  if(error)setError(error.message);else{setEditing(false);setNotice("Dados atualizados. O histórico de alterações foi registrado.");await load();}
  setSaving(false);
 }
 async function uploadPhoto(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;setError("");setNotice("");
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("Use uma imagem JPG, PNG ou WebP.");return;}
  if(file.size>5*1024*1024){setError("A imagem deve ter no máximo 5 MB.");return;}
  const path=id+"/profile-"+Date.now()+"."+file.name.split(".").pop();
  const {error:upError}=await supabase.storage.from("student-photos").upload(path,file,{upsert:true,contentType:file.type});
  if(upError){setError(upError.message);return;}
  const {error:dbError}=await supabase.from("students").update({photo_path:path}).eq("id",id);
  if(dbError){setError(dbError.message);return;}
  setNotice("Foto atualizada.");await load();
 }
 async function addNote(e:FormEvent<HTMLFormElement>){e.preventDefault();const body=noteText.trim();if(!body)return;const {error}=await supabase.from("student_notes").insert({student_id:id,body});if(error)setError(error.message);else{setNoteText("");setNotice("Observação registrada.");await load();}}
 async function addAttendance(e:FormEvent<HTMLFormElement>){e.preventDefault();const {error}=await supabase.from("student_attendance").insert({student_id:id,class_date:attendanceDate,status:attendanceStatus,note:attendanceNote.trim()||null});if(error)setError(error.message);else{setAttendanceNote("");setNotice("Frequência registrada.");await load();}}
 const status=student?.enrollment_status==="active"?"Ativo":student?.enrollment_status==="pending"?"Pendente":"Inativo";
 return <main className="min-h-screen bg-[#09090b] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1">
 <header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5"><p className="text-sm text-neutral-400">Administração / Alunos / Perfil</p><h1 className="text-xl font-semibold">Ficha do aluno</h1></header>
 <div className="mx-auto max-w-[1200px] space-y-5 p-5 pb-24 md:p-8 lg:pb-8"><Link href="/students" className="text-sm text-purple-300 hover:underline">← Voltar para alunos</Link>
 {loading?<p className="py-12 text-center text-neutral-400">Carregando perfil...</p>:error&&!student?<p role="alert" className="rounded-lg bg-red-500/10 p-4 text-sm text-red-300">Não foi possível carregar o aluno: {error}</p>:student&&<>
 <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-[#15151b] p-5 sm:p-6">
  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#24212b] text-3xl text-purple-200">{photoUrl?<img src={photoUrl} alt={"Foto de "+student.full_name} className="h-full w-full object-cover"/>:student.full_name.slice(0,1).toUpperCase()}</div>
  <div className="min-w-0 flex-1"><p className="text-xs uppercase tracking-[.2em] text-purple-300">Perfil cadastral</p><h2 className="mt-2 text-2xl font-semibold">{student.full_name}</h2><p className="mt-1 text-sm text-neutral-400">{student.modalities?.name??"Modalidade não informada"} · {student.class_label??"Turma a definir"}</p><div className="mt-3 flex flex-wrap items-center gap-3"><label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5">Alterar foto<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadPhoto}/></label><span className="rounded-full border border-white/10 px-3 py-1 text-xs">{status}</span></div></div>
  <button onClick={()=>{setNotice("");setEditing(v=>!v);}} className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold">{editing?"Cancelar edição":"Editar cadastro"}</button>
 </div>
 {notice&&<p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}{error&&<p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
 {editing?<form onSubmit={save} className={card+" space-y-5"}><h3 className="font-semibold">Editar dados cadastrais</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {([[ "full_name","Nome completo","text"],["birth_date","Data de nascimento","date"],["phone","Telefone","tel"],["email","E-mail","email"],["enrollment_date","Data da matrícula","date"],["plan_name","Plano contratado","text"],["monthly_fee","Valor contratado","number"]] as const).map(([k,l,t])=><label key={k}><span className={label}>{l}</span><input className={field} type={t} min={t==="number"?"0":undefined} step={t==="number"?"0.01":undefined} value={form[k]} onChange={e=>change(k,e.target.value)} required={k==="full_name"}/></label>)}
 <label><span className={label}>Modalidade</span><select className={field} value={form.modality_id} onChange={e=>change("modality_id",e.target.value)}><option value="">Sem modalidade</option>{modalities.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
 <label><span className={label}>Turma</span><select className={field} value={form.class_id} disabled={!form.modality_id} onChange={e=>change("class_id",e.target.value)}><option value="">Sem turma definida</option>{availableClasses.map(c=><option key={c.id} value={c.id}>{c.name}{c.schedule?" · "+c.schedule:""}</option>)}</select></label>
 <div><span className={label}>Professor responsável</span><div className={field+" min-h-[46px] text-neutral-300"}>{selectedClass?.teacher_name??(selectedClass?"Professor ainda não atribuído":"Definido pela turma selecionada")}</div></div>
 <label><span className={label}>Situação da matrícula</span><select className={field} value={form.enrollment_status} onChange={e=>change("enrollment_status",e.target.value)}><option value="active">Ativo</option><option value="pending">Pendente</option><option value="inactive">Inativo</option></select></label></div><div className="flex justify-end"><button disabled={saving} className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-semibold disabled:opacity-50">{saving?"Salvando...":"Salvar alterações"}</button></div></form>:<div className="grid gap-4 md:grid-cols-2">
 <article className={card}><h3 className="mb-4 font-semibold">Dados pessoais</h3><dl className="space-y-3 text-sm"><div><dt className={label}>Nome completo</dt><dd>{student.full_name}</dd></div><div><dt className={label}>Nascimento</dt><dd>{student.birth_date?date(student.birth_date+"T12:00:00"):"Não informado"}</dd></div><div><dt className={label}>Telefone</dt><dd>{student.phone||"Não informado"}</dd></div><div><dt className={label}>E-mail</dt><dd>{student.email||"Não informado"}</dd></div></dl></article>
 <article className={card}><h3 className="mb-4 font-semibold">Responsáveis</h3>{student.student_guardians?.length?student.student_guardians.map((x,i)=><div key={i} className="mb-3 text-sm"><p>{x.guardians?.full_name??"Nome não informado"}</p><p className="text-neutral-400">{x.guardians?.phone??"Telefone não informado"}</p></div>):<p className="text-sm text-neutral-500">Nenhum responsável vinculado.</p>}</article>
 <article className={card}><h3 className="mb-4 font-semibold">Vínculo esportivo</h3><dl className="space-y-3 text-sm"><div><dt className={label}>Modalidade</dt><dd>{student.modalities?.name??"Não informada"}</dd></div><div><dt className={label}>Turma</dt><dd>{student.class_label??"A definir"}</dd></div><div><dt className={label}>Data da matrícula</dt><dd>{student.enrollment_date?date(student.enrollment_date+"T12:00:00"):"Não informada"}</dd></div><div><dt className={label}>Situação</dt><dd>{status}</dd></div></dl></article>
 <article className={card}><h3 className="mb-4 font-semibold">Financeiro contratado</h3><dl className="space-y-3 text-sm"><div><dt className={label}>Plano</dt><dd>{student.plan_name??"Não informado"}</dd></div><div><dt className={label}>Valor contratado</dt><dd>{student.monthly_fee==null?"Não informado":student.monthly_fee.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</dd></div></dl><p className="mt-3 text-xs text-amber-300">Cobranças, pagamentos e inadimplência serão exibidos quando o módulo Financeiro estiver implementado.</p></article>
 </div>}
 <section className={card+" space-y-4"}><div><h3 className="font-semibold">Observações administrativas</h3><p className="mt-1 text-xs text-neutral-500">Registros internos vinculados à ficha do aluno.</p></div><form onSubmit={addNote} className="space-y-2"><textarea value={noteText} onChange={e=>setNoteText(e.target.value)} className={field+" min-h-24"} placeholder="Escreva uma observação..." required/><div className="flex justify-end"><button className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold">Registrar observação</button></div></form><div className="space-y-3">{notes.length?notes.map(n=><div key={n.id} className="rounded-lg bg-white/5 p-3"><p className="whitespace-pre-wrap text-sm">{n.body}</p><p className="mt-2 text-[11px] text-neutral-500">{new Date(n.created_at).toLocaleString("pt-BR")}</p></div>):<p className="text-sm text-neutral-500">Nenhuma observação registrada.</p>}</div></section>
 <section className={card+" space-y-4"}><div><h3 className="font-semibold">Frequência</h3><p className="mt-1 text-xs text-neutral-500">Registro manual de presença, falta ou falta justificada.</p></div><form onSubmit={addAttendance} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label><span className={label}>Data da aula</span><input type="date" className={field} value={attendanceDate} onChange={e=>setAttendanceDate(e.target.value)} required/></label><label><span className={label}>Situação</span><select className={field} value={attendanceStatus} onChange={e=>setAttendanceStatus(e.target.value)}><option value="present">Presente</option><option value="absent">Falta</option><option value="justified">Falta justificada</option></select></label><label className="sm:col-span-2"><span className={label}>Observação (opcional)</span><input className={field} value={attendanceNote} onChange={e=>setAttendanceNote(e.target.value)} placeholder="Ex.: atestado, reposição..."/></label><div className="flex items-end"><button className="w-full rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold">Salvar frequência</button></div></form><div className="space-y-2">{attendance.length?attendance.map(a=><div key={a.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-white/5 p-3 text-sm"><span>{date(a.class_date+"T12:00:00")}{a.note?" · "+a.note:""}</span><span className={a.status==="present"?"text-emerald-300":a.status==="justified"?"text-amber-300":"text-red-300"}>{a.status==="present"?"Presente":a.status==="justified"?"Falta justificada":"Falta"}</span></div>):<p className="text-sm text-neutral-500">Nenhuma frequência registrada.</p>}</div></section>
 <section className={card+" space-y-3"}><h3 className="font-semibold">Histórico de matrícula</h3>{history.length?history.map(h=><div key={h.id} className="rounded-lg bg-white/5 p-3 text-sm"><p>{h.old_status??"Sem situação anterior"} → {h.new_status}</p><p className="mt-1 text-xs text-neutral-500">{new Date(h.changed_at).toLocaleString("pt-BR")}</p></div>):<p className="text-sm text-neutral-500">As mudanças de situação da matrícula serão registradas automaticamente.</p>}</section>
 <section className={card+" space-y-3"}><h3 className="font-semibold">Histórico de alterações</h3><p className="text-xs text-neutral-500">Trilha de auditoria dos dados cadastrais.</p>{audit.length?audit.map(a=><div key={a.id} className="rounded-lg bg-white/5 p-3 text-sm"><p>{a.action==="update"?"Dados cadastrais atualizados":"Alteração registrada"}</p><p className="mt-1 text-xs text-neutral-500">{new Date(a.changed_at).toLocaleString("pt-BR")}</p></div>):<p className="text-sm text-neutral-500">Nenhuma alteração registrada ainda.</p>}</section>
 </>}
 </div></section></div></main>;
}
