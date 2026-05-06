## Reorganizar estrutura de pastas + esclarecer seguranca do .env

### Parte 1 -- Sobre o .env (importante ler antes)

O arquivo `.env` deste projeto contem APENAS chaves publicas:
- `VITE_SUPABASE_URL` -- URL publica da API
- `VITE_SUPABASE_PUBLISHABLE_KEY` -- a "anon key" do Supabase (publica por design)
- `VITE_SUPABASE_PROJECT_ID` -- ID publico do projeto

Tudo que comeca com `VITE_` no Vite e **embutido no JavaScript do navegador** durante o build. Mesmo que o `.env` nao estivesse no GitHub, qualquer pessoa que abrisse o site poderia ver essas chaves no DevTools. **Nao existe forma de "esconder" ou "criptografar" essas variaveis** num app frontend -- isso vale para Vite, Next.js, React, Angular, etc.

A seguranca real do Supabase nao vem de esconder a anon key, e sim das **politicas de RLS** (Row Level Security) que voce ja tem ativas. A anon key sozinha nao da acesso a nada que as RLS nao permitam.

O que o **service_role_key** (esse sim secreto) faria seria perigoso -- mas ele NUNCA esta no `.env` do frontend, ele fica como secret do Supabase e so e usado em edge functions.

**Acoes que farei na Parte 1:**
1. Adicionar `.env` ao `.gitignore` (boa pratica, mesmo as chaves sendo publicas, evita commits acidentais de secrets futuros).
2. Criar um `.env.example` documentando quais variaveis o projeto espera.
3. Rodar o linter de seguranca do Supabase para confirmar que as RLS estao corretas (ja que e nelas que a seguranca real se apoia).
4. Adicionar uma secao no `README.md` explicando publicamente que essas chaves sao publicas e que a seguranca esta nas RLS -- assim qualquer um vendo o repo entende.

Se voce quiser remover o `.env` do historico do Git que ja foi enviado, isso precisa ser feito manualmente no GitHub (com `git filter-repo` ou similar) -- Lovable nao reescreve historico do Git. Mas, repito, **nao ha risco real** porque essas chaves sao publicas.

### Parte 2 -- Reorganizacao feature-based

Estrutura atual (bagunca):
```
src/
  components/        (mistura UI + dominio)
  contexts/AuthContext.tsx
  hooks/             (mistura utils + dados)
  pages/             (tudo plano: Activities, MyRegistrations, admin/*)
  data/, types/, lib/
```

Estrutura nova:

```text
src/
  app/                          rotas + providers raiz
    App.tsx
    routes.tsx
    providers.tsx               (QueryClient, Auth, Tooltip, Toaster)

  features/
    auth/
      context/AuthContext.tsx
      hooks/useAuth.ts
      pages/
        Login.tsx
        Register.tsx
      components/
        ProtectedRoute.tsx
        AdminRoute.tsx

    activities/
      hooks/useActivities.ts
      components/
        ActivityCard.tsx
        StatusBadge.tsx
      pages/
        Activities.tsx
        ActivityDetail.tsx
        Home.tsx

    registrations/
      hooks/useRegistrations.ts
      pages/
        MyRegistrations.tsx

    admin/
      layouts/AdminLayout.tsx
      pages/
        Dashboard.tsx
        AdminActivities.tsx
        AdminRegistrations.tsx

    profile/
      pages/Profile.tsx

  shared/
    components/
      Navbar.tsx
      NavLink.tsx
      ui/                       (shadcn -- mantem todo aqui)
    hooks/
      use-mobile.tsx
      use-toast.ts
    lib/
      utils.ts
    types/
      index.ts

  integrations/
    supabase/                   (gerado, nao mexer)

  pages/
    NotFound.tsx                (paginas "soltas" que nao pertencem a uma feature)
    Index.tsx

  main.tsx
  index.css
  App.css
```

### Como sera feito

1. **Criar a nova estrutura** movendo os arquivos para `features/*` e `shared/*`.
2. **Atualizar todos os imports** em cada arquivo movido. Como usamos o alias `@/`, na maior parte dos casos basta trocar `@/components/ActivityCard` por `@/features/activities/components/ActivityCard`, etc.
3. **Extrair providers** de `App.tsx` para `app/providers.tsx` e rotas para `app/routes.tsx`, deixando o `App.tsx` fino.
4. **Mover** `AdminLayout`, `AuthContext`, hooks de dados (`useActivities`, `useRegistrations`) para suas features.
5. **Manter `src/integrations/supabase/`** intocado (e gerado pelo Lovable).
6. **Manter `src/components/ui/`** dentro de `shared/components/ui/` (ou alternativamente deixar em `src/components/ui` se preferir nao mexer no shadcn -- recomendo manter o caminho original do shadcn para nao quebrar futuras adicoes via CLI). **Decisao:** vou manter `src/components/ui/` no lugar original e atualizar apenas `components.json` se necessario, para nao quebrar o shadcn.

Ajuste final entao: `shared/components/ui/` **nao** sera usado; `ui/` continua em `src/components/ui/`. O resto dos componentes compartilhados vai para `src/shared/components/`.

### Arquivos afetados

- Movimentacao: ~20 arquivos para novos caminhos
- Imports atualizados: `App.tsx`, `main.tsx`, todas as pages, todos os componentes que se referenciam
- Novos: `src/app/providers.tsx`, `src/app/routes.tsx`, `.env.example`, atualizacao de `.gitignore` e `README.md`
- Sem mudancas: `src/integrations/supabase/*`, `src/components/ui/*`, banco de dados, RLS, edge functions

### O que nao muda

- Nenhuma logica de negocio, nenhum schema de banco, nenhuma RLS.
- Comportamento da aplicacao identico apos o refactor.
- PWA (`manifest.json`, icones) intocado.
