# Sistema Escola de Lutas Rafael Mota

Sistema administrativo e financeiro da academia.

## Stack
Next.js 15, React 19, TypeScript, Tailwind CSS e Supabase (PostgreSQL, Auth e RLS).

## Publicação
A branch `setup/initial-foundation` é usada para validar previews na Vercel antes de promover alterações para `main`.

## Desenvolvimento local
1. Node.js 20.9+
2. `npm install`
3. Copie `.env.example` para `.env.local` e configure URL e publishable key.
4. `npm run dev`

## Primeiro administrador
Crie o primeiro usuário em Supabase Auth > Users. Depois copie seu UUID e execute no SQL Editor:
`update public.profiles set role = 'admin' where id = 'UUID_DO_USUARIO';`

As políticas atuais restringem dados administrativos a usuários com role admin. Professores e responsáveis ainda não têm acesso às suas áreas. Não use dados reais até configurar o primeiro administrador e testar os acessos.

Nunca exponha secret/service_role keys no navegador ou repositório.

<!-- vercel-redeploy-trigger -->
