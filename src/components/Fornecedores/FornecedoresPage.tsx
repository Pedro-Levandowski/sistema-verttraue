
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Factory, Package, Eye, Edit, Trash2 } from 'lucide-react';
import Header from '../Layout/Header';
import FornecedorModal from './FornecedorModal';
import FornecedorProdutosModal from './FornecedorProdutosModal';
import ConfirmModal from '../Layout/ConfirmModal';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Supplier, Product } from '../../types';

interface FornecedoresPageProps {
  onBack: () => void;
}

const FornecedoresPage: React.FC<FornecedoresPageProps> = ({ onBack }) => {
  const { suppliers, loading, error, createSupplier, updateSupplier, deleteSupplier, fetchSupplierProducts } = useSuppliers();
  
  const [showModal, setShowModal] = useState(false);
  const [showProdutosModal, setShowProdutosModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setConfirmAction({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o fornecedor "${supplier.nome}"? Esta ação não pode ser desfeita e removerá todos os dados relacionados.`,
      onConfirm: async () => {
        try {
          await deleteSupplier(supplier.id);
          console.log('✅ Fornecedor excluído com sucesso');
        } catch (error) {
          console.error('❌ Erro ao excluir fornecedor:', error);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewProducts = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    const products = await fetchSupplierProducts(supplier.id);
    setSupplierProducts(products);
    setShowProdutosModal(true);
  };

  const handleSave = async (supplierData: any) => {
    const action = editingSupplier ? 'edição' : 'criação';
    setConfirmAction({
      title: `Confirmar ${action}`,
      message: editingSupplier 
        ? `Confirma a edição do fornecedor "${editingSupplier.nome}"?`
        : 'Confirma a criação do novo fornecedor?',
      onConfirm: async () => {
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
        }
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header title="Gestão de Fornecedores" onBack={onBack} />

      <div className="container mx-auto p-6">
        {loading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando fornecedores...</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao carregar fornecedores: {error}
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
            disabled={loading}
          >
            <Factory className="w-4 h-4 mr-2" />
            Adicionar Fornecedor
          </Button>
        </div>

        {/* Cards dos Fornecedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-vertttraue-primary/10 rounded-full flex items-center justify-center">
                    <Factory className="w-6 h-6 text-vertttraue-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-vertttraue-primary">
                      {supplier.nome}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">{supplier.id}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {supplier.total_produtos || 0} produtos
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Cidade:</span>
                  <span>{supplier.cidade || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Contato:</span>
                  <span>{supplier.contato || 'Não informado'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewProducts(supplier)}
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Produtos
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(supplier)}
                  className="hover:bg-vertttraue-primary hover:text-white"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(supplier)}
                  className="hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {suppliers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Factory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum fornecedor encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Adicione o primeiro fornecedor para começar a gerenciar seus produtos.
            </p>
            <Button
              onClick={() => {
                setEditingSupplier(null);
                setShowModal(true);
              }}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            >
              <Factory className="w-4 h-4 mr-2" />
              Adicionar Primeiro Fornecedor
            </Button>
          </div>
        )}
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
        products={supplierProducts}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }
          setShowConfirmModal(false);
        }}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        variant={confirmAction?.title.includes('Exclusão') ? 'destructive' : 'default'}
      />
    </div>
  );
};

export default FornecedoresPage;
