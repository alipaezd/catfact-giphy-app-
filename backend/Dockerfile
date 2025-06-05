# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src/backend

# Copiar solo el .csproj y restaurar
COPY backend/CatGifApi.csproj .
RUN dotnet restore CatGifApi.csproj

# Copiar el resto del código fuente
COPY backend/. .

# Publicar la app
RUN dotnet publish CatGifApi.csproj -c Release -o /app/publish
RUN mkdir -p /app/data

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000

ENTRYPOINT ["dotnet", "CatGifApi.dll"]
