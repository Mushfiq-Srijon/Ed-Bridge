# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project files
COPY EdBridge.API.csproj .
RUN dotnet restore

# Copy all source code
COPY . .
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

# Expose port (Render uses dynamic ports, but we set this)
EXPOSE 10000

# Set environment
ENV ASPNETCORE_URLS=http://+:10000

# Run the app
ENTRYPOINT ["dotnet", "EdBridge.API.dll"]