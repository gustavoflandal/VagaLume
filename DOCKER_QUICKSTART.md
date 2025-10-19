# 🚀 VagaLume - Quick Start com Docker

## ⚡ Início Rápido

### 1️⃣ Descobrir seu IP
```powershell
ipconfig
```
Anote o **IPv4 Address** (ex: `192.168.1.21`)

### 2️⃣ Configurar API URL

Edite `docker-compose.yml` linha 53:
```yaml
VITE_API_URL: http://SEU_IP:3001/api
```

### 3️⃣ Subir containers
```bash
docker-compose up -d --build
```

### 4️⃣ Acessar

**Sua máquina:**
- http://localhost:8080

**Outros dispositivos na rede:**
- http://SEU_IP:8080

## 🔧 Comandos Úteis

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Rebuild
docker-compose up -d --build

# Limpar tudo (⚠️ apaga dados)
docker-compose down -v
```

## 🌐 Configurações Alternativas

### Apenas localhost
```bash
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

### Acesso em rede
```bash
# Edite docker-compose.network.yml primeiro
docker-compose -f docker-compose.yml -f docker-compose.network.yml up -d --build
```

## 🔒 Firewall (Opcional)

Para acesso de outros dispositivos:
```powershell
# Como Administrador
New-NetFirewallRule -DisplayName "VagaLume Frontend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "VagaLume Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

## 📊 Portas Usadas

- **8080**: Frontend (Nginx)
- **3001**: Backend (API)
- **3307**: MySQL (interno)

## ⚠️ Troubleshooting

### Erro "Failed to fetch"
- Verifique se o IP no `docker-compose.yml` está correto
- Teste: `curl http://SEU_IP:3001/api/health`

### Porta 8080 em uso
Altere no `docker-compose.yml`:
```yaml
ports:
  - "9090:80"  # Use porta 9090 ao invés de 8080
```

### Backend não conecta ao banco
```bash
docker-compose logs backend
docker-compose logs db
```

## 📖 Documentação Completa

Ver: `ACESSO_REDE.md`
