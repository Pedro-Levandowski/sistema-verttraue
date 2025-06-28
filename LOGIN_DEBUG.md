
# 🔧 Sistema Vertttraue - Debug Completo do Login

## ✅ Status Atual
- ✅ Backend 100% completo e funcional
- ✅ Frontend integrado com logs detalhados
- ✅ Sistema de login obrigatório ativo
- ✅ Debug tools integrados na página de login

## 🚀 Passos para Resolver Problemas de Login

### **Passo 1: Verificar Backend**
```bash
cd backend
npm install
npm run dev
```
**Deve aparecer:** "🚀 Servidor vertttraue rodando na porta 3001"

### **Passo 2: Verificar Banco de Dados**

1. **Criar arquivo `.env` em `backend/`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vertttraue_db
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
JWT_SECRET=vertttraue_secret_key_2024
FRONTEND_URL=http://localhost:8080
```

2. **Conectar ao PostgreSQL e verificar:**
```sql
-- Conectar ao banco
psql -U postgres -d vertttraue_db

-- Verificar se tabela existe
\dt usuarios_admin

-- Verificar usuários existentes
SELECT * FROM usuarios_admin;

-- Se tabela não existir, criar:
CREATE TABLE usuarios_admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Passo 3: Criar Usuário Admin**

**Opção A - Via SQL:**
```sql
-- Inserir usuário admin com senha "123456"
INSERT INTO usuarios_admin (username, password_hash) 
VALUES ('admin@vertttraue.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
```

**Opção B - Via Interface:**
1. Abrir página de login
2. Clicar em "👤 Criar Usuário Teste"
3. Verificar mensagem de sucesso

### **Passo 4: Testar Login**

1. **Credenciais padrão:**
   - E-mail: `admin@vertttraue.com`
   - Senha: `123456`

2. **Usar ferramentas de debug:**
   - Clicar em "🔍 Testar Backend" primeiro
   - Depois tentar fazer login
   - Verificar console do navegador (F12)
   - Verificar logs do backend no terminal

## 🔍 Diagnóstico de Problemas

### **Logs do Console (F12)**
Abrir console do navegador e verificar:
- ✅ Mensagens começando com 🔐, 📤, 📥
- ❌ Erros de rede ou CORS
- ❌ Erros de autenticação

### **Logs do Backend**
Verificar terminal onde roda `npm run dev`:
- ✅ Mensagens de conexão com banco
- ✅ Logs detalhados do processo de login
- ❌ Erros de conexão ou SQL

### **Problemas Comuns e Soluções**

| Problema | Solução |
|----------|---------|
| "Failed to fetch" | Backend não está rodando na porta 3001 |
| "Credenciais inválidas" | Usuário não existe no banco |
| "Erro interno do servidor" | Verificar logs do backend |
| "Token não fornecido" | Problema na geração/envio do token |
| Página branca | Verificar console por erros JavaScript |

### **Comandos de Emergência**

```bash
# Resetar completamente o banco
psql -U postgres -c "DROP DATABASE IF EXISTS vertttraue_db;"
psql -U postgres -c "CREATE DATABASE vertttraue_db;"

# Recriar tabela e usuário
psql -U postgres -d vertttraue_db -c "
CREATE TABLE usuarios_admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios_admin (username, password_hash) 
VALUES ('admin@vertttraue.com', '\$2b\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
"
```

## 📞 Suporte Debug

Se ainda houver problemas:
1. Verificar TODOS os logs (frontend + backend)
2. Usar ferramentas de debug na página de login
3. Verificar conectividade: `curl http://localhost:3001/health`
4. Testar manualmente no banco: `SELECT * FROM usuarios_admin;`

---

**🎯 OBJETIVO:** Login funcionando 100% com `admin@vertttraue.com` / `123456`
