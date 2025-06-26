
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../Layout/Header';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAffiliates } from '../../hooks/useAffiliates';
import { Product, Supplier, Affiliate } from '../../types';

interface DashboardPageProps {
  onBack: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onBack }) => {
  const { products, loading: productsLoading } = useProducts();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { affiliates, loading: affiliatesLoading } = useAffiliates();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    totalSuppliers: 0,
    totalAffiliates: 0,
    activeAffiliates: 0,
  });

  useEffect(() => {
    if (!productsLoading && !suppliersLoading && !affiliatesLoading) {
      const totalStock = products.reduce((sum, p) => sum + p.estoque_fisico + p.estoque_site, 0);
      const lowStockProducts = products.filter(p => (p.estoque_fisico + p.estoque_site) < 10).length;
      const activeAffiliates = affiliates.filter(a => a.ativo).length;

      setStats({
        totalProducts: products.length,
        totalStock,
        lowStockProducts,
        totalSuppliers: suppliers.length,
        totalAffiliates: affiliates.length,
        activeAffiliates,
      });
    }
  }, [products, suppliers, affiliates, productsLoading, suppliersLoading, affiliatesLoading]);

  const stockBySupplier = suppliers.map(supplier => ({
    name: supplier.nome,
    value: products.filter(p => p.fornecedor.id === supplier.id).length,
  }));

  const stockLevels = [
    { name: 'Estoque Normal', value: products.filter(p => (p.estoque_fisico + p.estoque_site) >= 10).length },
    { name: 'Estoque Baixo', value: products.filter(p => (p.estoque_fisico + p.estoque_site) < 10 && (p.estoque_fisico + p.estoque_site) > 0).length },
    { name: 'Sem Estoque', value: products.filter(p => (p.estoque_fisico + p.estoque_site) === 0).length },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const isLoading = productsLoading || suppliersLoading || affiliatesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
        <Header title="Dashboard" onBack={onBack} />
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Carregando dados do dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header title="Dashboard" onBack={onBack} />

      <div className="container mx-auto p-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-vertttraue-primary">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">unidades em estoque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">produtos com estoque baixo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSuppliers}</div>
              <p className="text-xs text-muted-foreground">fornecedores cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalAffiliates}</div>
              <p className="text-xs text-muted-foreground">{stats.activeAffiliates} ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Produtos por Fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockBySupplier}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Níveis de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockLevels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Produtos com estoque baixo */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
            <CardDescription>Produtos com menos de 10 unidades em estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .filter(p => (p.estoque_fisico + p.estoque_site) < 10)
                .slice(0, 10)
                .map(product => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.nome}</div>
                      <div className="text-sm text-gray-600">{product.fornecedor.nome}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.estoque_fisico + product.estoque_site === 0 ? "destructive" : "secondary"}>
                        {product.estoque_fisico + product.estoque_site} unidades
                      </Badge>
                    </div>
                  </div>
                ))}
              {products.filter(p => (p.estoque_fisico + p.estoque_site) < 10).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum produto com estoque baixo
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
