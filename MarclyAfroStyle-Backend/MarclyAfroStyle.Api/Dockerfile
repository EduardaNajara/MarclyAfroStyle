# Etapa de build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia o arquivo de projeto e restaura as dependências
COPY ["MarclyAfroStyle.Api.csproj", "./"]
RUN dotnet restore "MarclyAfroStyle.Api.csproj"

# Copia o restante do código e compila
COPY . .
RUN dotnet publish "MarclyAfroStyle.Api.csproj" -c Release -o /app/publish

# Etapa de execução (runtime)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MarclyAfroStyle.Api.dll"]
