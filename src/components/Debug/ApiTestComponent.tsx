
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI, productsAPI, suppliersAPI, affiliatesAPI } from '../../services/api';

const ApiTestComponent: React.FC = () => {
  const [email, setEmail] = useState('admin@vertttraue.com');
  const [password, setPassword] = useState('123456');
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('');

    try {
      // Teste 1: Health check
      console.log('🔍 Testando conexão com backend...');
      const healthResponse = await fetch('http://localhost:3001/health');
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData);

      // Teste 2: Login
      console.log('🔍 Testando login...');
      const loginResponse = await authAPI.login(email, password);
      console.log('✅ Login response:', loginResponse);

      // Se login deu certo, testar APIs com autenticação
      if (loginResponse.token) {
        localStorage.setItem('authToken', loginResponse.token);
        
        console.log('🔍 Testando API de produtos...');
        const produtos = await productsAPI.getAll();
        console.log('✅ Produtos:', produtos);

        console.log('🔍 Testando API de fornecedores...');
        const fornecedores = await suppliersAPI.getAll();
        console.log('✅ Fornecedores:', fornecedores);

        console.log('🔍 Testando API de afiliados...');
        const afiliados = await affiliatesAPI.getAll();
        console.log('✅ Afiliados:', afiliados);

        setTestResult(`✅ Sucesso completo!\n\nHealth: ${JSON.stringify(healthData, null, 2)}\n\nLogin: ${JSON.stringify(loginResponse, null, 2)}\n\nProdutos: ${produtos.length} encontrados\nFornecedores: ${fornecedores.length} encontrados\nAfiliados: ${afiliados.length} encontrados`);
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nDetalhes: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendOnly = async () => {
    setLoading(true);
    setTestResult('');

    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Backend respondendo: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Backend retornou status: ${response.status}`);
      }
    } catch (error) {
      setTestResult(`❌ Não foi possível conectar ao backend: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    setLoading(true);
    setTestResult('');

    try {
      // Primeiro tentar fazer login para obter token
      console.log('🔍 Fazendo login para testar banco...');
      const loginResponse = await authAPI.login(email, password);
      
      if (loginResponse.token) {
        localStorage.setItem('authToken', loginResponse.token);
        
        // Testar criação de um produto de teste
        console.log('🔍 Testando criação no banco...');
        const testProduct = {
          id: `TEST-${Date.now()}`,
          nome: 'Produto Teste API',
          descricao: 'Produto criado para testar conexão com banco',
          estoque_fisico: 0,
          estoque_site: 10,
          preco: 99.99,
          preco_compra: 50.00,
          fornecedor_id: 'FORN-TEST'
        };

        const createdProduct = await productsAPI.create(testProduct);
        console.log('✅ Produto criado:', createdProduct);

        // Buscar o produto criado
        const foundProduct = await productsAPI.getById(testProduct.id);
        console.log('✅ Produto encontrado:', foundProduct);

        // Deletar o produto de teste
        await productsAPI.delete(testProduct.id);
        console.log('✅ Produto de teste removido');

        setTestResult(`✅ Teste de banco de dados bem-sucedido!\n\nProduto criado: ${JSON.stringify(createdProduct, null, 2)}\n\nProduto encontrado: ${JSON.stringify(foundProduct, null, 2)}\n\n✅ Produto de teste removido com sucesso`);
      }
    } catch (error) {
      console.error('❌ Erro no teste de banco:', error);
      setTestResult(`❌ Erro no teste de banco: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nDetalhes: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-xl">🔧 Debug Completo do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@teste.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="senha"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={testBackendOnly}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testando...' : '1. Testar Backend'}
          </Button>
          <Button 
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Testando...' : '2. Testar APIs'}
          </Button>
          <Button 
            onClick={testDatabase}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Testando...' : '3. Testar Banco'}
          </Button>
        </div>

        {testResult && (
          <Alert>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-xs max-h-96 overflow-y-auto">{testResult}</pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Instruções de Debug:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Testar Backend:</strong> Verifica se o servidor Node.js está rodando</li>
            <li><strong>Testar APIs:</strong> Testa login e busca dados de todas as tabelas</li>
            <li><strong>Testar Banco:</strong> Cria, busca e remove um produto de teste</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p><strong>⚠️ Problemas Comuns:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Backend não rodando: <code className="bg-gray-100 px-1 rounded">cd backend && npm run dev</code></li>
              <li>Banco não conectado: Verificar credenciais em <code className="bg-gray-100 px-1 rounded">backend/.env</code></li>
              <li>Usuário não existe: Criar usuário admin no banco de dados</li>
              <li>CORS: Verificar FRONTEND_URL no backend</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTestComponent;
