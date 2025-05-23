# 🧩 Kanbanwoot

Interface web estilo Kanban integrada ao **Chatwoot**, utilizando o campo personalizado `kanban` (tipo lista) para visualizar e mover contatos entre etapas diretamente na interface.

![screenshot](./screenshot.png)

## 🚀 Funcionalidades

- 📥 Carrega contatos do Chatwoot usando o campo customizado `kanban`
- 🔄 Estágios definidos dinamicamente pelos valores cadastrados no custom attribute
- 🧲 Interface com drag and drop usando `react-beautiful-dnd`
- ⚡ Atualização em tempo real com API REST do Chatwoot
- 🎨 UI moderna com Tailwind CSS

---

## 🛠 Tecnologias

- React (com Hooks)
- Tailwind CSS
- Axios
- Chatwoot API
- react-beautiful-dnd

---

## 📦 Instalação

```bash
git clone https://github.com/seu-usuario/kanbanwoot.git
cd kanbanwoot
npm install
```

### 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz com as credenciais da API do Chatwoot:

```env
REACT_APP_CHATWOOT_API_BASE=https://chatwoot.seudominio.com
REACT_APP_ACCOUNT_ID=1
REACT_APP_API_TOKEN=SEU_TOKEN_DE_API
```

### ▶️ Rodar localmente

```bash
npm start
```

---

## 🐳 Deploy com Docker + Easypanel

Este projeto está pronto para ser publicado via Docker no Easypanel.

Exemplo de `Dockerfile`:

```Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install && npm run build

RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
```

Configure no Easypanel para expor a porta 3000.

---

## 🔧 Melhorias futuras

- Filtragem por tags, agentes ou inbox
- Integração com histórico de conversas
- Login com autenticação de operadores Chatwoot
