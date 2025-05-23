# 🧩 Chatwoot Kanban Board

Interface web moderna estilo Kanban integrada ao **Chatwoot**, utilizando os **Custom Attributes** (campo `kanban` do tipo lista) para visualizar e mover contatos entre estágios.

![screenshot](./screenshot.png)

## 🚀 Funcionalidades

- 📥 Carrega contatos do Chatwoot com base no campo personalizado `kanban`
- 🔄 Estágios do Kanban definidos dinamicamente pelos valores do campo customizado
- 🧲 Interface com **drag and drop** usando `react-beautiful-dnd`
- ⚡ Atualização otimista e sincronização com API REST do Chatwoot
- 🎨 UI moderna com **Tailwind CSS**

---

## 🛠 Tecnologias

- React + Hooks
- Tailwind CSS
- Axios
- Chatwoot API
- react-beautiful-dnd

---

## 📦 Instalação

```bash
git clone https://github.com/seu-usuario/chatwoot-kanban.git
cd chatwoot-kanban
npm install
