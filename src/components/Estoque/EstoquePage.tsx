
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../Layout/Header';
import ProductModal from './ProductModal';
import ConjuntoModal from './ConjuntoModal';
import KitModal from './KitModal';
import ProductInfoModal from './ProductInfoModal';
import AfiliadoEstoqueModal from './AfiliadoEstoqueModal';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAffiliates } from '../../hooks/useAffiliates';
import { mockConjuntos, mockKits } from '../../data/mockData';
import { Product, Conjunto, Kit } from '../../types';

interface EstoquePageProps {
  onBack: () => void;
}

const EstoquePage: React.FC<EstoquePageProps> = ({ onBack }) => {
  // Usar hooks reais para dados do backend
  const { products, loading: productsLoading, error: productsError, createProduct, updateProduct, deleteProduct } = useProducts();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { affiliates, loading: affiliatesLoading } = useAffiliates();

  // Manter conjuntos e kits como mock por enquanto (não têm backend ainda)
  const [conjuntos, setConjuntos] = useState<Conjunto[]>(mockConjuntos);
  const [kits, setKits] = useState<Kit[]>(mockKits);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [showConjuntoModal, setShowConjuntoModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);
  const [showProductInfoModal, setShowProductInfoModal] = useState(false);
  const [showAfiliadoEstoqueModal, setShowAfiliadoEstoqueModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingConjunto, setEditingConjunto] = useState<Conjunto | null>(null);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConjuntos = conjuntos.filter(conjunto =>
    conjunto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conjunto.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKits = kits.filter(kit =>
    kit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleEditConjunto = (conjunto: Conjunto) => {
    setEditingConjunto(conjunto);
    setShowConjuntoModal(true);
  };

  const handleEditKit = (kit: Kit) => {
    setEditingKit(kit);
    setShowKitModal(true);
  };

  const handleDeleteConjunto = (conjuntoId: string) => {
    setConjuntos(conjuntos.filter(c => c.id !== conjuntoId));
  };

  const handleDeleteKit = (kitId: string) => {
    setKits(kits.filter(k => k.id !== kitId));
  };

  const handleShowProductInfo = (product: Product) => {
    setSelectedProduct(product);
    setShowProductInfoModal(true);
  };

  const handleShowAfiliadoEstoque = (product: Product) => {
    setSelectedProduct(product);
    setShowAfiliadoEstoqueModal(true);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
      console.log('✅ Produto atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        console.log('✅ Produto editado com sucesso');
      } else {
        // Gerar ID único para novo produto
        const newId = `PROD-${Date.now()}`;
        await createProduct({ ...productData, id: newId });
        console.log('✅ Produto criado com sucesso');
      }
      setEditingProduct(null);
      setShowProductModal(false);
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Verifique o console para mais detalhes.');
    }
  };

  const handleSaveConjunto = (conjuntoData: any) => {
    // Calcular estoque baseado apenas no estoque site
    const estoqueDisponivel = Math.min(...conjuntoData.produtos.map((cp: any) => {
      const produto = products.find(p => p.id === cp.produto_id);
      return produto ? Math.floor(produto.estoque_site / cp.quantidade) : 0;
    }));
    
    conjuntoData.estoque_disponivel = estoqueDisponivel;

    if (editingConjunto) {
      setConjuntos(conjuntos.map(c => c.id === editingConjunto.id ? { ...conjuntoData, id: editingConjunto.id } : c));
    } else {
      const newId = `CONJ-${Date.now()}`;
      setConjuntos([...conjuntos, { ...conjuntoData, id: newId }]);
    }
    setEditingConjunto(null);
    setShowConjuntoModal(false);
  };

  const handleSaveKit = (kitData: any) => {
    // Calcular estoque baseado apenas no estoque site
    const estoqueDisponivel = Math.min(...kitData.produtos.map((kp: any) => {
      const produto = products.find(p => p.id === kp.produto_id);
      return produto ? Math.floor(produto.estoque_site / kp.quantidade) : 0;
    }));
    
    kitData.estoque_disponivel = estoqueDisponivel;

    if (editingKit) {
      setKits(kits.map(k => k.id === editingKit.id ? { ...kitData, id: editingKit.id } : k));
    } else {
      const newId = `KIT-${Date.now()}`;
      setKits([...kits, { ...kitData, id: newId }]);
    }
    setEditingKit(null);
    setShowKitModal(false);
  };

  const handleAfiliadoEstoque = async (productId: string, afiliadoId: string, quantidade: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const updatedProduct = {
        ...product,
        estoque_site: product.estoque_site - quantidade,
        estoque_fisico: product.estoque_fisico + quantidade
      };

      await updateProduct(productId, updatedProduct);
      console.log('✅ Estoque de afiliado atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar estoque de afiliado:', error);
    }
  };

  const loading = productsLoading || suppliersLoading || affiliatesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Estoque"
        onBack={onBack}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingConjunto(null);
                setShowConjuntoModal(true);
              }}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80 text-white"
            >
              Adicionar Conjunto
            </Button>
            <Button
              onClick={() => {
                setEditingKit(null);
                setShowKitModal(true);
              }}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80 text-white"
            >
              Adicionar Kit
            </Button>
          </div>
        }
      />

      <div className="container mx-auto p-6">
        {/* Indicador de carregamento */}
        {loading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando dados do banco de dados...</AlertDescription>
          </Alert>
        )}

        {/* Indicador de erro */}
        {productsError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao conectar com o backend: {productsError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar produtos, conjuntos ou kits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            disabled={loading}
          >
            Adicionar Produto
          </Button>
        </div>

        {/* Produtos */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
              Produtos ({products.length})
            </h2>
            {products.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum produto encontrado no banco de dados.</p>
                <p className="text-sm">Adicione o primeiro produto clicando no botão acima.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Fornecedor</th>
                      <th className="text-left p-2">Est. Total</th>
                      <th className="text-left p-2">Est. Físico</th>
                      <th className="text-left p-2">Est. Site</th>
                      <th className="text-left p-2">Preço</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono">{product.id}</td>
                        <td className="p-2">{product.nome}</td>
                        <td className="p-2">{product.fornecedor?.nome || 'N/A'}</td>
                        <td className="p-2 font-semibold">{product.estoque_fisico + product.estoque_site}</td>
                        <td className="p-2">{product.estoque_fisico}</td>
                        <td className="p-2">{product.estoque_site}</td>
                        <td className="p-2">R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleShowProductInfo(product)}
                              className="hover:bg-vertttraue-primary hover:text-white text-xs"
                            >
                              Info
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                              className="hover:bg-vertttraue-primary hover:text-white text-xs"
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleShowAfiliadoEstoque(product)}
                              className="hover:bg-vertttraue-primary hover:text-white text-xs"
                            >
                              Afiliados
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

        {/* Conjuntos */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">Conjuntos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConjuntos.map((conjunto) => (
                <div key={conjunto.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{conjunto.nome}</h3>
                      <p className="text-xs text-gray-600">{conjunto.descricao}</p>
                      <p className="text-xs font-mono text-gray-500">{conjunto.id}</p>
                    </div>
                    <Badge className="bg-vertttraue-primary text-xs">
                      Conjunto
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs">
                      <span className="text-gray-600">Estoque: </span>
                      <span className="font-semibold">{conjunto.estoque_disponivel}</span>
                    </div>
                    <div className="text-sm font-bold text-vertttraue-primary">
                      R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditConjunto(conjunto)}
                      className="flex-1 text-xs hover:bg-vertttraue-primary hover:text-white"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteConjunto(conjunto.id)}
                      className="flex-1 text-xs hover:bg-red-500 hover:text-white"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kits */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">Kits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKits.map((kit) => (
              <div key={kit.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{kit.nome}</h3>
                    <p className="text-xs text-gray-600">{kit.descricao}</p>
                    <p className="text-xs font-mono text-gray-500">{kit.id}</p>
                  </div>
                  <Badge className="bg-blue-500 text-xs">
                    Kit
                  </Badge>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs">
                    <span className="text-gray-600">Estoque: </span>
                    <span className="font-semibold">{kit.estoque_disponivel}</span>
                  </div>
                  <div className="text-sm font-bold text-vertttraue-primary">
                    R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditKit(kit)}
                    className="flex-1 text-xs hover:bg-vertttraue-primary hover:text-white"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteKit(kit.id)}
                    className="flex-1 text-xs hover:bg-red-500 hover:text-white"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        suppliers={suppliers}
        affiliates={affiliates}
      />

      <ConjuntoModal
        isOpen={showConjuntoModal}
        onClose={() => {
          setShowConjuntoModal(false);
          setEditingConjunto(null);
        }}
        onSave={handleSaveConjunto}
        products={products}
        conjunto={editingConjunto}
      />

      <KitModal
        isOpen={showKitModal}
        onClose={() => {
          setShowKitModal(false);
          setEditingKit(null);
        }}
        onSave={handleSaveKit}
        products={products}
        kit={editingKit}
      />

      <ProductInfoModal
        isOpen={showProductInfoModal}
        onClose={() => setShowProductInfoModal(false)}
        product={selectedProduct}
        affiliates={affiliates}
        onUpdateProduct={handleUpdateProduct}
      />

      <AfiliadoEstoqueModal
        isOpen={showAfiliadoEstoqueModal}
        onClose={() => setShowAfiliadoEstoqueModal(false)}
        onSave={handleAfiliadoEstoque}
        product={selectedProduct}
        affiliates={affiliates}
      />
    </div>
  );
};

export default EstoquePage;
