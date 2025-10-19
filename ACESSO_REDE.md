# 🌐 Configuração de Acesso em Rede - VagaLume

## 📋 Configurações Aplicadas

### 1. **Docker Compose**
- Backend exposto em: `0.0.0.0:3001` (todas as interfaces)
- Frontend exposto em: `0.0.0.0:80` (porta HTTP padrão)
- CORS configurado para aceitar qualquer origem (`*`)

### 2. **Nginx**
- Configurado para aceitar qualquer hostname
- Proxy reverso para API configurado
- Acesso via: `http://IP_DA_MAQUINA/api`

### 3. **Backend**
- CORS liberado para todas as origens
- JWT secrets atualizados para produção

## 🚀 Como Usar

### **Passo 1: Descobrir o IP da Máquina**

**Windows:**
```powershell
ipconfig
```
Procure por "IPv4 Address" na interface de rede ativa (ex: `192.168.1.100`)

**Linux/Mac:**
```bash
ip addr show
# ou
ifconfig
```

### **Passo 2: Configurar URL da API**

**IMPORTANTE:** Edite o arquivo `docker-compose.yml` e altere o IP na linha 53:

```yaml
environment:
  VITE_API_URL: http://SEU_IP_AQUI:3001/api  # Substitua pelo seu IP
```

**Ou use os arquivos de configuração prontos:**

**Para acesso LOCAL (apenas sua máquina):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

**Para acesso em REDE (outros dispositivos):**
```bash
# Edite docker-compose.network.yml com seu IP primeiro
docker-compose -f docker-compose.yml -f docker-compose.network.yml up -d --build
```

### **Passo 3: Subir os Containers**

```bash
# Parar containers antigos (se existirem)
docker-compose down

# Rebuild e subir novamente
docker-compose up -d --build
```

### **Passo 3: Verificar Status**

```bash
docker-compose ps
```

Deve mostrar 3 containers rodando:
- `vagalume-db` (MySQL)
- `vagalume-backend` (API)
- `vagalume-frontend` (Interface)

### **Passo 4: Testar Acesso**

**Na mesma máquina:**
- Frontend: http://localhost
- API: http://localhost:3001/api

**De outra máquina na rede:**
- Frontend: http://192.168.1.21:8080 (seu IP atual)
- API: http://192.168.1.21:3001/api

## 🔒 Configurações de Firewall

### **Windows Firewall**

1. Abrir "Windows Defender Firewall"
2. Clicar em "Configurações avançadas"
3. Criar regra de entrada:
   - **Porta 80** (Frontend)
   - **Porta 3001** (Backend API)

**Via PowerShell (como Administrador):**
```powershell
# Permitir porta 8080 (Frontend)
New-NetFirewallRule -DisplayName "VagaLume Frontend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow

# Permitir porta 3001 (Backend)
New-NetFirewallRule -DisplayName "VagaLume Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### **Linux (UFW)**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp
sudo ufw reload
```

## 📱 Acesso via Dispositivos Móveis

Após configurar, você pode acessar de:
- ✅ Smartphones na mesma rede Wi-Fi
- ✅ Tablets
- ✅ Outros computadores
- ✅ Smart TVs (se tiverem navegador)

**URL:** `http://SEU_IP_LOCAL`

## 🌍 Acesso pela Internet (Opcional)

Para acesso externo, você precisará:

### **Opção 1: Port Forwarding no Roteador**
1. Acessar configurações do roteador
2. Configurar port forwarding:
   - Porta externa 80 → IP_MAQUINA:80
   - Porta externa 3001 → IP_MAQUINA:3001
3. Acessar via IP público do roteador

### **Opção 2: Cloudflare Tunnel (Recomendado)**
```bash
# Instalar cloudflared
# Criar tunnel
cloudflared tunnel create vagalume

# Configurar tunnel
# Apontar para localhost:80
```

### **Opção 3: Ngrok (Temporário)**
```bash
ngrok http 80
```

## ⚠️ Considerações de Segurança

### **Para Rede Local (Atual):**
- ✅ Seguro para uso doméstico/escritório
- ✅ CORS aberto apenas para rede local
- ✅ Sem exposição à internet

### **Para Acesso Público:**
Se for expor à internet, **OBRIGATÓRIO**:

1. **HTTPS com certificado SSL**
   - Use Let's Encrypt
   - Configure nginx com SSL

2. **Restringir CORS**
   - Alterar `CORS_ORIGIN=*` para domínios específicos

3. **Rate Limiting**
   - Já configurado (1000 req/min)
   - Considere reduzir para 100 req/min

4. **Autenticação Forte**
   - Senhas fortes obrigatórias
   - Implementar 2FA

5. **Backup Regular**
   - Configurar backup automático do MySQL

## 🔧 Troubleshooting

### **Não consigo acessar de outra máquina**
1. Verificar se containers estão rodando: `docker-compose ps`
2. Testar acesso local primeiro: `http://localhost`
3. Verificar firewall do Windows/Linux
4. Verificar se está na mesma rede

### **Erro de CORS**
1. Verificar se `CORS_ORIGIN=*` está no `.env.docker`
2. Rebuild containers: `docker-compose up -d --build`
3. Limpar cache do navegador

### **API não responde**
1. Ver logs: `docker-compose logs backend`
2. Verificar se banco está saudável: `docker-compose ps`
3. Testar endpoint: `curl http://localhost:3001/api/health`

### **Frontend não carrega**
1. Ver logs: `docker-compose logs frontend`
2. Verificar build: `docker-compose build frontend`
3. Testar nginx: `docker exec vagalume-frontend nginx -t`

## 📊 Monitoramento

### **Ver logs em tempo real:**
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### **Verificar uso de recursos:**
```bash
docker stats
```

## 🔄 Atualização

Após fazer alterações:

```bash
# Rebuild e reiniciar
docker-compose down
docker-compose up -d --build

# Ou apenas reiniciar
docker-compose restart
```

## 📞 Suporte

- **Logs:** `docker-compose logs`
- **Status:** `docker-compose ps`
- **Reiniciar:** `docker-compose restart`
- **Parar:** `docker-compose down`
- **Limpar tudo:** `docker-compose down -v` (⚠️ apaga dados)

---

**✅ Configuração completa para acesso em rede local!**

🌐 Como Acessar Agora:
Sua máquina:

Frontend: http://localhost:8080
API: http://localhost:3001/api
Outros dispositivos na rede:

Frontend: http://192.168.1.21:8080
API: http://192.168.1.21:3001/api


