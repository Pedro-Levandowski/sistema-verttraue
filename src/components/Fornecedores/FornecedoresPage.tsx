
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '../Layout/Header';
import FornecedorModal from './FornecedorModal';
import FornecedorProdutosModal from './FornecedorProdutosModal';
import { mockProducts, mockSuppliers } from '../../data/mockData';
import { Supplier } from '../../types';

interface FornecedoresPageProps {
  onBack: () => void;
}

const FornecedoresPage: React.FC<FornecedoresPageProps> = ({ onBack }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showFornecedorProdutosModal, setShowFornecedorProdutosModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSupplierProductCount = (supplierId: string) => {
    return mockProducts.filter(product => product.fornecedor.id === supplierId).length;
  };

  const getSupplierTotalValue = (supplierId: string) => {
    return mockProducts
      .filter(product => product.fornecedor.id === supplierId)
      .reduce((total, product) => {
        const estoqueTotal = product.estoque_fisico + product.estoque_site;
        return total + (product.preco_compra * estoqueTotal);
      }, 0);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowFornecedorModal(true);
  };

  const handleShowSupplierProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowFornecedorProdutosModal(true);
  };

  const handleSaveSupplier = (supplierData: any) => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...supplierData, id: editingSupplier.id } : s));
    } else {
      const newSupplier = { ...supplierData, id: `SUPP${Date.now()}` };
      setSuppliers([...suppliers, newSupplier]);
    }
    setEditingSupplier(null);
    setShowFornecedorModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Fornecedores"
        onBack={onBack}
        actions={
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setShowFornecedorModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
          >
            Cadastrar Fornecedor
          </Button>
        }
      />

      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">Lista de Fornecedores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => {
              const productCount = getSupplierProductCount(supplier.id);
              const totalValue = getSupplierTotalValue(supplier.id);
              return (
                <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{supplier.nome}</h3>
                  <p className="text-gray-600 mb-2">📍 {supplier.cidade}</p>
                  {supplier.contato && (
                    <p className="text-gray-600 mb-2">📞 {supplier.contato}</p>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-500">Produtos: {productCount}</p>
                    <p className="text-sm font-semibold text-vertttraue-primary">
                      Valor Investido: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 hover:bg-vertttraue-primary hover:text-white"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 hover:bg-vertttraue-primary hover:text-white"
                      onClick={() => handleShowSupplierProducts(supplier)}
                    >
                      Produtos
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum fornecedor encontrado
            </div>
          )}
        </div>
      </div>

      <FornecedorModal
        isOpen={showFornecedorModal}
        onClose={() => {
          setShowFornecedorModal(false);
          setEditingSupplier(null);
        }}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />

      <FornecedorProdutosModal
        isOpen={showFornecedorProdutosModal}
        onClose={() => setShowFornecedorProdutosModal(false)}
        supplier={selectedSupplier}
        products={mockProducts}
      />
    </div>
  );
};

export default FornecedoresPage;
