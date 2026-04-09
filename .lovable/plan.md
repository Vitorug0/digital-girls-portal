

## Migrar Portal Meninas Digitais para Supabase (fim dos dados mockados)

### O que muda
O sistema deixa de usar dados em memória (`mockData.ts`, `AuthContext` com mock users, `DataContext` com `useState`) e passa a usar o Supabase para autenticacao real, persistencia de dados e controle de acesso via RLS.

### Etapa 1 -- Criar tabelas e politicas no Supabase (migration SQL)

**Tabelas:**
- `profiles` (id uuid PK referencing auth.users, name text, email text, user_type text default 'externo', created_at timestamptz)
- `user_roles` (id uuid PK, user_id uuid referencing auth.users, role text default 'user', unique(user_id, role))
- `activities` (id uuid PK default gen_random_uuid(), title text, description text, type text, start_date timestamptz, end_date timestamptz, location text, total_slots int, available_slots int, status text default 'aberta', created_by uuid referencing auth.users, created_at timestamptz)
- `registrations` (id uuid PK default gen_random_uuid(), activity_id uuid referencing activities, user_id uuid referencing auth.users, status text default 'inscrita', created_at timestamptz default now())

**Trigger:** auto-create profile row on auth.users insert.

**Security definer function:** `has_role(uuid, text)` para evitar recursao em RLS.

**RLS policies:**
- `profiles`: users read own; admins read all
- `activities`: public read; admins insert/update/delete
- `registrations`: users read/insert/delete own; admins read all per activity
- `user_roles`: only security definer function reads

### Etapa 2 -- Reescrever AuthContext

Substituir mock login/register por `supabase.auth.signInWithPassword`, `supabase.auth.signUp` e `supabase.auth.onAuthStateChange`. O campo `user_type` vem da tabela `profiles`. O `isAdmin` consulta `user_roles` via a funcao `has_role` (chamada via RPC ou query direta na tabela profiles.user_type = 'interno').

Remover contas de teste hardcoded da pagina de Login.

### Etapa 3 -- Reescrever DataContext com hooks React Query

Substituir `useState` + mock data por hooks usando `@tanstack/react-query` e o client Supabase:

- `useActivities()` -- SELECT from activities
- `useActivity(id)` -- SELECT single activity
- `useCreateActivity()`, `useUpdateActivity()`, `useDeleteActivity()` -- mutations
- `useRegistrations(activityId)` -- SELECT registrations for an activity (admin)
- `useUserRegistrations()` -- SELECT registrations for current user joined with activities
- `useRegisterForActivity()` -- INSERT registration + decrement available_slots (via DB function or transaction)
- `useCancelRegistration()` -- UPDATE registration status + increment available_slots
- `useUpdateRegistrationStatus()` -- UPDATE registration status (presence)

A logica de controle de vagas (decremento/incremento atomico) sera feita via uma **database function** `register_for_activity(p_activity_id, p_user_id)` que valida vagas, duplicatas, status, e faz o INSERT + UPDATE atomicamente. Outra funcao `cancel_registration(p_registration_id)` faz o cancelamento + liberacao de vaga.

### Etapa 4 -- Atualizar todas as paginas

Cada pagina que hoje usa `useData()` passara a usar os hooks React Query:
- **Home, Activities, ActivityDetail** -- `useActivities()` / `useActivity(id)`
- **MyRegistrations** -- `useUserRegistrations()`
- **AdminDashboard** -- `useActivities()` + `useRegistrations()`
- **AdminActivities** -- mutations de CRUD
- **AdminRegistrations** -- `useRegistrations(activityId)` + `useUpdateRegistrationStatus()`
- **Login/Register** -- Supabase Auth direto
- **Profile** -- dados de `profiles`

### Etapa 5 -- Seed de dados iniciais

Inserir as 6 atividades de exemplo e criar um usuario admin de teste via Supabase Auth + insert em `user_roles`.

### Etapa 6 -- Limpar codigo morto

Remover `src/data/mockData.ts`, simplificar `DataContext` (ou remove-lo totalmente em favor dos hooks), remover mock users do `AuthContext`.

---

### Detalhes tecnicos

**Database functions (PL/pgSQL):**

1. `register_for_activity(p_activity_id uuid, p_user_id uuid)` -- retorna JSON com success/message. Verifica status, vagas, duplicata dentro de uma transacao. Faz INSERT em registrations e UPDATE available_slots.

2. `cancel_registration(p_registration_id uuid, p_user_id uuid)` -- verifica ownership, atualiza status para 'cancelada', incrementa available_slots.

3. `has_role(p_user_id uuid, p_role text)` -- security definer, consulta user_roles.

4. `handle_new_user()` -- trigger function que insere em profiles ao criar usuario.

**Arquivos novos:**
- `src/hooks/useActivities.ts` -- queries e mutations de activities
- `src/hooks/useRegistrations.ts` -- queries e mutations de registrations  
- `src/hooks/useAuth.ts` -- wrapper do Supabase Auth com profile data

**Arquivos modificados:**
- `src/contexts/AuthContext.tsx` -- reescrito para Supabase Auth
- `src/pages/*` -- todos atualizados para usar os novos hooks
- `src/types/index.ts` -- IDs passam a ser `string` (uuid), sem mudanca de interface

**Arquivos removidos:**
- `src/data/mockData.ts`
- `src/contexts/DataContext.tsx` (substituido pelos hooks)

