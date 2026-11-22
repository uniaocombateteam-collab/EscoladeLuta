export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl">
        <header className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-academy-gold/40 bg-academy-panel font-bold text-academy-gold">RM</div>
          <div>
            <p className="text-sm font-semibold tracking-wide">ESCOLA DE LUTAS</p>
            <p className="text-xs tracking-[0.2em] text-academy-muted">RAFAEL MOTA</p>
          </div>
        </header>
        <section className="rounded-2xl border border-academy-line bg-academy-panel p-8 shadow-2xl sm:p-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-academy-gold">Plataforma de gestão</p>
          <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">Gestão da escola. Evolução de cada aluno.</h1>
          <p className="mt-6 max-w-xl leading-7 text-academy-muted">Um ambiente para organizar alunos, professores, mensalidades, comunicados e atividades da Escola de Lutas Rafael Mota.</p>
          <div className="mt-10 inline-flex rounded-full border border-academy-gold/30 bg-academy-gold/10 px-4 py-2 text-sm text-academy-gold">Ambiente em construção · versão 0.1.0</div>
        </section>
        <p className="mt-6 text-center text-xs text-neutral-600">Escola de Lutas Rafael Mota</p>
      </section>
    </main>
  );
}
