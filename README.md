# 📌 SyntrixOS

Aplicação pessoal integrada para centralizar recursos financeiros, acadêmicos, produtividade e saúde em um único ambiente seguro.

---

# 🚀 Stack Tecnológica

| Camada       | Tecnologia        |
| ------------ | ----------------- |
| Front-end    | Next.js           |
| Backend Core | Neon (PostgreSQL) |
| Autenticação | Clerk             |

---

# 🧠 Arquitetura Geral

A aplicação utiliza uma arquitetura híbrida moderna, separando responsabilidades entre frontend, backend seguro e banco de dados.

```
Next.js (Frontend)
   ↓
NodeJs (Backend seguro / integrações)
   ↓
Neon (PostgreSQL Serverless)
```

---

# 🔐 Segurança

A aplicação foi projetada com foco em segurança desde a base:

- Autenticação obrigatória (Clerk)
- Autenticação Multifator (MFA)
- Tokens nunca expostos no frontend
- Criptografia em trânsito (HTTPS/TLS)
- Criptografia em repouso (Neon)
- Controle de acesso por usuário (RLS no PostgreSQL)
- Backend intermediário (NestJS) para proteção de APIs externas
- Logs de auditoria

---

# 🧩 Módulos

## 💰 Financeiro

**Funcionalidades**

- Integração com Open Finance
- Dashboard com gráficos e relatórios
- Contas e investimentos

**Arquitetura**

- NestJS faz integração com APIs externas (Belvo / Pluggy)
- Tokens armazenados de forma criptografada no Neon

---

## 🏋️ Treinos

**Funcionalidades**

- Fichas personalizadas
- Histórico de treinos
- Acompanhamento de progresso

---

## 🎓 Faculdade

**Funcionalidades**

- Integração com Canvas
- Matérias, atividades e prazos
- Notificações

**Arquitetura**

- OAuth2 gerenciado via NestJS
- Sincronização periódica via jobs

---

## 📁 Projetos

**Funcionalidades**

- Kanban (To-do, Doing, Done)
- Gestão de tarefas
- Prazos e status

---

## 💡 Ideias

**Funcionalidades**

- Bloco de notas
- Tags e categorias
- Busca rápida

---

# 🧱 Responsabilidades por Camada

## Front-end (Next.js)

- Interface do usuário
- Consumo de APIs
- Integração com Clerk

## Backend Seguro (NestJS)

- Integração com APIs externas
- Proteção de tokens sensíveis
- Validação de dados
- Regras de negócio
- Logs e auditoria

## Backend Core (Neon / PostgreSQL)

- Banco PostgreSQL Serverless
- Row Level Security (RLS) via policies
- Conexão via `postgres.js` (postgres)
- Queries e persistência

---

# 🔄 Fluxo de Dados

1. Usuário autentica via Clerk
2. Frontend obtém token JWT
3. Requisições seguem para NestJS / API Routes
4. Backend valida e processa dados
5. Backend se comunica com Neon (PostgreSQL)
6. Integrações externas são feitas apenas via NestJS

---

# 🛡️ Controle de Acesso

- Isolamento total por usuário
- Implementado com RLS no PostgreSQL
- Validação de sessão no backend (Clerk `userId` mapeado para `users.id`)

---

# 📊 Logs e Auditoria

- Registro de login
- Alterações críticas
- Acesso a integrações externas

---

# 📁 Estrutura de Pastas

```
/frontend (Next.js)
/backend (NestJS)

/app
  /financeiro
  /treinos
  /faculdade
  /projetos
  /ideias

/components
/lib
/services
/hooks
```

---

# ⚙️ Setup

## 1. Clonar repositório

```bash
git clone <repo>
cd project
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx-region.neon.tech/dbname?sslmode=require

# Clerk Authentication
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_WEBHOOK_SECRET=

# External Integrations
OPEN_FINANCE_API_KEY=
CANVAS_CLIENT_ID=
CANVAS_CLIENT_SECRET=
```

## 4. Rodar migrações do banco

```bash
# As migrações estão em supabase/migrations/
# Execute no console SQL do Neon ou via psql
psql "$DATABASE_URL" -f supabase/migrations/20250612193000_create_ideas_tables.sql
psql "$DATABASE_URL" -f supabase/migrations/20250612200000_update_schema_for_ideas_and_future.sql
psql "$DATABASE_URL" -f supabase/migrations/20250613000000_create_complete_schema.sql
```

## 5. Rodar projeto

```bash
npm run dev
```

---

# 🗄️ Modelagem do Banco

As migrações SQL estão em `supabase/migrations/` (compatíveis com PostgreSQL/Neon):

- `20250612193000_create_ideas_tables.sql` — users, tags, ideas, idea_tags
- `20250612200000_update_schema_for_ideas_and_future.sql` — updates e índices
- `20250613000000_create_complete_schema.sql` — accounts, categories, transactions, projects, tasks, courses, course_modules, notes

---

# 🔐 RLS (Exemplo)

```sql
CREATE POLICY "Users can only access their own data"
ON table_name
FOR ALL
USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id')));
```

> **Nota:** Com Neon + Clerk, o RLS usa uma variável de sessão (`app.current_clerk_id`) definida no momento da query, em vez de `auth.jwt()` do Supabase.

---

# 📊 Índices

- user_id
- created_at
- due_date

---

# 🧪 Testes

A aplicação inclui uma estratégia inicial de testes para garantir confiabilidade e segurança.

## 🔹 Tipos de Teste

- Testes unitários (NestJS)
- Testes de integração (APIs e banco)
- Testes de autenticação (Clerk)

## 🔹 Ferramentas

- Vitest (testes unitários e integração)
- Supertest (testes de API - NestJS)

## 🔹 Estrutura de Testes

```
/backend
  /src
    /modules
  /test
    /unit
    /integration
```

## 🔹 Exemplos de Testes

### Teste Unitário (Service)

```ts
it("should return user data", async () => {
  const result = await service.getUser(userId);
  expect(result).toBeDefined();
});
```

### Teste de Integração (API)

```ts
request(app.getHttpServer())
  .get("/finance/accounts")
  .set("Authorization", `Bearer ${token}`)
  .expect(200);
```

---

# 🚧 Roadmap

- App mobile (React Native)
- Integração com calendário
- IA para insights
- Dashboard unificado
- Microserviços futuros (NestJS)

---

# 👨‍💻 Autor

# Projeto pessoal focado em produtividade, segurança e arquitetura moderna.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family from Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
