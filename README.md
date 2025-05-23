# 🧩 Kanbanwoot

Interface web estilo Kanban integrada ao **Chatwoot**, utilizando o campo personalizado `kanban` (tipo lista) para visualizar e mover contatos entre etapas diretamente na interface.

![screenshot](./screenshot.png)

## 🚀 Funcionalidades

- 📥 Carrega contatos do Chatwoot usando o campo customizado `kanban`
- 🔄 Estágios definidos dinamicamente pelos valores cadastrados no custom attribute
- 🧲 Interface com drag and drop usando `@hello-pangea/dnd`
- ⚡ Atualização em tempo real com API REST do Chatwoot
- 🎨 UI moderna com Tailwind CSS

---

## 🛠 Tecnologias

- React (com Hooks)
- Tailwind CSS
- Axios
- Chatwoot API
- @hello-pangea/dnd

---

## 📦 Instalação

```bash
git clone https://github.com/seu-usuario/kanbanwoot.git
cd kanbanwoot
npm install
```

### 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais da API do Chatwoot:

```env
REACT_APP_CHATWOOT_TOKEN=seu_token_aqui
REACT_APP_ACCOUNT_ID=1
REACT_APP_API_URL=https://app.chatwoot.com
REACT_APP_API_INBOX_ID=1
```

### ▶️ Rodar localmente

```bash
npm start
```

---

## 🐳 Deploy com Docker

Este projeto está pronto para ser publicado via Docker.

Exemplo de `Dockerfile` (já incluso no repositório):

```dockerfile
# build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable as production
COPY --from=build /app/build /usr/share/nginx/html
COPY ./dockerizer/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

Acesse a aplicação na porta 3000 após o deploy.

---

## 🔧 Melhorias futuras

- Filtragem por tags, agentes ou inbox
- Integração com histórico de conversas
- Login com autenticação de operadores Chatwoot
