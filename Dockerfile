# Imagem base leve com suporte ao Node.js e bash
FROM node:18-alpine

# Atualiza os pacotes e instala bash + utilitários úteis
RUN apk update && apk add --no-cache bash curl nano

# Define o diretório de trabalho
WORKDIR /app

# Copia todos os arquivos para dentro da imagem
COPY . .

# Instala as dependências do projeto
RUN npm install

# Faz o build do React
RUN npm run build

# Instala o servidor estático 'serve'
RUN npm install -g serve

# Expõe a porta padrão do serve
EXPOSE 3000

# Comando para iniciar o app
CMD ["serve", "-s", "build", "-l", "3000"]
