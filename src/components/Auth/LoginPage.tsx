
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI, debugAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@vertttraue.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const { login } = useAuth();

  const testBackend = async () => {
    try {
      setDebugInfo('🔍 Testando conexão com backend...');
      const health = await debugAPI.healthCheck();
      setDebugInfo(`✅ Backend OK: ${JSON.stringify(health, null, 2)}`);
    } catch (err) {
      setDebugInfo(`❌ Backend Error: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const testDatabase = async () => {
    try {
      setDebugInfo('🗄️ Testando conexão com banco de dados...');
      const response = await fetch('http://localhost:3001/api/auth/test-database');
      const data = await response.json();
      
      if (data.success) {
        setDebugInfo(`✅ Banco de dados OK:\n${JSON.stringify(data.results, null, 2)}`);
      } else {
        setDebugInfo(`❌ Erro no banco: ${data.error}\n${data.details || ''}`);
      }
    } catch (err) {
      setDebugInfo(`❌ Erro ao testar banco: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const resetAdmin = async () => {
    try {
      setDebugInfo('🔄 Resetando usuário admin...');
      const response = await fetch('http://localhost:3001/api/auth/reset-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (response.ok) {
        setDebugInfo(`✅ Admin resetado:\n${JSON.stringify(data, null, 2)}`);
        // Atualizar os campos com as credenciais
        setEmail('admin@vertttraue.com');
        setPassword('123456');
      } else {
        setDebugInfo(`❌ Erro ao resetar admin: ${data.error}`);
      }
    } catch (err) {
      setDebugInfo(`❌ Erro ao resetar admin: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const createTestUser = async () => {
    try {
      setDebugInfo('👤 Criando usuário teste...');
      
      // Gerar um username único
      const timestamp = Date.now();
      const testUsername = `teste${timestamp}@vertttraue.com`;
      
      await authAPI.register(testUsername, '123456', 'Usuario Teste');
      setDebugInfo(`✅ Usuário teste criado:\nE-mail: ${testUsername}\nSenha: 123456`);
    } catch (err) {
      setDebugInfo(`⚠️ Erro ao criar usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');

    try {
      console.log('🔐 === INICIANDO LOGIN NO FRONTEND ===');
      console.log('📤 Dados do formulário:', { email, password: '***' });
      
      setDebugInfo('🔄 Enviando dados para o backend...');
      
      const response = await authAPI.login(email, password);
      console.log('✅ Resposta do login:', response);
      
      setDebugInfo('✅ Login bem-sucedido! Redirecionando...');
      
      login(response.token, response.user.nome || response.user.username);
      
    } catch (err) {
      console.error('❌ === ERRO DE LOGIN NO FRONTEND ===');
      console.error('Erro completo:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      setDebugInfo(`❌ Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vertttraue-white to-vertttraue-gray p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-vertttraue-primary">
            Vertttraue
          </CardTitle>
          <CardDescription>
            Sistema de Gestão Comercial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {debugInfo && (
              <Alert>
                <AlertDescription>
                  <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail/Username</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vertttraue.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-vertttraue-primary hover:bg-vertttraue-primary/80"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={testBackend}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                🔍 Backend
              </Button>
              
              <Button 
                onClick={testDatabase}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                🗄️ Banco
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={resetAdmin}
                variant="outline"
                size="sm"
                className="text-xs bg-red-50 hover:bg-red-100"
              >
                🔄 Reset Admin
              </Button>
              
              <Button 
                onClick={createTestUser}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                👤 Criar Teste
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🚨 Diagnóstico Completo:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>1. Testar Backend:</strong> Verifica se servidor está rodando</p>
              <p><strong>2. Testar Banco:</strong> Verifica conexão e estrutura do banco</p>
              <p><strong>3. Reset Admin:</strong> Recria usuário admin@vertttraue.com</p>
              <p><strong>4. Criar Teste:</strong> Cria usuário único para teste</p>
              
              <div className="mt-2 p-2 bg-blue-100 rounded">
                <p className="font-medium">Credenciais Padrão:</p>
                <p>E-mail: <code>admin@vertttraue.com</code></p>
                <p>Senha: <code>123456</code></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
