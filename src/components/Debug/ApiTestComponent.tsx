
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../../services/api';

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

      setTestResult(`✅ Sucesso!\nHealth: ${JSON.stringify(healthData, null, 2)}\nLogin: ${JSON.stringify(loginResponse, null, 2)}`);
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-xl">🔧 Teste de Conexão API</CardTitle>
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

        <div className="flex gap-2">
          <Button 
            onClick={testBackendOnly}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testando...' : 'Testar Backend'}
          </Button>
          <Button 
            onClick={testConnection}
            disabled={loading}
          >
            {loading ? 'Testando...' : 'Testar Login Completo'}
          </Button>
        </div>

        {testResult && (
          <Alert>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-xs">{testResult}</pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Instruções:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Certifique-se que o backend está rodando na porta 3001</li>
            <li>Execute: <code className="bg-gray-100 px-1 rounded">cd backend && npm run dev</code></li>
            <li>O health check deve retornar status "OK"</li>
            <li>Se der erro CORS, verifique se o frontend URL está correto no backend</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTestComponent;
