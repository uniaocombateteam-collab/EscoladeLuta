"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";

type Student = { id:string; full_name:string; enrollment_date:string; enrollment_status:"active"|"pending"|"inactive"; monthly_fee:number|null; modality_id:string|null; class_id:string|null; teacher_profile_id:string|null };
type Entry = { id:string; direction:"income"|"expense"; category:string; description:string; amount:number; due_date:string|null; competence_month:string|null; status:"pending"|"paid"|"cancelled"; paid_at:string|null; student_id:string|null; teacher_profile_id:string|null };
type Attendance = { id:string; student_id:string; class_date:string; status:"present"|"absent"|"justified" };
type Modality = { id:string; name:string; active:boolean };
type ClassRow = { id:string; name:string; active:boolean; modality_id:string|null; teacher_profile_id:string|null };
type Profile = { id:string; full_name:string|null; role:"admin"|"teacher"|"guardian" };
type Notice = { id:string; status:string; created_at:string };
type Section = "overview"|"students"|"finance"|"classes"|"teachers"|"communications";
const today = () => new Date().toLocaleDateString("en-CA");
const monthStart = () => today().slice(0,7)+"-01";
const money = (value:number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
const dateLabel = (value:string) => new Date(value+"T12:00:00").toLocaleDateString("pt-BR");
const csvCell = (value:unknown) => '"' + String(value ?? "").replace(/"/g,'""') + '"';

export default function ReportsPage() {
  const db = useMemo(()=>createClient(),[]);
  const [section,setSection] = useState<Section>("overview");
  const [start,setStart] = useState(monthStart());
  const [end,setEnd] = useState(today());
  const [students,setStudents] = useState<Student[]>([]);
  const [entries,setEntries] = useState<Entry[]>([]);
  const [attendance,setAttendance] = useState<Attendance[]>([]);
  const [modalities,setModalities] = useState<Modality[]>([]);
  const [classes,setClasses] = useState<ClassRow[]>([]);
  const [profiles,setProfiles] = useState<Profile[]>([]);
  const [notices,setNotices] = useState<Notice[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [accessDenied,setAccessDenied] = useState(false);

  const load = useCallback(async()=>{
    setLoading(true); setError(""); setAccessDenied(false);
    const {data:{user},error:authError}=await db.auth.getUser();
    if(authError||!user){setError("Sua sessão não foi identificada. Entre novamente.");setLoading(false);return;}
    const profile=await db.from("profiles").select("role").eq("id",user.id).single();
    if(profile.error){setError("Não foi possível validar seu perfil: "+profile.error.message);setLoading(false);return;}
    if(profile.data.role!=="admin"){setAccessDenied(true);setLoading(false);return;}
    const results=await Promise.all([
      db.from("students").select("id,full_name,enrollment_date,enrollment_status,monthly_fee,modality_id,class_id,teacher_profile_id"),
      db.from("financial_entries").select("id,direction,category,description,amount,due_date,competence_month,status,paid_at,student_id,teacher_profile_id"),
      db.from("student_attendance").select("id,student_id,class_date,status"),
      db.from("modalities").select("id,name,active"),
      db.from("classes").select("id,name,active,modality_id,teacher_profile_id"),
      db.from("profiles").select("id,full_name,role"),
      db.from("academy_announcements").select("id,status,created_at")
    ]);
    const issue=results.find(x=>x.error)?.error;
    if(issue){setError("Falha ao carregar os dados dos relatórios: "+issue.message);setLoading(false);return;}
    setStudents((results[0].data??[]) as Student[]);
    setEntries((results[1].data??[]) as Entry[]);
    setAttendance((results[2].data??[]) as Attendance[]);
    setModalities((results[3].data??[]) as Modality[]);
    setClasses((results[4].data??[]) as ClassRow[]);
    setProfiles((results[5].data??[]) as Profile[]);
    setNotices((results[6].data??[]) as Notice[]);
    setLoading(false);
  },[db]);

  useEffect(()=>{void load();},[load]);

  const periodEntries=entries.filter(x=>(x.competence_month||x.due_date||"")>=start&&(x.competence_month||x.due_date||"")<=end);
  const periodAttendance=attendance.filter(x=>x.class_date>=start&&x.class_date<=end);
  const periodStudents=students.filter(x=>x.enrollment_date>=start&&x.enrollment_date<=end);
  const activeStudents=students.filter(x=>x.enrollment_status==="active");
  const pendingStudents=students.filter(x=>x.enrollment_status==="pending");
  const inactiveStudents=students.filter(x=>x.enrollment_status==="inactive");
  const paidIncome=periodEntries.filter(x=>x.direction==="income"&&x.status==="paid").reduce((n,x)=>n+Number(x.amount),0);
  const pendingIncome=periodEntries.filter(x=>x.direction==="income"&&x.status==="pending").reduce((n,x)=>n+Number(x.amount),0);
  const paidExpenses=periodEntries.filter(x=>x.direction==="expense"&&x.status==="paid").reduce((n,x)=>n+Number(x.amount),0);
  const pendingExpenses=periodEntries.filter(x=>x.direction==="expense"&&x.status==="pending").reduce((n,x)=>n+Number(x.amount),0);
  const balance=paidIncome-paidExpenses;
  const attendanceCount=periodAttendance.filter(x=>x.status==="present").length;
  const attendanceTotal=periodAttendance.filter(x=>x.status==="present"||x.status==="absent").length;
  const attendanceRate=attendanceTotal?Math.round(attendanceCount/attendanceTotal*100):null;
  const teachers=profiles.filter(x=>x.role==="teacher");
  const activeClasses=classes.filter(x=>x.active);
  const publishedNotices=notices.filter(x=>x.status==="published");
  const currency=money;

  const modalityStats=modalities.map(m=>({name:m.name,count:activeStudents.filter(s=>s.modality_id===m.id).length,fee:activeStudents.filter(s=>s.modality_id===m.id).reduce((n,s)=>n+Number(s.monthly_fee||0),0)})).sort((a,b)=>b.count-a.count);
  const teacherStats=teachers.map(t=>({name:t.full_name||"Professor sem nome",classes:activeClasses.filter(c=>c.teacher_profile_id===t.id).length,students:activeStudents.filter(s=>s.teacher_profile_id===t.id).length})).sort((a,b)=>b.students-a.students);
  const insights=[
    activeStudents.length===0?"Ainda não há alunos ativos cadastrados.":`A academia possui ${activeStudents.length} aluno(s) com matrícula ativa.`,
    pendingIncome>0?`Há ${currency(pendingIncome)} em receitas pendentes no período selecionado.`:"Não há receitas pendentes no período selecionado.",
    attendanceRate===null?"Não há registros de presença suficientes no período para calcular a frequência.":`A frequência registrada no período é de ${attendanceRate}%.`,
    activeClasses.length===0?"Nenhuma turma está marcada como ativa.":`Existem ${activeClasses.length} turma(s) ativa(s) cadastrada(s).`
  ];

  function exportCSV(){
    const rows:unknown[][] = section==="finance"
      ? [["Tipo","Categoria","Descrição","Valor","Situação","Vencimento","Competência"],...periodEntries.map(x=>[x.direction==="income"?"Receita":"Despesa",x.category,x.description,x.amount,x.status,x.due_date||"",x.competence_month||""])]
      : section==="students"
      ? [["Aluno","Matrícula","Situação","Mensalidade","Modalidade"],...students.map(s=>[s.full_name,s.enrollment_date,s.enrollment_status,s.monthly_fee??"",modalities.find(m=>m.id===s.modality_id)?.name||""]) ]
      : section==="classes"
      ? [["Turma","Modalidade","Professor","Alunos ativos","Situação"],...classes.map(c=>[c.name,modalities.find(m=>m.id===c.modality_id)?.name||"",profiles.find(p=>p.id===c.teacher_profile_id)?.full_name||"",activeStudents.filter(s=>s.class_id===c.id).length,c.active?"Ativa":"Inativa"])]
      : section==="teachers"
      ? [["Professor","Turmas ativas","Alunos ativos"],...teacherStats.map(t=>[t.name,t.classes,t.students])]
      : [["Indicador","Valor"],["Alunos ativos",activeStudents.length],["Alunos pendentes",pendingStudents.length],["Alunos inativos",inactiveStudents.length],["Receitas recebidas",paidIncome],["Receitas pendentes",pendingIncome],["Despesas pagas",paidExpenses],["Despesas pendentes",pendingExpenses],["Saldo do período",balance],["Frequência",attendanceRate===null?"Sem dados":attendanceRate+"%"],["Turmas ativas",activeClasses.length],["Professores",teachers.length]];
    const csv="\uFEFF"+rows.map(row=>row.map(csvCell).join(";")).join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`relatorio-${section}-${start}-a-${end}.csv`;a.click();URL.revokeObjectURL(url);
  }

  const nav:[Section,string,string][]=[["overview","Visão geral","▦"],["students","Alunos","♙"],["finance","Financeiro","＄"],["classes","Turmas","◈"],["teachers","Professores","♟"],["communications","Comunicados","◉"]];
  const panel="rounded-2xl border border-white/10 bg-[#111] p-5";
  const metric=(label:string,value:string,detail:string)=><article className={panel}><p className="text-sm text-neutral-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p><p className="mt-1 text-xs text-neutral-500">{detail}</p></article>;

  return <main className="min-h-screen bg-[#050505] text-white"><div className="flex min-h-screen"><Sidebar/><section className="min-w-0 flex-1">
    <header className="border-b border-white/10 bg-black px-5 py-5"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#FFD200]">Administração · Inteligência de gestão</p><h1 className="mt-1 text-2xl font-black">Relatórios</h1><p className="mt-1 text-sm text-neutral-400">Indicadores operacionais e financeiros da Escola de Lutas Rafael Mota.</p></header>
    <div className="mx-auto max-w-[1500px] space-y-6 p-4 pb-24 md:p-7">
      {error&&<p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      {accessDenied&&<p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">Esta área contém informações administrativas e financeiras e está disponível apenas para a administração.</p>}
      {!accessDenied&&<>
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#101010] p-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#FFD200]">Período de análise</p><div className="mt-2 flex flex-wrap items-center gap-2"><label className="text-xs text-neutral-400">De<input aria-label="Data inicial" type="date" value={start} max={end} onChange={e=>setStart(e.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"/></label><label className="text-xs text-neutral-400">Até<input aria-label="Data final" type="date" value={end} min={start} max={today()} onChange={e=>setEnd(e.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"/></label><button onClick={()=>{setStart(monthStart());setEnd(today());}} className="mt-4 rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-300">Mês atual</button></div></div>
          <div className="flex flex-wrap gap-2"><button onClick={exportCSV} disabled={loading} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold disabled:opacity-40">↓ Exportar Excel (CSV)</button><button onClick={()=>window.print()} disabled={loading} className="rounded-xl bg-[#FFD200] px-4 py-3 text-sm font-black text-black disabled:opacity-40">Imprimir / Salvar PDF</button></div>
        </div>
        <nav aria-label="Categorias de relatórios" className="flex gap-2 overflow-x-auto pb-1">{nav.map(([id,label,icon])=><button key={id} onClick={()=>setSection(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${section===id?"bg-[#FFD200] text-black":"border border-white/10 bg-[#101010] text-neutral-300 hover:border-white/25"}`}><span>{icon}</span>{label}</button>)}</nav>
        {loading?<div className={panel+" py-14 text-center text-sm text-neutral-400"}>Carregando dados dos relatórios...</div>:<>
          {section==="overview"&&<>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metric("Alunos ativos",String(activeStudents.length),`${pendingStudents.length} matrícula(s) pendente(s)`)}{metric("Receitas recebidas",currency(paidIncome),"Pagamentos no período")}{metric("Saldo do período",currency(balance),"Receitas recebidas menos despesas pagas")}{metric("Frequência registrada",attendanceRate===null?"—":attendanceRate+"%",`${periodAttendance.length} registro(s) de presença`)}</div>
            <div className="grid gap-4 xl:grid-cols-2"><section className={panel}><h2 className="text-lg font-bold">Panorama financeiro</h2><div className="mt-4 space-y-3">{[["Receitas recebidas",paidIncome,"text-emerald-300"],["Receitas pendentes",pendingIncome,"text-amber-300"],["Despesas pagas",paidExpenses,"text-rose-300"],["Despesas pendentes",pendingExpenses,"text-amber-300"]].map(([label,value,color])=><div key={String(label)} className="flex items-center justify-between gap-3 border-b border-white/5 pb-3"><span className="text-sm text-neutral-400">{label}</span><strong className={String(color)}>{currency(Number(value))}</strong></div>)}</div></section>
            <section className={panel}><h2 className="text-lg font-bold">Alunos por modalidade</h2><div className="mt-4 space-y-4">{modalityStats.length?modalityStats.map(m=><div key={m.name}><div className="mb-1 flex justify-between gap-3 text-sm"><span>{m.name}</span><strong>{m.count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#FFD200]" style={{width:`${activeStudents.length?m.count/activeStudents.length*100:0}%`}}/></div></div>):<p className="text-sm text-neutral-500">Nenhuma modalidade cadastrada.</p>}</div></section></div>
            <section className={panel}><h2 className="text-lg font-bold">Leitura gerencial</h2><p className="mt-1 text-sm text-neutral-400">Observações geradas automaticamente a partir dos registros disponíveis.</p><ul className="mt-4 space-y-3">{insights.map((item,i)=><li key={i} className="flex gap-3 text-sm leading-6 text-neutral-300"><span className="mt-0.5 text-[#FFD200]">◆</span>{item}</li>)}</ul></section>
          </>}
          {section==="students"&&<><div className="grid gap-3 sm:grid-cols-3">{metric("Ativos",String(activeStudents.length),"Matrículas ativas")}{metric("Pendentes",String(pendingStudents.length),"Aguardando regularização")}{metric("Inativos",String(inactiveStudents.length),"Matrículas inativas")}</div><section className={panel}><h2 className="text-lg font-bold">Movimentação no período</h2><p className="mt-1 text-sm text-neutral-400">{periodStudents.length} matrícula(s) registrada(s) entre {dateLabel(start)} e {dateLabel(end)}.</p><div className="mt-4 space-y-2">{periodStudents.map(s=><div key={s.id} className="flex flex-wrap justify-between gap-2 border-b border-white/5 py-2 text-sm"><span>{s.full_name}</span><span className="text-neutral-400">{dateLabel(s.enrollment_date)} · {s.enrollment_status==="active"?"Ativo":s.enrollment_status==="pending"?"Pendente":"Inativo"}</span></div>)}{periodStudents.length===0&&<p className="text-sm text-neutral-500">Nenhuma matrícula registrada neste período.</p>}</div></section></>}
          {section==="finance"&&<><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metric("Recebido",currency(paidIncome),"Receitas pagas")}{metric("A receber",currency(pendingIncome),"Receitas pendentes")}{metric("Despesas pagas",currency(paidExpenses),"Saídas confirmadas")}{metric("Saldo",currency(balance),"Resultado de caixa do período")}</div><section className={panel}><h2 className="text-lg font-bold">Lançamentos financeiros</h2><div className="mt-4 space-y-2">{periodEntries.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 py-3"><div><p className="text-sm font-semibold">{x.description}</p><p className="mt-1 text-xs text-neutral-500">{x.category} · {x.direction==="income"?"Receita":"Despesa"} · {x.status==="paid"?"Pago":x.status==="pending"?"Pendente":"Cancelado"}</p></div><strong className={x.direction==="income"?"text-emerald-300":"text-rose-300"}>{currency(Number(x.amount))}</strong></div>)}{periodEntries.length===0&&<p className="text-sm text-neutral-500">Nenhum lançamento financeiro neste período.</p>}</div></section></>}
          {section==="classes"&&<><div className="grid gap-3 sm:grid-cols-3">{metric("Turmas ativas",String(activeClasses.length),"Turmas habilitadas")}{metric("Alunos ativos",String(activeStudents.length),"Alunos com matrícula ativa")}{metric("Presença",attendanceRate===null?"—":attendanceRate+"%","No período selecionado")}</div><section className={panel}><h2 className="text-lg font-bold">Ocupação das turmas</h2><div className="mt-4 space-y-3">{classes.map(c=><div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3"><div><p className="font-semibold">{c.name}</p><p className="mt-1 text-xs text-neutral-500">{modalities.find(m=>m.id===c.modality_id)?.name||"Modalidade não informada"} · {profiles.find(p=>p.id===c.teacher_profile_id)?.full_name||"Professor não vinculado"}</p></div><div className="text-right"><p className="font-bold">{activeStudents.filter(s=>s.class_id===c.id).length} aluno(s)</p><p className="text-xs text-neutral-500">{c.active?"Ativa":"Inativa"}</p></div></div>)}{classes.length===0&&<p className="text-sm text-neutral-500">Nenhuma turma cadastrada.</p>}</div></section></>}
          {section==="teachers"&&<section className={panel}><h2 className="text-lg font-bold">Equipe de professores</h2><p className="mt-1 text-sm text-neutral-400">Distribuição de turmas e alunos ativos vinculados.</p><div className="mt-4 space-y-3">{teacherStats.map(t=><div key={t.name} className="flex items-center justify-between gap-3 border-b border-white/5 pb-3"><strong>{t.name}</strong><div className="text-right text-sm text-neutral-400">{t.classes} turma(s) · {t.students} aluno(s)</div></div>)}{teacherStats.length===0&&<p className="text-sm text-neutral-500">Nenhum professor cadastrado.</p>}</div></section>}
          {section==="communications"&&<div className="grid gap-3 sm:grid-cols-3">{metric("Comunicados publicados",String(publishedNotices.length),"Publicações com status publicado")}{metric("Total de comunicados",String(notices.length),"Inclui rascunhos e arquivados")}{metric("Publicações no período",String(notices.filter(n=>n.created_at.slice(0,10)>=start&&n.created_at.slice(0,10)<=end).length),"Criadas no intervalo selecionado")}</div>}
        </>}
      </>}
      <p className="text-xs text-neutral-600">Os indicadores refletem os registros disponíveis no banco de dados e as permissões do perfil conectado. Relatórios não substituem a conferência dos lançamentos originais.</p>
    </div>
  </section></div>
  <style jsx global>{`@media print { aside, nav, button, input { display:none !important; } body,main { background:#fff !important; color:#111 !important; } article,section { break-inside:avoid; } * { color:#111 !important; border-color:#ddd !important; } }`}</style>
  </main>;
}
