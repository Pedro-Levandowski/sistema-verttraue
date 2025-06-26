
# Sistema de Gestão vertttraue

Sistema completo de gestão de estoque, vendas e afiliados com frontend React e backend Node.js + PostgreSQL.

## 🚀 Características

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + PostgreSQL
- **Autenticação**: JWT + bcrypt
- **Banco de Dados**: PostgreSQL com triggers e índices otimizados
- **Segurança**: Helmet, CORS, Rate Limiting
- **Deploy**: Fácil instalação em VPS com scripts automatizados

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

## 🔧 Instalação em VPS

### 1. Clonar o repositório
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Instalar dependências do frontend
```bash
npm install
```

### 3. Instalar e configurar o backend
```bash
# Instalar dependências do backend
npm install express pg cors helmet express-rate-limit bcrypt jsonwebtoken dotenv multer

# Executar script de instalação (irá configurar o banco)
chmod +x scripts/install.sh
./scripts/install.sh
```

### 4. Iniciar os serviços

**Frontend (desenvolvimento):**
```bash
npm run dev
```

**Backend:**
```bash
# Modo produção
npm run start

# Modo desenvolvimento (com nodemon)
npm run dev:backend
```

## 🗄️ Banco de Dados

### Estrutura
- **usuarios_admin**: Usuários administrativos
- **fornecedores**: Fornecedores dos produtos
- **afiliados**: Afiliados para vendas
- **produtos**: Catálogo de produtos
- **produto_fotos**: Fotos dos produtos
- **afiliado_estoque**: Controle de estoque por afiliado
- **conjuntos**: Agrupamento de produtos
- **kits**: Kits especiais de produtos
- **vendas**: Registro de vendas
- **venda_itens**: Itens das vendas

### Backup automático
```bash
npm run backup
```

## 🔐 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Produtos
- `GET /api/produtos` - Listar produtos
- `GET /api/produtos/:id` - Buscar produto
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

### Outras rotas
- Fornecedores: `/api/fornecedores`
- Afiliados: `/api/afiliados`
- Vendas: `/api/vendas`
- Conjuntos: `/api/conjuntos`
- Kits: `/api/kits`

## 🌍 Deploy em Produção

### Nginx (recomendado)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /caminho/para/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 (gerenciador de processos)
```bash
npm install -g pm2
pm2 start server/app.js --name "vertttraue-backend"
pm2 startup
pm2 save
```

## 🔑 Credenciais Padrão

- **Usuário**: admin
- **Senha**: admin123

*⚠️ Altere as credenciais em produção!*

## 🛠️ Desenvolvimento

### Frontend
```bash
npm run dev
```
Acesse: http://localhost:8080

### Backend
```bash
npm install nodemon --save-dev
npm run dev:backend
```
API: http://localhost:3001

### Health Check
```bash
curl http://localhost:3001/health
```

## 📱 Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Tanstack Query
- Recharts

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt
- Helmet (segurança)
- CORS
- Rate Limiting

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com bcrypt
- Rate limiting para prevenir ataques
- Headers de segurança com Helmet
- CORS configurado
- Validação de entrada
- SQL injection protection

## 📊 Monitoramento

- Health check endpoint: `/health`
- Logs estruturados
- Backup automático do banco
- Triggers para auditoria

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, entre em contato através do sistema ou abra uma issue no repositório.
