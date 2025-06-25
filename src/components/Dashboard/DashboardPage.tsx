
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '../Layout/Header';
import { mockSales, mockProducts, mockAffiliates } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardPageProps {
  onBack: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'vendas' | 'afiliados'>('vendas');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAllProducts, setShowAllProducts] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Dados simulados para o dashboard
  const vendasMensais = mockSales.reduce((total, sale) => total + sale.total, 0);
  
  const diasVendas = Array.from({ length: 31 }, (_, i) => ({
    dia: i + 1,
    vendas: Math.floor(Math.random() * 20) + 1
  }));

  const produtosMaisVendidos = [
    { nome: 'Produto Exemplo 1', quantidade: 45 },
    { nome: 'Produto Exemplo 2', quantidade: 32 },
    { nome: 'Kit Básico', quantidade: 28 },
    { nome: 'Conjunto Premium', quantidade: 22 },
    { nome: 'Produto Exemplo 3', quantidade: 18 },
    { nome: 'Kit Avançado', quantidade: 15 },
    { nome: 'Conjunto Básico', quantidade: 12 },
    { nome: 'Produto Exemplo 4', quantidade: 10 }
  ];

  const meioVendas = [
    { nome: 'Online', value: 65, color: '#00565F' },
    { nome: 'Física', value: 35, color: '#008591' }
  ];

  const afiliadosStats = mockAffiliates.map(afiliado => {
    const vendas = Math.floor(Math.random() * 10) + 5;
    const faturamento = Math.floor(Math.random() * 2000) + 500;
    const comissao = faturamento * (afiliado.comissao / 100);
    const lucro = faturamento - comissao;
    
    return {
      nome: afiliado.nome_completo,
      vendas,
      faturamento,
      comissao,
      lucro
    };
  });

  const currentMonthName = months[selectedMonth - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Dashboard"
        onBack={onBack}
      />

      <div className="container mx-auto p-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="month">Mês</Label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="ml-2 rounded border p-2"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="ml-2 w-24"
              />
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'vendas' ? 'default' : 'outline'}
            onClick={() => setActiveTab('vendas')}
            className={activeTab === 'vendas' ? 'bg-vertttraue-primary hover:bg-vertttraue-primary/80' : 'hover:bg-vertttraue-primary hover:text-white'}
          >
            Vendas
          </Button>
          <Button
            variant={activeTab === 'afiliados' ? 'default' : 'outline'}
            onClick={() => setActiveTab('afiliados')}
            className={activeTab === 'afiliados' ? 'bg-vertttraue-primary hover:bg-vertttraue-primary/80' : 'hover:bg-vertttraue-primary hover:text-white'}
          >
            Afiliados
          </Button>
        </div>

        {activeTab === 'vendas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total de Vendas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-vertttraue-primary">
                Total de Vendas {currentMonthName}
              </h3>
              <div className="text-3xl font-bold text-vertttraue-primary">
                R$ {vendasMensais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-600 mt-2">{currentMonthName} de {selectedYear}</p>
            </div>

            {/* Vendas por Dia do Mês */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-vertttraue-primary">Vendas por Dia do Mês</h3>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {diasVendas.slice(0, 28).map((dia) => (
                  <div key={dia.dia} className="text-center p-1 border rounded">
                    <div className="font-semibold">{dia.dia}</div>
                    <div className="text-vertttraue-primary">{dia.vendas}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Produtos Mais Vendidos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-vertttraue-primary">Produtos Mais Vendidos</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className="hover:bg-vertttraue-primary hover:text-white"
                >
                  {showAllProducts ? 'Mostrar Menos' : 'Ver Todos'}
                </Button>
              </div>
              <div className="space-y-3">
                {(showAllProducts ? produtosMaisVendidos : produtosMaisVendidos.slice(0, 3)).map((produto, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{produto.nome}</span>
                    <Badge className="bg-vertttraue-primary">{produto.quantidade} vendas</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Canal de Vendas */}
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
                    <th className="text-left p-2">Faturamento</th>
                    <th className="text-left p-2">Comissão</th>
                    <th className="text-left p-2">Lucro</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {afiliadosStats.map((afiliado, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{afiliado.nome}</td>
                      <td className="p-2">{afiliado.vendas}</td>
                      <td className="p-2 font-bold text-vertttraue-primary">
                        R$ {afiliado.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 font-bold text-orange-600">
                        R$ {afiliado.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 font-bold text-green-600">
                        R$ {afiliado.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
