  CatFact & Giphy App

Aplicación fullstack que muestra datos curiosos sobre gatos y un GIF relacionado. El backend está construido con ASP.NET Core y el frontend con React + Vite. Todo se ejecuta de forma orquestada con Docker.

##  Tecnologías

- Backend: .NET 8 + SQLite
- Frontend: React + Vite + Tailwind CSS
- API externa: Cat Facts + Giphy
- Contenedores: Docker & Docker Compose

---

 Ejecución local con Docker

 Requisitos

- Tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/)

##Comandos

1. Clona el repositorio y levanta el servicio :


git clone https://github.com/alipaezd/catfact-giphy-app-.git
cd catfact-giphy-app-a


docker compose up --build

Accede a la app desde tu navegador:

Frontend: http://localhost:3000

Backend API (para pruebas): http://localhost:5000/api/fact
