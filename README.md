# 📌 SyntrixOS

Uma aplicação pessoal integrada para centralizar recursos financeiros, acadêmicos, produtividade e saúde em um único ambiente seguro.

---

# 🚀 Stack Tecnológica

* **Front-end:** Next.js
* **Back-end:** Supabase
* **Autenticação:** Clerk

---

# 🔐 Segurança

A aplicação foi projetada com foco em segurança:

* Autenticação obrigatória (Clerk)
* Autenticação Multifator (MFA)
* Criptografia em trânsito (HTTPS/TLS)
* Criptografia em repouso (Supabase)
* Controle de acesso baseado em usuário
* Logs de auditoria

---

# 🧩 Módulos da Aplicação

## 💰 Financeiro

### Funcionalidades

* Integração com Open Finance
* Dashboard com gráficos e relatórios
* Visualização de contas e investimentos

### Requisitos técnicos

* Consumo de API Open Finance
* Armazenamento seguro de tokens
* Criptografia de dados sensíveis

---

## 🏋️ Treinos

### Funcionalidades

* Integração com API de exercícios
* Criação de fichas personalizadas
* Histórico de treinos
* Acompanhamento de progresso

### Requisitos técnicos

* Banco de dados de exercícios
* Registro de sessões

---

## 🎓 Faculdade

### Funcionalidades

* Integração com Canvas Student API
* Visualização de matérias
* Atividades e prazos
* Notificações

### Requisitos técnicos

* OAuth com Canvas
* Sincronização periódica

---

## 📁 Projetos

### Funcionalidades

* Gestão de tarefas
* Kanban (To-do, Doing, Done)
* Prazos e status

### Requisitos técnicos

* CRUD de tarefas
* Organização por projeto

---

## 💡 Ideias

### Funcionalidades

* Bloco de notas digital
* Tags e categorias
* Busca rápida

### Requisitos técnicos

* Indexação de texto
* Sistema de tags

---

# 🧱 Arquitetura

## Front-end (Next.js)

* App Router
* Server Components
* API Routes (quando necessário)
* Integração com Clerk

## Back-end (Supabase)

* PostgreSQL
* Row Level Security (RLS)
* Storage (opcional)
* Edge Functions

## Autenticação (Clerk)

* Login seguro
* MFA
* Gestão de sessão

---

# 🔄 Fluxo de Dados

1. Usuário autentica via Clerk
2. Front-end obtém token seguro
3. Requisições são feitas ao Supabase
4. APIs externas são consumidas via backend seguro
5. Dados são armazenados com criptografia

---

# 🛡️ Controle de Acesso

* Cada usuário acessa apenas seus dados
* Implementação via RLS no Supabase
* Validação de sessão em todas as requisições

---

# 📊 Logs e Auditoria

* Registro de login
* Alterações em dados críticos
* Acessos aos módulos

---

# 📁 Estrutura de Pastas

```
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

# ⚙️ Setup do Projeto

## 1. Clonar repositório

```bash
git clone <repo>
cd project
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Configurar variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

## 4. Rodar projeto

```bash
npm run dev
```

---

# 📚 DOCUMENTAÇÃO DETALHADA

## 🔐 Autenticação

* Clerk gerencia login/logout
* Tokens JWT usados para comunicação
* MFA obrigatório para acesso

---

## 💰 Financeiro (Detalhado)

### Integração Open Finance

* Utilizar agregadores (ex: Belvo, Pluggy)
* Fluxo:

  1. Usuário conecta conta
  2. Token é armazenado com segurança
  3. Dados são sincronizados

### Segurança

* Nunca expor tokens no frontend
* Uso de Edge Functions para chamadas externas

---

## 🏋️ Treinos (Detalhado)

* API externa para exercícios
* Estrutura:

  * Exercícios
  * Treinos
  * Histórico

---

## 🎓 Faculdade (Detalhado)

### Canvas API

* OAuth2
* Endpoints principais:

  * Cursos
  * Tarefas
  * Notas

### Notificações

* Sistema de alertas baseado em datas

---

## 📁 Projetos (Detalhado)

* Estrutura Kanban:

  * Backlog
  * Em andamento
  * Concluído

---

## 💡 Ideias (Detalhado)

* Sistema tipo Notion simplificado
* Busca full-text

---

# 🗄️ Modelagem do Banco de Dados (Supabase)

A modelagem segue princípios de isolamento por usuário (multi-tenant), utilizando **Row Level Security (RLS)** para garantir que cada usuário acesse apenas seus próprios dados.

---

## 🔐 Tabela: users (referência)

> Gerenciada pelo Clerk (não armazenar senha no banco)

* id (uuid, PK)
* email (text)
* created_at (timestamp)

---

## 💰 Financeiro

### accounts

* id (uuid, PK)
* user_id (uuid, FK -> users.id)
* institution (text)
* name (text)
* type (text)
* balance (numeric)
* created_at (timestamp)

### transactions

* id (uuid, PK)
* user_id (uuid)
* account_id (uuid, FK -> accounts.id)
* amount (numeric)
* category (text)
* description (text)
* date (date)
* created_at (timestamp)

### investments

* id (uuid, PK)
* user_id (uuid)
* name (text)
* type (text)
* value (numeric)
* created_at (timestamp)

### finance_connections (Open Finance tokens)

* id (uuid, PK)
* user_id (uuid)
* provider (text)
* access_token (text, criptografado)
* refresh_token (text, criptografado)
* expires_at (timestamp)

---

## 🏋️ Treinos

### exercises

* id (uuid, PK)
* name (text)
* muscle_group (text)
* equipment (text)
* instructions (text)

### workouts

* id (uuid, PK)
* user_id (uuid)
* name (text)
* created_at (timestamp)

### workout_exercises

* id (uuid, PK)
* workout_id (uuid, FK -> workouts.id)
* exercise_id (uuid, FK -> exercises.id)
* sets (int)
* reps (int)
* weight (numeric)

### workout_history

* id (uuid, PK)
* user_id (uuid)
* workout_id (uuid)
* performed_at (timestamp)

---

## 🎓 Faculdade

### courses

* id (uuid, PK)
* user_id (uuid)
* canvas_id (text)
* name (text)

### assignments

* id (uuid, PK)
* course_id (uuid)
* title (text)
* due_date (timestamp)
* status (text)

### grades

* id (uuid, PK)
* course_id (uuid)
* value (numeric)

### canvas_connections

* id (uuid, PK)
* user_id (uuid)
* access_token (text, criptografado)
* refresh_token (text)

---

## 📁 Projetos

### projects

* id (uuid, PK)
* user_id (uuid)
* name (text)
* description (text)
* created_at (timestamp)

### tasks

* id (uuid, PK)
* project_id (uuid, FK -> projects.id)
* title (text)
* description (text)
* status (text) -- todo | doing | done
* due_date (timestamp)
* created_at (timestamp)

---

## 💡 Ideias

### ideas

* id (uuid, PK)
* user_id (uuid)
* title (text)
* content (text)
* created_at (timestamp)

### tags

* id (uuid, PK)
* name (text)

### idea_tags

* idea_id (uuid, FK -> ideas.id)
* tag_id (uuid, FK -> tags.id)

---

## 🔐 Políticas de Segurança (RLS)

Exemplo padrão para todas as tabelas com user_id:

```sql
CREATE POLICY "Users can only access their own data"
ON table_name
FOR ALL
USING (auth.uid() = user_id);
```

---

## 📊 Índices Recomendados

* index em user_id (todas as tabelas multi-tenant)
* index em created_at (ordenação)
* index em due_date (tarefas e assignments)

---

## 🔐 Boas Práticas

* Tokens sempre criptografados
* Nunca expor credenciais no frontend
* Uso de funções seguras (Edge Functions)
* Logs de acesso para tabelas críticas

---

# 🚧 Melhorias Futuras

* App mobile (React Native)
* Integração com calendário
* IA para insights financeiros
* Dashboard unificado

---

# 👨‍💻 Autor

Projeto pessoal para centralização e produtividade.
