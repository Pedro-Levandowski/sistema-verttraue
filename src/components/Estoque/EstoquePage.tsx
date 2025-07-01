
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2 } from 'lucide-react';
import Header from '../Layout/Header';
import ProdutoModal from './ProdutoModal';
import AfiliadoEstoqueModal from './AfiliadoEstoqueModal';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAffiliates } from '../../hooks/useAffiliates';
import { Product } from '../../types';

interface EstoquePageProps {
  onBack: () => void;
}

const EstoquePage: React.FC<EstoquePageProps> = ({ onBack }) => {
  const { products, loading: productsLoading, error: productsError, createProduct, updateProduct, deleteProduct } = useProducts();
  const { suppliers } = useSuppliers();
  const { affiliates } = useAffiliates();
  
  const [showModal, setShowModal] = useState(false);
  const [showAfiliadoEstoqueModal, setShowAfiliadoEstoqueModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.fornecedor?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteProduct(product.id);
        console.log('✅ Produto excluído com sucesso');
      } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Verifique se não há vendas vinculadas.');
      }
    }
  };

  const handleManageAfiliado = (product: Product) => {
    setSelectedProduct(product);
    setShowAfiliadoEstoqueModal(true);
  };

  const handleAfiliadoEstoqueSave = async (productId: string, afiliadoId: string, quantidade: number) => {
    try {
      // Aqui você implementaria a lógica para atribuir estoque ao afiliado
      // Por enquanto, vamos apenas simular a operação
      console.log('Atribuindo estoque:', { productId, afiliadoId, quantidade });
      
      // Encontrar o produto e atualizar seu estoque
      const product = products.find(p => p.id === productId);
      if (product && product.estoque_site >= quantidade) {
        const updatedProduct = {
          ...product,
          estoque_site: product.estoque_site - quantidade,
          estoque_fisico: product.estoque_fisico + quantidade,
          afiliado_estoque: [
            ...(product.afiliado_estoque || []),
            { afiliado_id: afiliadoId, quantidade }
          ]
        };
        
        await updateProduct(productId, updatedProduct);
        console.log('✅ Estoque atribuído ao afiliado com sucesso');
      } else {
        throw new Error('Estoque insuficiente no site');
      }
    } catch (error) {
      console.error('❌ Erro ao atribuir estoque ao afiliado:', error);
      alert('Erro ao atribuir estoque ao afiliado. Verifique o console para mais detalhes.');
    }
  };

  const handleSave = async (productData: any) => {
    const confirmed = confirm(
      editingProduct 
        ? `Confirma a edição do produto "${editingProduct.nome}"?`
        : 'Confirma a criação do novo produto?'
    );
    
    if (!confirmed) return;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        console.log('✅ Produto atualizado com sucesso');
      } else {
        const newId = `PROD-${Date.now()}`;
        await createProduct({ ...productData, id: newId });
        console.log('✅ Produto criado com sucesso');
      }
      setEditingProduct(null);
      setShowModal(false);
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Verifique o console para mais detalhes.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header title="Gestão de Estoque" onBack={onBack} />

      <div className="container mx-auto p-6">
        {productsLoading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando produtos do banco de dados...</AlertDescription>
          </Alert>
        )}

        {productsError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao conectar com o backend: {productsError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            disabled={productsLoading}
          >
            Adicionar Produto
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
            Produtos em Estoque ({products.length})
          </h2>
          
          {products.length === 0 && !productsLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum produto encontrado no banco de dados.</p>
              <p className="text-sm">Adicione o primeiro produto clicando no botão acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Fornecedor</th>
                    <th className="text-left p-3">Estoque Site</th>
                    <th className="text-left p-3">Estoque Físico</th>
                    <th className="text-left p-3">Preço Venda</th>
                    <th className="text-left p-3">Preço Compra</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{product.id}</td>
                      <td className="p-3 font-semibold">{product.nome}</td>
                      <td className="p-3">{product.fornecedor?.nome || 'N/A'}</td>
                      <td className="p-3">
                        <Badge variant={product.estoque_site < 3 ? "destructive" : "default"}>
                          {product.estoque_site}
                        </Badge>
                      </td>
                      <td className="p-3">{product.estoque_fisico}</td>
                      <td className="p-3 font-bold text-vertttraue-primary">
                        R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        R$ {product.preco_compra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <Badge variant={product.estoque_site > 0 ? "default" : "secondary"}>
                          {product.estoque_site > 0 ? 'Disponível' : 'Esgotado'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageAfiliado(product)}
                            className="hover:bg-vertttraue-primary hover:text-white text-xs"
                          >
                            Afiliados
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                            className="hover:bg-vertttraue-primary hover:text-white text-xs"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(product)}
                            className="hover:bg-red-500 hover:text-white text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ProdutoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        product={editingProduct}
        suppliers={suppliers}
      />

      <AfiliadoEstoqueModal
        isOpen={showAfiliadoEstoqueModal}
        onClose={() => setShowAfiliadoEstoqueModal(false)}
        onSave={handleAfiliadoEstoqueSave}
        product={selectedProduct}
        affiliates={affiliates}
      />
    </div>
  );
};

export default EstoquePage;
