
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

  const createTestUser = async () => {
    try {
      setDebugInfo('👤 Criando usuário teste...');
      await authAPI.register('admin@vertttraue.com', '123456', 'Admin');
      setDebugInfo('✅ Usuário teste criado com sucesso!');
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
            <Button 
              onClick={testBackend}
              variant="outline"
              className="w-full"
              size="sm"
            >
              🔍 Testar Backend
            </Button>
            
            <Button 
              onClick={createTestUser}
              variant="outline"
              className="w-full"
              size="sm"
            >
              👤 Criar Usuário Teste
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Debug do Sistema:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>1. Iniciar Backend:</strong></p>
              <code className="block bg-blue-100 p-1 rounded text-xs">cd backend && npm run dev</code>
              
              <p className="mt-2"><strong>2. Credenciais:</strong></p>
              <p>E-mail: <code>admin@vertttraue.com</code></p>
              <p>Senha: <code>123456</code></p>
              
              <p className="mt-2"><strong>3. Se não funcionar:</strong></p>
              <p className="text-xs">Use os botões de teste acima para diagnosticar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
