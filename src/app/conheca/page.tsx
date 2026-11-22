"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const modalities = [
  { name: "Jiu-Jitsu", description: "Técnica, estratégia, disciplina e evolução no tatame.", mark: "🥋" },
  { name: "Boxe", description: "Condicionamento, precisão, resistência e confiança.", mark: "🥊" },
  { name: "Kickboxing", description: "Potência, coordenação e preparo físico.", mark: "⚡" },
  { name: "Capoeira", description: "Movimento, musicalidade, cultura e tradição.", mark: "◉" },
];

const field = "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#FFD200]";

export default function ConhecaAcademiaPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", modality: "Jiu-Jitsu", preferred_period: "Noite", message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const { error } = await createClient().from("academy_trial_requests").insert({
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        message: form.message.trim() || null,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar sua solicitação. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/conheca" className="leading-tight">
            <span className="block text-xs font-bold uppercase tracking-[.2em] text-neutral-300">Escola de Lutas</span>
            <span className="block text-lg font-black uppercase tracking-[.14em] text-[#FFD200]">Rafael Mota</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <a href="#modalidades" className="hidden text-neutral-300 transition hover:text-[#FFD200] sm:inline">Modalidades</a>
            <a href="#experimental" className="rounded-full bg-[#FFD200] px-4 py-2 font-bold text-black transition hover:bg-yellow-300">Aula experimental</a>
            <Link href="/login" className="hidden rounded-full border border-white/15 px-4 py-2 text-neutral-200 transition hover:border-[#FFD200] sm:inline">Entrar</Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_25%,rgba(255,210,0,.16),transparent_36%),linear-gradient(115deg,#050505,#151515_60%,#080808)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-[1.1fr_.9fr] md:py-28">
          <div>
            <p className="text-xs font-bold tracking-[.3em] text-[#FFD200]">DISCIPLINA · TÉCNICA · EVOLUÇÃO</p>
            <h1 className="mt-6 max-w-3xl text-4xl font-black uppercase leading-[1.05] sm:text-6xl">Treine. Evolua.<br/><span className="text-[#FFD200]">Supere seus limites.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-300">Encontre sua modalidade, conheça nossa estrutura e descubra uma nova forma de desenvolver corpo, mente e confiança.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#modalidades" className="rounded-xl bg-[#FFD200] px-6 py-3 font-bold text-black transition hover:bg-yellow-300">Conhecer modalidades</a>
              <a href="#experimental" className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-[#FFD200]">Experimentar uma aula</a>
            </div>
          </div>
          <div className="rounded-3xl border border-[#FFD200]/25 bg-black/40 p-8 shadow-2xl">
            <p className="text-xs font-bold tracking-[.25em] text-[#FFD200]">ESCOLA DE LUTAS</p>
            <div className="mt-5 text-4xl font-black uppercase leading-none sm:text-5xl">Rafael<br/><span className="text-[#FFD200]">Mota</span></div>
            <div className="mt-7 h-1 w-16 rounded-full bg-[#FFD200]"/>
            <p className="mt-6 text-sm leading-6 text-neutral-400">Um ambiente de treinamento para diferentes objetivos, níveis e trajetórias.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-neutral-300">
              <div className="rounded-xl border border-white/10 bg-white/[.03] p-4"><strong className="block text-lg text-white">4</strong> modalidades</div>
              <div className="rounded-xl border border-white/10 bg-white/[.03] p-4"><strong className="block text-lg text-white">1</strong> comunidade</div>
            </div>
          </div>
        </div>
      </section>

      <section id="modalidades" className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="mb-8 max-w-2xl"><p className="text-xs font-bold tracking-[.25em] text-[#FFD200]">ENCONTRE SEU CAMINHO</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Conheça as modalidades</h2><p className="mt-3 text-sm leading-6 text-neutral-400">Escolha uma atividade para conhecer. A equipe poderá orientar sobre níveis, horários, disponibilidade e planos.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modalities.map((m, i) => <article key={m.name} className="group rounded-2xl border border-white/10 bg-gradient-to-b from-[#191919] to-[#0b0b0b] p-6 transition hover:-translate-y-1 hover:border-[#FFD200]/50">
            <span className="text-4xl">{m.mark}</span><p className="mt-7 text-xs font-bold tracking-widest text-[#FFD200]">0{i + 1}</p><h3 className="mt-2 text-xl font-bold">{m.name}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-neutral-400">{m.description}</p><a href="#experimental" onClick={() => setForm(v => ({ ...v, modality: m.name }))} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#FFD200]">Tenho interesse <span>→</span></a>
          </article>)}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:py-20">
          <div><p className="text-xs font-bold tracking-[.25em] text-[#FFD200]">PLANOS E CONDIÇÕES</p><h2 className="mt-3 text-3xl font-black">Encontre a opção adequada à sua rotina.</h2><p className="mt-4 text-sm leading-7 text-neutral-400">Consulte os planos individuais e as possibilidades de combinar modalidades. A equipe apresenta os valores vigentes, horários e condições antes da contratação.</p><p className="mt-5 text-xs text-neutral-500">TotalPass e Wellhub: consulte a disponibilidade e as condições de utilização.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5"><p className="text-sm font-bold">Plano individual</p><p className="mt-2 text-sm text-neutral-400">Uma modalidade, com opções conforme a grade disponível.</p></div>
            <div className="rounded-2xl border border-[#FFD200]/30 bg-black/40 p-5"><p className="text-sm font-bold text-[#FFD200]">Combinação de modalidades</p><p className="mt-2 text-sm text-neutral-400">Consulte condições para treinar em mais de uma atividade.</p></div>
          </div>
        </div>
      </section>

      <section id="experimental" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[.85fr_1.15fr] md:py-20">
        <div><p className="text-xs font-bold tracking-[.25em] text-[#FFD200]">PRIMEIRO PASSO</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Solicite sua aula experimental.</h2><p className="mt-4 text-sm leading-7 text-neutral-400">Conte qual modalidade deseja conhecer e qual período funciona melhor para você. Nossa equipe entrará em contato para confirmar disponibilidade e horário.</p><div className="mt-8 rounded-2xl border border-white/10 bg-[#111] p-5"><p className="font-semibold">Como funciona?</p><ol className="mt-4 space-y-3 text-sm text-neutral-400"><li>01 · Preencha seus dados.</li><li>02 · Escolha a modalidade e o período.</li><li>03 · Aguarde o contato da equipe.</li><li>04 · Receba a confirmação da experiência.</li></ol></div></div>
        <div className="rounded-3xl border border-white/10 bg-[#111] p-6 sm:p-8">
          {sent ? <div className="py-10 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/10 text-2xl text-emerald-300">✓</div><h3 className="mt-5 text-2xl font-bold">Solicitação recebida!</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-400">Seus dados foram enviados à equipe da academia. Aguarde o contato para confirmar a disponibilidade.</p><button onClick={() => { setSent(false); setForm({ full_name: "", email: "", phone: "", modality: "Jiu-Jitsu", preferred_period: "Noite", message: "" }); }} className="mt-6 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold">Enviar outra solicitação</button></div> :
          <form onSubmit={submit} className="space-y-4">
            <div><h3 className="text-xl font-bold">Quero conhecer a academia</h3><p className="mt-1 text-xs text-neutral-500">Os campos marcados são obrigatórios.</p></div>
            <label className="block text-xs font-semibold text-neutral-300">Nome completo<input required maxLength={120} autoComplete="name" className={field} value={form.full_name} onChange={e=>setForm(v=>({...v,full_name:e.target.value}))} placeholder="Seu nome"/></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-semibold text-neutral-300">E-mail<input required type="email" maxLength={254} autoComplete="email" className={field} value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} placeholder="voce@email.com"/></label><label className="block text-xs font-semibold text-neutral-300">WhatsApp / telefone<input required type="tel" maxLength={30} autoComplete="tel" className={field} value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))} placeholder="(21) 99999-9999"/></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-semibold text-neutral-300">Modalidade<select className={field} value={form.modality} onChange={e=>setForm(v=>({...v,modality:e.target.value}))}>{modalities.map(m=><option key={m.name}>{m.name}</option>)}</select></label><label className="block text-xs font-semibold text-neutral-300">Período preferido<select className={field} value={form.preferred_period} onChange={e=>setForm(v=>({...v,preferred_period:e.target.value}))}>{["Manhã","Tarde","Noite","Flexível"].map(p=><option key={p}>{p}</option>)}</select></label></div>
            <label className="block text-xs font-semibold text-neutral-300">Mensagem (opcional)<textarea maxLength={1000} rows={3} className={field} value={form.message} onChange={e=>setForm(v=>({...v,message:e.target.value}))} placeholder="Conte se tem alguma dúvida ou preferência."/></label>
            {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#FFD200] px-5 py-3.5 text-sm font-black text-black transition hover:bg-yellow-300 disabled:opacity-50">{busy?"Enviando...":"Solicitar aula experimental"}</button>
            <p className="text-[11px] leading-5 text-neutral-500">Ao enviar, você autoriza a equipe a utilizar seus dados para responder a esta solicitação. Não compartilhe informações sensíveis neste formulário.</p>
          </form>}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs text-neutral-500 sm:flex-row sm:items-center"><div><p className="font-bold uppercase tracking-widest text-white">Escola de Lutas <span className="text-[#FFD200]">Rafael Mota</span></p><p className="mt-1">Disciplina, técnica e evolução.</p></div><div className="flex gap-4"><Link href="/login" className="transition hover:text-[#FFD200]">Acesso de alunos e equipe</Link><a href="#modalidades" className="transition hover:text-[#FFD200]">Modalidades</a></div></div>
      </footer>
    </main>
  );
}
