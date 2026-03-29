# 📌 SyntrixOS

Aplicação pessoal integrada para centralizar recursos financeiros, acadêmicos, produtividade e saúde em um único ambiente seguro.

---

# 🚀 Stack Tecnológica

| Camada         | Tecnologia |
| -------------- | ---------- |
| Front-end      | Next.js    |
| Backend Core   | Supabase   |
| Autenticação   | Clerk      |

---

# 🧠 Arquitetura Geral

A aplicação utiliza uma arquitetura híbrida moderna, separando responsabilidades entre frontend, backend seguro e banco de dados.

```
Next.js (Frontend)
   ↓
NestJS (Backend seguro / integrações)
   ↓
Supabase (Banco + RLS)
```

---

# 🔐 Segurança

A aplicação foi projetada com foco em segurança desde a base:

* Autenticação obrigatória (Clerk)
* Autenticação Multifator (MFA)
* Tokens nunca expostos no frontend
* Criptografia em trânsito (HTTPS/TLS)
* Criptografia em repouso (Supabase)
* Controle de acesso por usuário (RLS)
* Backend intermediário (NestJS) para proteção de APIs externas
* Logs de auditoria

---

# 🧩 Módulos

## 💰 Financeiro

**Funcionalidades**

* Integração com Open Finance
* Dashboard com gráficos e relatórios
* Contas e investimentos

**Arquitetura**

* NestJS faz integração com APIs externas (Belvo / Pluggy)
* Tokens armazenados de forma criptografada no Supabase

---

## 🏋️ Treinos

**Funcionalidades**

* Fichas personalizadas
* Histórico de treinos
* Acompanhamento de progresso

---

## 🎓 Faculdade

**Funcionalidades**

* Integração com Canvas
* Matérias, atividades e prazos
* Notificações

**Arquitetura**

* OAuth2 gerenciado via NestJS
* Sincronização periódica via jobs

---

## 📁 Projetos

**Funcionalidades**

* Kanban (To-do, Doing, Done)
* Gestão de tarefas
* Prazos e status

---

## 💡 Ideias

**Funcionalidades**

* Bloco de notas
* Tags e categorias
* Busca rápida

---

# 🧱 Responsabilidades por Camada

## Front-end (Next.js)

* Interface do usuário
* Consumo de APIs
* Integração com Clerk

## Backend Seguro (NestJS)

* Integração com APIs externas
* Proteção de tokens sensíveis
* Validação de dados
* Regras de negócio
* Logs e auditoria

## Backend Core (Supabase)

* Banco PostgreSQL
* Row Level Security (RLS)
* Storage
* Queries e persistência

---

# 🔄 Fluxo de Dados

1. Usuário autentica via Clerk
2. Frontend obtém token JWT
3. Requisições seguem para NestJS
4. NestJS valida e processa dados
5. NestJS se comunica com Supabase
6. Integrações externas são feitas apenas via NestJS

---

# 🛡️ Controle de Acesso

* Isolamento total por usuário
* Implementado com RLS no Supabase
* Validação de sessão no NestJS

---

# 📊 Logs e Auditoria

* Registro de login
* Alterações críticas
* Acesso a integrações externas

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

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# NestJS
SUPABASE_SERVICE_ROLE_KEY=
OPEN_FINANCE_API_KEY=
CANVAS_CLIENT_ID=
CANVAS_CLIENT_SECRET=
```

## 4. Rodar projeto

```bash
npm run dev
```

---

# 🗄️ Modelagem do Banco

(Mantida conforme estrutura anterior — Supabase como fonte única de dados)

---

# 🔐 RLS (Exemplo)

```sql
CREATE POLICY "Users can only access their own data"
ON table_name
FOR ALL
USING (auth.uid() = user_id);
```

---

# 📊 Índices

* user_id
* created_at
* due_date

---

# 🧪 Testes

A aplicação inclui uma estratégia inicial de testes para garantir confiabilidade e segurança.

## 🔹 Tipos de Teste

* Testes unitários (NestJS)
* Testes de integração (APIs e banco)
* Testes de autenticação (Clerk)

## 🔹 Ferramentas

* Jest (testes unitários e integração)
* Supertest (testes de API - NestJS)

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
it('should return user data', async () => {
  const result = await service.getUser(userId);
  expect(result).toBeDefined();
});
```

### Teste de Integração (API)

```ts
request(app.getHttpServer())
  .get('/finance/accounts')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

---

# 🚧 Roadmap

* App mobile (React Native)
* Integração com calendário
* IA para insights
* Dashboard unificado
* Microserviços futuros (NestJS)

---

# 👨‍💻 Autor

Projeto pessoal focado em produtividade, segurança e arquitetura moderna.
