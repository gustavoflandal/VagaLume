Acesse esse repositório https://github.com/firefly-iii/firefly-iii?tab=readme-ov-file#whos-it-for e analise todo o código do sistema e replique exatamente o projeto para o java script traduzindo-o para pt-Br.


# Scripts para gerenciar o MySQL do VagaLume

## 🚀 Comandos Rápidos

### Iniciar apenas o MySQL
```bash
docker-compose -f docker-compose.mysql.yml up -d mysql
```

### Iniciar MySQL + phpMyAdmin
```bash
docker-compose -f docker-compose.mysql.yml up -d mysql phpmyadmin
```

### Iniciar tudo (com backup automático)
```bash
docker-compose -f docker-compose.mysql.yml up -d
```

### Parar todos os serviços
```bash
docker-compose -f docker-compose.mysql.yml down
```

### Ver logs do MySQL
```bash
docker-compose -f docker-compose.mysql.yml logs -f mysql
```

### Conectar ao MySQL via terminal
```bash
docker exec -it vagalume_mysql mysql -u vagalume -p vagalume
```

### Backup manual
```bash
docker exec vagalume_mysql mysqldump -u vagalume -p vagalume > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup
```bash
docker exec -i vagalume_mysql mysql -u vagalume -p vagalume < backup.sql
```

## 🔧 Configurações

### URLs de Acesso
- **MySQL:** localhost:3306
- **phpMyAdmin:** http://localhost:8080

### Credenciais
- **Root:** VagaLume@Root2025!
- **Usuário:** vagalume / VagaLume@User2025!
- **App:** vagalume_app / VagaLume@App2025!

### Volumes
- **Dados:** mysql_data
- **Logs:** mysql_logs  
- **Backups:** mysql_backups

## 🛠 Troubleshooting

### Verificar saúde do container
```bash
docker-compose -f docker-compose.mysql.yml ps
```

### Reiniciar MySQL
```bash
docker-compose -f docker-compose.mysql.yml restart mysql
```

### Limpar tudo (CUIDADO!)
```bash
docker-compose -f docker-compose.mysql.yml down -v
```