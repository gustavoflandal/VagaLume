const API_URL = 'http://localhost:3001/api';

async function testSettings() {
  try {
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test@123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.data || !loginData.data.tokens || !loginData.data.tokens.accessToken) {
      console.log('❌ Login falhou - resposta:', loginData);
      return;
    }
    
    const token = loginData.data.tokens.accessToken;
    console.log('✅ Login realizado com sucesso');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Teste 1: GET /api/settings
    console.log('\n📋 Teste 1: Buscar configurações...');
    try {
      const getResponse = await fetch(`${API_URL}/settings`, { headers });
      const getData = await getResponse.json();
      if (getResponse.ok) {
        console.log('✅ GET /api/settings funcionou');
        console.log('Dados:', JSON.stringify(getData, null, 2));
      } else {
        console.log('❌ GET /api/settings falhou:', getData);
      }
    } catch (error) {
      console.log('❌ GET /api/settings erro:', error.message);
    }
    
    // Teste 2: PUT /api/settings
    console.log('\n📝 Teste 2: Atualizar configurações...');
    try {
      const updateResponse = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          currency: 'USD',
          theme: 'dark'
        })
      });
      const updateData = await updateResponse.json();
      if (updateResponse.ok) {
        console.log('✅ PUT /api/settings funcionou');
        console.log('Dados:', JSON.stringify(updateData, null, 2));
      } else {
        console.log('❌ PUT /api/settings falhou:', updateData);
      }
    } catch (error) {
      console.log('❌ PUT /api/settings erro:', error.message);
    }
    
    // Teste 3: POST /api/settings/reset
    console.log('\n🔄 Teste 3: Resetar configurações...');
    try {
      const resetResponse = await fetch(`${API_URL}/settings/reset`, {
        method: 'POST',
        headers
      });
      const resetData = await resetResponse.json();
      if (resetResponse.ok) {
        console.log('✅ POST /api/settings/reset funcionou');
        console.log('Dados:', JSON.stringify(resetData, null, 2));
      } else {
        console.log('❌ POST /api/settings/reset falhou:', resetData);
      }
    } catch (error) {
      console.log('❌ POST /api/settings/reset erro:', error.message);
    }
    
    // Teste 4: Alterar senha
    console.log('\n🔑 Teste 4: Alterar senha...');
    try {
      const passwordResponse = await fetch(`${API_URL}/users/me/password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          currentPassword: 'Test@123',
          newPassword: 'Test@1234'
        })
      });
      const passwordData = await passwordResponse.json();
      if (passwordResponse.ok) {
        console.log('✅ PUT /api/users/me/password funcionou');
        
        // Reverter senha
        await fetch(`${API_URL}/users/me/password`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            currentPassword: 'Test@1234',
            newPassword: 'Test@123'
          })
        });
        console.log('✅ Senha revertida');
      } else {
        console.log('❌ PUT /api/users/me/password falhou:', passwordData);
      }
    } catch (error) {
      console.log('❌ PUT /api/users/me/password erro:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testSettings();
