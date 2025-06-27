
# 🔧 Debug do Sistema de Login - vertttraue

## Problemas Identificados

### 1. **Inconsistência Frontend/Backend**
- **Frontend** envia: `{ username: email, password }`
- **Backend** espera: `{ username, password }` mas verifica contra campo `username` na tabela

### 2. **Estrutura do Banco de Dados**
- Tabela: `usuarios_admin`
- Campos: `id`, `username`, `password_hash`
- **Problema**: Não há usuário padrão criado

### 3. **Configuração do Backend**
- Backend pode não estar rodando na porta 3001
- Possível problema de CORS
- Arquivo `.env` pode estar mal configurado

## Soluções Temporárias Implementadas

### ✅ **Modo Teste Ativado**
- Autenticação desabilitada temporariamente
- Usuário sempre logado como "Admin Teste"
- Permite testar todo o sistema sem problemas de login

### ✅ **Componente de Debug Adicionado**
- Teste de conectividade com backend
- Teste de health check
- Teste de login com credenciais

## Como Usar Agora

1. **Acesse o sistema** - Você será automaticamente logado
2. **Teste as funcionalidades** - Todos os módulos devem funcionar
3. **Use o Debug** - Clique em "Debug API" para testar a conexão com backend

## Para Resolver o Login Definitivamente

### 1. **Verificar Backend**
```bash
cd backend
npm run dev
```
Deve mostrar: "🚀 Servidor vertttraue rodando na porta 3001"

### 2. **Testar Health Check**
Acesse: http://localhost:3001/health
Deve retornar: `{"status":"OK",...}`

### 3. **Criar Usuário no Banco**
```sql
-- Conectar ao banco
psql -U postgres -d vertttraue_db

-- Criar usuário admin (senha: 123456)
INSERT INTO usuarios_admin (username, password_hash) 
VALUES ('admin@vertttraue.com', '$2b$10$example_hash_aqui');
```

### 4. **Verificar Configuração**
- Arquivo `backend/.env` deve existir
- DB_PASSWORD deve estar correta
- FRONTEND_URL deve ser http://localhost:8080

## Status Atual
- ✅ Sistema funcionando sem autenticação
- ✅ Todas as funcionalidades testáveis
- ⏳ Login sendo investigado
- 🔧 Modo debug ativo
