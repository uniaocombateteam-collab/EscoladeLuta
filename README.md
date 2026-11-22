# Sistema Escola de Lutas Rafael Mota

Sistema administrativo e financeiro para gestão da academia.

## Stack
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth e Row Level Security
- Vercel (deploy planejado)

## Perfis previstos
- admin: administração completa
- teacher: acesso limitado às próprias turmas e alunos
- guardian: portal do aluno e responsável

## Configuração local
1. Use Node.js 20.9 ou superior.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local`.
4. Preencha a URL e a publishable key do projeto Supabase.
5. Execute `npm run dev`.

## Supabase
O projeto usa `@supabase/ssr` com cookies para manter sessões no Next.js. Nunca coloque secret/service_role keys em variáveis `NEXT_PUBLIC_*`.

O schema inicial cria perfis, modalidades, turmas, alunos, responsáveis e vínculos. As políticas atuais liberam os registros administrativos somente para usuários com perfil `admin`. Professores e responsáveis ainda não têm suas políticas de leitura liberadas.

### Primeiro administrador
1. Crie o primeiro usuário em Supabase Auth > Users (convite/cadastro controlado).
2. Copie o UUID desse usuário.
3. No SQL Editor, execute: `update public.profiles set role = 'admin' where id = 'UUID_DO_USUARIO';`
4. Entre pela rota `/login`.

Não compartilhe senhas, tokens ou chaves secretas no repositório.

## Estado
A autenticação por senha e a conexão inicial do cadastro de alunos estão em implementação. Ainda é necessário executar testes de build, login e RLS antes de produção.
