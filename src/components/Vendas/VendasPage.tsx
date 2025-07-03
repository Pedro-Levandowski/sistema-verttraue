
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../Layout/Header';
import VendaModal from './VendaModal';
import VendaDetalhesModal from './VendaDetalhesModal';
import ConfirmModal from '../Layout/ConfirmModal';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import { useAffiliates } from '../../hooks/useAffiliates';
import { useKits } from '../../hooks/useKits';
import { useConjuntos } from '../../hooks/useConjuntos';
import { Sale } from '../../types';
import { Trash2, Edit2 } from 'lucide-react';

interface VendasPageProps {
  onBack: () => void;
}

const VendasPage: React.FC<VendasPageProps> = ({ onBack }) => {
  const { sales, loading: salesLoading, error: salesError, createSale, updateSale, deleteSale } = useSales();
  const { products } = useProducts();
  const { affiliates } = useAffiliates();
  const { kits } = useKits();
  const { conjuntos } = useConjuntos();
  
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showVendaDetalhesModal, setShowVendaDetalhesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);

  const filteredSales = sales.filter(sale =>
    (sale.id && sale.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.afiliado_nome && sale.afiliado_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleShowSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowVendaDetalhesModal(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setEditMode(true);
    setShowVendaModal(true);
  };

  const handleDeleteSale = (sale: Sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  const confirmDeleteSale = async () => {
    if (saleToDelete) {
      try {
        await deleteSale(saleToDelete.id);
        console.log('✅ Venda excluída com sucesso');
        setShowDeleteModal(false);
        setSaleToDelete(null);
      } catch (error) {
        console.error('❌ Erro ao excluir venda:', error);
      }
    }
  };

  const handleSaveSale = async (saleData: any) => {
    try {
      if (editMode && selectedSale) {
        await updateSale(selectedSale.id, saleData);
        console.log('✅ Venda atualizada com sucesso');
      } else {
        await createSale(saleData);
        console.log('✅ Venda registrada com sucesso');
      }
      setShowVendaModal(false);
      setEditMode(false);
      setSelectedSale(null);
    } catch (error) {
      console.error('❌ Erro ao salvar venda:', error);
      throw error;
    }
  };

  const handleNewSale = () => {
    setSelectedSale(null);
    setEditMode(false);
    setShowVendaModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Vendas"
        onBack={onBack}
        actions={
          <Button
            onClick={handleNewSale}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            disabled={salesLoading}
          >
            Nova Venda
          </Button>
        }
      />

      <div className="container mx-auto p-6">
        {/* Indicador de carregamento */}
        {salesLoading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando vendas do banco de dados...</AlertDescription>
          </Alert>
        )}

        {/* Indicador de erro */}
        {salesError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao conectar com o backend: {salesError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
            Histórico de Vendas ({sales.length})
          </h2>
          
          {sales.length === 0 && !salesLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma venda encontrada no banco de dados.</p>
              <p className="text-sm">Registre a primeira venda clicando no botão acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID Venda</th>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Afiliado</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{sale.id}</td>
                      <td className="p-2">
                        {sale.data_venda ? new Date(sale.data_venda).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="p-2">{sale.afiliado_nome || '-'}</td>
                      <td className="p-2 font-bold text-vertttraue-primary">
                        R$ {(sale.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShowSaleDetails(sale)}
                            className="hover:bg-vertttraue-primary hover:text-white"
                          >
                            Detalhes
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditSale(sale)}
                            className="hover:bg-blue-500 hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteSale(sale)}
                            className="hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredSales.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda encontrada para "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      <VendaModal
        isOpen={showVendaModal}
        onClose={() => {
          setShowVendaModal(false);
          setEditMode(false);
          setSelectedSale(null);
        }}
        onSave={handleSaveSale}
        products={products}
        conjuntos={conjuntos}
        kits={kits}
        affiliates={affiliates}
        sale={editMode ? selectedSale : null}
      />

      <VendaDetalhesModal
        isOpen={showVendaDetalhesModal}
        onClose={() => setShowVendaDetalhesModal(false)}
        sale={selectedSale}
        products={products}
        conjuntos={conjuntos}
        kits={kits}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSale}
        title="Excluir Venda"
        message={`Tem certeza que deseja excluir a venda ${saleToDelete?.id}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default VendasPage;
