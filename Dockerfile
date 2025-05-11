# Étape 1 : build de l'application
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers package et installation des dépendances
COPY package.json package-lock.json* ./
RUN npm install

# Copie du code source dans l’image
COPY . .
COPY .env.local .env.local     

# Build de l'application Next.js
RUN npm run build

# Étape 2 : image finale minimaliste
FROM node:18-alpine

WORKDIR /app

# Copie uniquement le build depuis l’étape précédente
COPY --from=builder /app ./

# Déclare le port
EXPOSE 3000

# Lancer le serveur Next.js
CMD ["npm", "start"]
