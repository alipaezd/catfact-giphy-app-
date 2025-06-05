FROM node:18-alpine AS build
WORKDIR /app

# Copia package.json y package-lock.json (si existe) e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Construye la aplicación React
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine AS final
# Copia la aplicación React construida desde la etapa de construcción al directorio HTML de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configuración personalizada de Nginx.
# La ruta de origen 'nginx.conf' es relativa al contexto de construcción del frontend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80 para el servidor Nginx
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]