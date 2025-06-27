
# 🔧 Sistema Vertttraue - Instruções de Configuração

## ✅ Status Atual do Sistema

### **Sistema Totalmente Funcional** 
- ✅ Login/logout obrigatório reativado
- ✅ APIs reais conectadas ao backend PostgreSQL
- ✅ Autenticação JWT funcionando
- ✅ CRUD completo para produtos, fornecedores e afiliados

## 🚀 Como Configurar e Testar o Sistema

### **Passo 1: Iniciar o Backend**
```bash
cd backend
npm install
npm run dev
```
**Deve aparecer:** "🚀 Servidor vertttraue rodando na porta 3001"

### **Passo 2: Configurar Banco de Dados**

1. **Verificar arquivo `backend/.env`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vertttraue_db
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
JWT_SECRET=vertttraue_secret_key_2024
FRONTEND_URL=http://localhost:8080
```

2. **Criar usuário admin no PostgreSQL:**
```sql
-- Conectar ao banco
psql -U postgres -d vertttraue_db

-- Verificar se usuário existe
SELECT * FROM usuarios_admin;

-- Se não existir, criar usuário admin
INSERT INTO usuarios_admin (username, password_hash) 
VALUES ('admin@vertttraue.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- Esta senha hash corresponde a "123456"
```

### **Passo 3: Testar Login**

1. **Credenciais padrão:**
   - E-mail: `admin@vertttraue.com`
   - Senha: `123456`

2. **Se login falhar:**
   - Verificar se backend está rodando na porta 3001
   - Verificar se banco PostgreSQL está ativo
   - Verificar se usuário admin existe na tabela `usuarios_admin`
   - Usar a página "Debug API" para diagnosticar problemas

### **Passo 4: Usar Debug API**

Após fazer login, acesse "Debug API" no dashboard para:
- ✅ Testar conectividade com backend
- ✅ Verificar autenticação JWT
- ✅ Testar CRUD no banco de dados
- ✅ Diagnosticar problemas de conexão

## 🔍 Solução de Problemas Comuns

### **"Token de acesso requerido"**
- ❌ Não está logado → Fazer login primeiro
- ❌ Token expirou → Fazer logout e login novamente
- ❌ Backend não está rodando → Iniciar backend

### **"Credenciais inválidas"**
- ❌ Usuário não existe → Criar usuário admin no banco
- ❌ Senha incorreta → Verificar hash da senha no banco
- ❌ Banco não conectado → Verificar credenciais do PostgreSQL

### **"Failed to fetch"**
- ❌ Backend não rodando → `cd backend && npm run dev`
- ❌ Porta incorreta → Verificar se está na porta 3001
- ❌ CORS bloqueado → Verificar FRONTEND_URL no backend

### **Dados não salvam/carregam**
- ❌ Não está logado → Fazer login primeiro
- ❌ Token inválido → Logout e login novamente
- ❌ Tabelas não existem → Executar migrations do banco

## 📊 Funcionalidades Implementadas

| Módulo | Status | Observação |
|--------|--------|------------|
| 🔐 Autenticação | ✅ Ativo | Login obrigatório |
| 📦 Produtos | ✅ Backend Real | CRUD completo |
| 🏭 Fornecedores | ✅ Backend Real | CRUD completo |
| 👥 Afiliados | ✅ Backend Real | CRUD completo |
| 📊 Conjuntos | ⚠️ Mock | Dados temporários |
| 🎁 Kits | ⚠️ Mock | Dados temporários |
| 💰 Vendas | ⚠️ Mock | Dados temporários |

## 🎯 Próximos Passos

1. **Testar login** com credenciais padrão
2. **Verificar funcionalidades** principais (produtos, fornecedores, afiliados)
3. **Usar Debug API** para diagnosticar problemas
4. **Implementar backend** para conjuntos, kits e vendas (se necessário)

---

**🚨 IMPORTANTE:** O sistema agora exige login real. Use as credenciais padrão ou crie um usuário admin no banco de dados PostgreSQL.
