
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../Layout/Header';
import FornecedorModal from './FornecedorModal';
import FornecedorProdutosModal from './FornecedorProdutosModal';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useProducts } from '../../hooks/useProducts';
import { Supplier } from '../../types';

interface FornecedoresPageProps {
  onBack: () => void;
}

const FornecedoresPage: React.FC<FornecedoresPageProps> = ({ onBack }) => {
  const { suppliers, loading: suppliersLoading, error: suppliersError, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { products } = useProducts();
  
  const [showModal, setShowModal] = useState(false);
  const [showProdutosModal, setShowProdutosModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (confirm(`Tem certeza que deseja excluir o fornecedor "${supplier.nome}"?`)) {
      try {
        await deleteSupplier(supplier.id);
        console.log('✅ Fornecedor excluído com sucesso');
      } catch (error) {
        console.error('❌ Erro ao excluir fornecedor:', error);
        alert('Erro ao excluir fornecedor. Verifique se não há produtos vinculados.');
      }
    }
  };

  const handleShowProdutos = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowProdutosModal(true);
  };

  const handleSave = async (supplierData: any) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
        console.log('✅ Fornecedor atualizado com sucesso');
      } else {
        const newId = `FORN-${Date.now()}`;
        await createSupplier({ ...supplierData, id: newId });
        console.log('✅ Fornecedor criado com sucesso');
      }
      setEditingSupplier(null);
      setShowModal(false);
    } catch (error) {
      console.error('❌ Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor. Verifique o console para mais detalhes.');
    }
  };

  const getSupplierProducts = (supplierId: string) => {
    return products.filter(product => product.fornecedor?.id === supplierId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header title="Fornecedores" onBack={onBack} />

      <div className="container mx-auto p-6">
        {/* Indicador de carregamento */}
        {suppliersLoading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando fornecedores do banco de dados...</AlertDescription>
          </Alert>
        )}

        {/* Indicador de erro */}
        {suppliersError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao conectar com o backend: {suppliersError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setShowModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            disabled={suppliersLoading}
          >
            Adicionar Fornecedor
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
            Lista de Fornecedores ({suppliers.length})
          </h2>
          
          {suppliers.length === 0 && !suppliersLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum fornecedor encontrado no banco de dados.</p>
              <p className="text-sm">Adicione o primeiro fornecedor clicando no botão acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Cidade</th>
                    <th className="text-left p-3">Contato</th>
                    <th className="text-left p-3">Produtos</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => {
                    const supplierProducts = getSupplierProducts(supplier.id);
                    return (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{supplier.id}</td>
                        <td className="p-3 font-semibold">{supplier.nome}</td>
                        <td className="p-3">{supplier.cidade}</td>
                        <td className="p-3">{supplier.contato || 'N/A'}</td>
                        <td className="p-3">
                          <span className="bg-vertttraue-primary text-white px-2 py-1 rounded text-xs">
                            {supplierProducts.length} produtos
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShowProdutos(supplier)}
                              className="hover:bg-vertttraue-primary hover:text-white text-xs"
                            >
                              Produtos
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(supplier)}
                              className="hover:bg-vertttraue-primary hover:text-white text-xs"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(supplier)}
                              className="hover:bg-red-500 hover:text-white text-xs"
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <FornecedorModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSupplier(null);
        }}
        onSave={handleSave}
        supplier={editingSupplier}
      />

      <FornecedorProdutosModal
        isOpen={showProdutosModal}
        onClose={() => setShowProdutosModal(false)}
        supplier={selectedSupplier}
        products={selectedSupplier ? getSupplierProducts(selectedSupplier.id) : []}
      />
    </div>
  );
};

export default FornecedoresPage;
