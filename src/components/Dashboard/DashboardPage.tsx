
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '../Layout/Header';
import { mockSales, mockProducts, mockAffiliates } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardPageProps {
  onBack: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'vendas' | 'afiliados'>('vendas');

  // Dados simulados para o dashboard
  const vendasMensais = mockSales.reduce((total, sale) => total + sale.total, 0);
  
  const diasVendas = [
    { dia: 1, vendas: 5 },
    { dia: 2, vendas: 8 },
    { dia: 3, vendas: 12 },
    { dia: 4, vendas: 6 },
    { dia: 5, vendas: 15 },
    { dia: 6, vendas: 20 },
    { dia: 7, vendas: 10 }
  ];

  const produtosMaisVendidos = [
    { nome: 'Produto Exemplo 1', quantidade: 45 },
    { nome: 'Produto Exemplo 2', quantidade: 32 },
    { nome: 'Kit Básico', quantidade: 28 }
  ];

  const meioVendas = [
    { nome: 'Online', value: 65, color: '#00565F' },
    { nome: 'Física', value: 35, color: '#008591' }
  ];

  const afiliadosStats = mockAffiliates.map(afiliado => ({
    nome: afiliado.nome_completo,
    vendas: Math.floor(Math.random() * 10) + 5,
    comissao_total: (Math.floor(Math.random() * 500) + 200)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Dashboard"
        onBack={onBack}
      />

      <div className="container mx-auto p-6">
        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'vendas' ? 'default' : 'outline'}
            onClick={() => setActiveTab('vendas')}
            className={activeTab === 'vendas' ? 'bg-vertttraue-primary hover:bg-vertttraue-primary/80' : ''}
          >
            Vendas
          </Button>
          <Button
            variant={activeTab === 'afiliados' ? 'default' : 'outline'}
            onClick={() => setActiveTab('afiliados')}
            className={activeTab === 'afiliados' ? 'bg-vertttraue-primary hover:bg-vertttraue-primary/80' : ''}
          >
            Afiliados
          </Button>
        </div>

        {activeTab === 'vendas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total de Vendas Mensais */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-vertttraue-primary">Total de Vendas Mensais</h3>
              <div className="text-3xl font-bold text-vertttraue-primary">
                R$ {vendasMensais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-600 mt-2">Mês atual</p>
            </div>

            {/* Dias que Mais Vendem */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-vertttraue-primary">Vendas por Dia da Semana</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={diasVendas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="#00565F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Produtos Mais Vendidos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-vertttraue-primary">Produtos Mais Vendidos</h3>
              <div className="space-y-3">
                {produtosMaisVendidos.map((produto, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{produto.nome}</span>
                    <Badge className="bg-vertttraue-primary">{produto.quantidade} vendas</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Meio que Mais Vende */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-vertttraue-primary">Canal de Vendas</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={meioVendas}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ nome, value }) => `${nome}: ${value}%`}
                  >
                    {meioVendas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'afiliados' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-vertttraue-primary">Estatísticas de Afiliados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Afiliado</th>
                    <th className="text-left p-2">Vendas</th>
                    <th className="text-left p-2">Comissão Total</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {afiliadosStats.map((afiliado, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{afiliado.nome}</td>
                      <td className="p-2">{afiliado.vendas}</td>
                      <td className="p-2 font-bold text-vertttraue-primary">
                        R$ {afiliado.comissao_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2">
                        <Badge variant="default">Ativo</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
