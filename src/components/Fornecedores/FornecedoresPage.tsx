
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '../Layout/Header';
import FornecedorModal from './FornecedorModal';
import { mockProducts } from '../../data/mockData';

interface FornecedoresPageProps {
  onBack: () => void;
}

const FornecedoresPage: React.FC<FornecedoresPageProps> = ({ onBack }) => {
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Extrair fornecedores únicos dos produtos
  const suppliers = Array.from(
    new Map(
      mockProducts.map(product => [
        `${product.fornecedor.nome}-${product.fornecedor.cidade}`,
        product.fornecedor
      ])
    ).values()
  );

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSupplierProducts = (supplierName: string) => {
    return mockProducts.filter(product => product.fornecedor.nome === supplierName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Fornecedores"
        onBack={onBack}
        actions={
          <Button
            onClick={() => setShowFornecedorModal(true)}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary-light"
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
            {filteredSuppliers.map((supplier, index) => {
              const products = getSupplierProducts(supplier.nome);
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{supplier.nome}</h3>
                  <p className="text-gray-600 mb-2">📍 {supplier.cidade}</p>
                  {supplier.contato && (
                    <p className="text-gray-600 mb-2">📞 {supplier.contato}</p>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-500">Produtos associados: {products.length}</p>
                    <div className="mt-2">
                      {products.slice(0, 2).map(product => (
                        <span key={product.id} className="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {product.nome}
                        </span>
                      ))}
                      {products.length > 2 && (
                        <span className="text-xs text-gray-500">+{products.length - 2} mais</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
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
        onClose={() => setShowFornecedorModal(false)}
      />
    </div>
  );
};

export default FornecedoresPage;
