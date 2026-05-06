# Portal Meninas Digitais UTFPR-CP

PWA para gestão de atividades e inscrições do programa Meninas Digitais.

## Stack
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Postgres + RLS)
- TanStack Query

## Estrutura de pastas

```
src/
  app/                  providers e rotas raiz
  features/             código organizado por domínio
    auth/
    activities/
    registrations/
    admin/
    profile/
  shared/               código reutilizável entre features
    components/
    types/
  components/ui/        primitivas shadcn (não mexer manualmente)
  integrations/supabase/  cliente e tipos gerados
  pages/                páginas avulsas (NotFound, Index)
```

## Variáveis de ambiente

As variáveis em `.env` são **públicas por design**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
- `VITE_SUPABASE_PROJECT_ID`

Tudo prefixado com `VITE_` é embutido no JavaScript do navegador durante o build.
Mesmo que esses valores não estivessem no repositório, qualquer pessoa abrindo o site
poderia lê-los no DevTools. **Não há como "criptografar" essas chaves num app frontend.**

A segurança real do backend vem das **políticas de Row Level Security (RLS)** do
Supabase, que controlam exatamente o que cada usuário pode ler/escrever. A anon key
sozinha não dá acesso a nada que as RLS não permitam explicitamente.

A `service_role_key` (essa sim secreta) **nunca** é colocada no `.env` do frontend —
ela fica armazenada como secret do Supabase e é usada apenas em edge functions.

Veja `.env.example` para o template.
