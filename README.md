# AgendaCar

Aplicação web para aluguel e agendamento de veículos, desenvolvida como projeto Expotech do 4º semestre de ADS.

O sistema permite que usuários consultem carros disponíveis, realizem reservas e acompanhem seus agendamentos. Também possui uma área administrativa para gerenciamento da frota e um chatbot integrado para suporte ao usuário.

---

## Sobre o Projeto

O **AgendaCar** foi desenvolvido com o objetivo de simular uma plataforma de locação de veículos, integrando front-end, back-end, banco de dados, documentação de API e chatbot.

A aplicação contempla dois perfis principais:

- **Usuário final:** consulta veículos, realiza reservas e acompanha seus agendamentos.
- **Administrador:** gerencia os veículos cadastrados na plataforma.

Além disso, o projeto conta com um chatbot integrado ao Rasa, capaz de responder dúvidas sobre reservas, veículos, pagamento, login e uso geral da plataforma.

---

## Funcionalidades

### Usuário

- Cadastro e login;
- Visualização de carros disponíveis;
- Filtros e ordenação de veículos;
- Página de detalhes do carro;
- Criação de reservas;
- Consulta de reservas;
- Cancelamento de reservas;
- Chatbot de suporte.

### Administrador

- Acesso ao painel administrativo;
- Cadastro de carros;
- Edição de carros;
- Remoção de carros;
- Controle de preço, imagem, capacidade, transmissão e disponibilidade.

### Chatbot

O chatbot auxilia o usuário com dúvidas sobre:

- Reserva de veículos;
- Consulta de carros;
- Pagamento;
- Login e cadastro;
- Área administrativa;
- Suporte geral.

---

## Tecnologias Utilizadas

### Front-end

- React
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Framer Motion
- Lucide React

### Back-end

- Node.js
- Express
- TypeScript
- Sequelize
- PostgreSQL
- JWT
- Swagger

### Chatbot

- Python
- Rasa

---

## Arquitetura

O projeto utiliza uma arquitetura em camadas, separando responsabilidades entre interface, API, regras de negócio, persistência de dados e chatbot.

```txt
Usuário
  ↓
Front-end React + Vite
  ↓
Back-end Node.js + Express + TypeScript
  ↓
Banco de Dados PostgreSQL
```

Fluxo do chatbot:

```txt
Usuário
  ↓
Front-end
  ↓
Back-end /chatbot
  ↓
Rasa API
  ↓
Back-end
  ↓
Front-end
```

---

## Estrutura do Projeto

```txt
Agendacar/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── seeders/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── chatbot-rasa/
│   ├── data/
│   ├── config.yml
│   └── domain.yml
│
├── docs/
│   └── requisitos.md
│
└── README.md
```

---

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Git
- Node.js
- npm
- Python
- PostgreSQL ou uma conta no Supabase

Versões recomendadas:

```txt
Node.js 18+
npm 9+
Python 3.10+
```

---

## Como Executar o Projeto

Clone o repositório:

```bash
git clone https://github.com/Lefanyway/Agendacar.git
cd Agendacar
```

---

### 1. Back-end

Acesse a pasta do back-end:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
copy .env.example .env
```

Configure o arquivo `backend/.env`:

```env
PORT=3001
DATABASE_URL=postgres://usuario:senha@localhost:5432/agendacar
JWT_SECRET=sua_chave_secreta
FRONTEND_URL=http://localhost:5173
RASA_BASE_URL=http://localhost:5005
```

Execute o build:

```bash
npm run build
```

Popule o banco com os carros iniciais:

```bash
npm run seed:carros
```

Crie o usuário administrador:

```bash
npm run seed:admin
```

Inicie o servidor:

```bash
npm run dev
```

A API ficará disponível em:

```txt
http://localhost:3001
```

---

### 2. Front-end

Em outro terminal, acesse a pasta do front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001
```

Inicie a aplicação:

```bash
npm run dev
```

O front-end ficará disponível em:

```txt
http://localhost:5173
```

---

### 3. Chatbot Rasa

Em outro terminal, acesse a pasta do chatbot:

```bash
cd chatbot-rasa
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual.

No Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instale o Rasa:

```bash
python -m pip install --upgrade pip setuptools wheel
python -m pip install rasa
```

Treine o modelo:

```bash
python -m rasa train
```

Execute o servidor do Rasa:

```bash
python -m rasa run --enable-api --cors "*"
```

O Rasa ficará disponível em:

```txt
http://localhost:5005
```

---

## Acessos

| Serviço | URL |
|---|---|
| Front-end | `http://localhost:5173` |
| Back-end | `http://localhost:3001` |
| Health Check | `http://localhost:3001/health` |
| Swagger | `http://localhost:3001/api-docs` |
| Rasa | `http://localhost:5005` |

---

## Credenciais de Administrador

Após executar o seed de administrador:

```bash
npm run seed:admin
```

Use:

```txt
E-mail: admin@agendacar.com
Senha: admin123
```

---

## Documentação da API

A documentação dos endpoints está disponível via Swagger:

```txt
http://localhost:3001/api-docs
```

A API possui endpoints para:

- Autenticação;
- Usuários;
- Carros;
- Reservas;
- Recomendações;
- Chatbot;
- Health check.

---

## Critérios Acadêmicos Atendidos

| Critério | Implementação |
|---|---|
| Planejamento de requisitos | Documentação em `docs/requisitos.md` |
| Interface e Design Web | Interface responsiva em React |
| Área do usuário final | Login, listagem de carros, reservas e chatbot |
| Área administrativa | CRUD de carros com acesso restrito |
| Front-end consumindo API | Axios consumindo API REST |
| Back-end RESTful | Node.js, Express e TypeScript |
| CRUD | Operações de criação, leitura, edição e remoção |
| Banco de dados | PostgreSQL com Sequelize |
| Swagger | Documentação em `/api-docs` |
| Chatbot / IA | Rasa integrado ao back-end |
| Organização do código | Controllers, services, repositories, routes e models |

---
