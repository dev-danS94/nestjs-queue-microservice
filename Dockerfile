# --- 1. Etapa de "Builder" (Construcción) ---
# CAMBIO IMPORTANTE: Usamos 'slim' en lugar de 'alpine' para evitar errores de SSL en Mac
FROM node:22-slim AS builder

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el código
COPY . .

# Compilamos
RUN npm run build

# --- 2. Etapa de "Production" (Producción) ---
FROM node:22-slim

WORKDIR /usr/src/app

# Copiamos dependencias
COPY package*.json ./

# Instalamos SOLO dependencias de producción
RUN npm install --omit=dev

# Copiamos el build desde la etapa anterior
COPY --from=builder /usr/src/app/dist ./dist

# Iniciar app
CMD [ "node", "dist/main" ]