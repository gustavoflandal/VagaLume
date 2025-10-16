# Script para testar a API VagaLume
Write-Host "🧪 Testando API VagaLume" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# 1. Testar rota raiz
Write-Host "1️⃣ Testando rota raiz (GET /)..." -ForegroundColor Yellow
try {
    $root = Invoke-RestMethod -Uri 'http://localhost:3001/' -Method GET
    Write-Host "✅ Rota raiz OK" -ForegroundColor Green
    Write-Host "   Versão: $($root.version)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro na rota raiz: $_" -ForegroundColor Red
    exit 1
}

# 2. Testar login
Write-Host "`n2️⃣ Testando login (POST /api/auth/login)..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = 'demo@vagalume.com.br'
        password = 'Demo@2025'
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json'
    $token = $loginResponse.data.tokens.accessToken
    Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "   Usuário: $($loginResponse.data.user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.data.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro no login: $_" -ForegroundColor Red
    exit 1
}

# 3. Testar perfil do usuário
Write-Host "`n3️⃣ Testando perfil (GET /api/users/me)..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $profile = Invoke-RestMethod -Uri 'http://localhost:3001/api/users/me' -Method GET -Headers $headers
    Write-Host "✅ Perfil obtido com sucesso!" -ForegroundColor Green
    Write-Host "   Nome: $($profile.data.name)" -ForegroundColor Gray
    Write-Host "   Email: $($profile.data.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao obter perfil: $_" -ForegroundColor Red
}

# 4. Testar listagem de contas
Write-Host "`n4️⃣ Testando contas (GET /api/accounts)..." -ForegroundColor Yellow
try {
    $accounts = Invoke-RestMethod -Uri 'http://localhost:3001/api/accounts' -Method GET -Headers $headers
    Write-Host "✅ Contas obtidas com sucesso!" -ForegroundColor Green
    Write-Host "   Total de contas: $($accounts.data.Count)" -ForegroundColor Gray
    foreach ($account in $accounts.data) {
        Write-Host "   - $($account.name): R$ $($account.balance)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao obter contas: $_" -ForegroundColor Red
}

# 5. Testar listagem de categorias
Write-Host "`n5️⃣ Testando categorias (GET /api/categories)..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri 'http://localhost:3001/api/categories' -Method GET -Headers $headers
    Write-Host "✅ Categorias obtidas com sucesso!" -ForegroundColor Green
    Write-Host "   Total de categorias: $($categories.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao obter categorias: $_" -ForegroundColor Red
}

# 6. Testar listagem de transações
Write-Host "`n6️⃣ Testando transações (GET /api/transactions)..." -ForegroundColor Yellow
try {
    $transactions = Invoke-RestMethod -Uri 'http://localhost:3001/api/transactions' -Method GET -Headers $headers
    Write-Host "✅ Transações obtidas com sucesso!" -ForegroundColor Green
    Write-Host "   Total de transações: $($transactions.data.transactions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao obter transações: $_" -ForegroundColor Red
}

# 7. Testar criação de nova conta
Write-Host "`n7️⃣ Testando criação de conta (POST /api/accounts)..." -ForegroundColor Yellow
try {
    $newAccountBody = @{
        name = 'Conta Teste'
        type = 'SAVINGS'
        balance = 1000
        currency = 'BRL'
    } | ConvertTo-Json

    $newAccount = Invoke-RestMethod -Uri 'http://localhost:3001/api/accounts' -Method POST -Body $newAccountBody -ContentType 'application/json' -Headers $headers
    Write-Host "✅ Conta criada com sucesso!" -ForegroundColor Green
    Write-Host "   ID: $($newAccount.data.id)" -ForegroundColor Gray
    Write-Host "   Nome: $($newAccount.data.name)" -ForegroundColor Gray
    Write-Host "   Saldo: R$ $($newAccount.data.balance)" -ForegroundColor Gray
    $testAccountId = $newAccount.data.id
} catch {
    Write-Host "❌ Erro ao criar conta: $_" -ForegroundColor Red
}

# 8. Testar atualização de conta
if ($testAccountId) {
    Write-Host "`n8️⃣ Testando atualização de conta (PUT /api/accounts/$testAccountId)..." -ForegroundColor Yellow
    try {
        $updateAccountBody = @{
            name = 'Conta Teste Atualizada'
        } | ConvertTo-Json

        $updatedAccount = Invoke-RestMethod -Uri "http://localhost:3001/api/accounts/$testAccountId" -Method PUT -Body $updateAccountBody -ContentType 'application/json' -Headers $headers
        Write-Host "✅ Conta atualizada com sucesso!" -ForegroundColor Green
        Write-Host "   Novo nome: $($updatedAccount.data.name)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Erro ao atualizar conta: $_" -ForegroundColor Red
    }

    # 9. Testar exclusão de conta
    Write-Host "`n9️⃣ Testando exclusão de conta (DELETE /api/accounts/$testAccountId)..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "http://localhost:3001/api/accounts/$testAccountId" -Method DELETE -Headers $headers
        Write-Host "✅ Conta excluída com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao excluir conta: $_" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Testes concluídos!" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan
