
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '../Layout/Header';
import VendaModal from './VendaModal';
import { mockSales, mockProducts, mockConjuntos, mockKits, mockAffiliates } from '../../data/mockData';
import { Sale } from '../../types';

interface VendasPageProps {
  onBack: () => void;
}

const VendasPage: React.FC<VendasPageProps> = ({ onBack }) => {
  const [sales] = useState<Sale[]>(mockSales);
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.afiliado?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Vendas"
        onBack={onBack}
        actions={
          <Button
            onClick={() => setShowVendaModal(true)}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
          >
            Nova Venda
          </Button>
        }
      />

      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">Histórico de Vendas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID Venda</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Afiliado</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono">{sale.id}</td>
                    <td className="p-2">{sale.data.toLocaleDateString('pt-BR')}</td>
                    <td className="p-2">
                      <Badge variant={sale.tipo === 'online' ? 'default' : 'secondary'}>
                        {sale.tipo === 'online' ? 'Online' : 'Física'}
                      </Badge>
                    </td>
                    <td className="p-2">{sale.afiliado?.nome_completo || '-'}</td>
                    <td className="p-2 font-bold text-vertttraue-primary">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2">
                      <Button size="sm" variant="outline">
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda encontrada
            </div>
          )}
        </div>
      </div>

      <VendaModal
        isOpen={showVendaModal}
        onClose={() => setShowVendaModal(false)}
        products={mockProducts}
        conjuntos={mockConjuntos}
        kits={mockKits}
        affiliates={mockAffiliates}
      />
    </div>
  );
};

export default VendasPage;
