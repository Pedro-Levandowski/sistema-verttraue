import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Gift, Layers } from 'lucide-react';
import Header from '../Layout/Header';
import ProdutoModal from './ProdutoModal';
import KitModal from './KitModal';
import ConjuntoModal from './ConjuntoModal';
import AfiliadoEstoqueModal from './AfiliadoEstoqueModal';
import ProductInfoModal from './ProductInfoModal';
import ConfirmModal from '../Layout/ConfirmModal';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAffiliates } from '../../hooks/useAffiliates';
import { useKits } from '../../hooks/useKits';
import { useConjuntos } from '../../hooks/useConjuntos';
import { estoqueAPI } from '../../services/api';
import { Product, Kit, Conjunto } from '../../types';

interface EstoquePageProps {
  onBack: () => void;
}

const EstoquePage: React.FC<EstoquePageProps> = ({ onBack }) => {
  const { products, loading: productsLoading, error: productsError, createProduct, updateProduct, deleteProduct } = useProducts();
  const { suppliers } = useSuppliers();
  const { affiliates } = useAffiliates();
  const { kits, loading: kitsLoading, createKit, updateKit, deleteKit } = useKits();
  const { conjuntos, loading: conjuntosLoading, createConjunto, updateConjunto, deleteConjunto } = useConjuntos();
  
  const [showModal, setShowModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);
  const [showConjuntoModal, setShowConjuntoModal] = useState(false);
  const [showAfiliadoEstoqueModal, setShowAfiliadoEstoqueModal] = useState(false);
  const [showProductInfoModal, setShowProductInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [editingConjunto, setEditingConjunto] = useState<Conjunto | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('produtos');
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.fornecedor?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKits = kits.filter(kit =>
    kit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConjuntos = conjuntos.filter(conjunto =>
    conjunto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conjunto.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setConfirmAction({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o produto "${product.nome}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          await deleteProduct(product.id);
          console.log('✅ Produto excluído com sucesso');
        } catch (error) {
          console.error('❌ Erro ao excluir produto:', error);
          alert('Erro ao excluir produto. Verifique se não há vendas vinculadas.');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewInfo = (product: Product) => {
    setSelectedProduct(product);
    setShowProductInfoModal(true);
  };

  const handleManageAfiliado = (product: Product) => {
    setSelectedProduct(product);
    setShowAfiliadoEstoqueModal(true);
  };

  const handleAfiliadoEstoqueSave = async (productId: string, afiliadoId: string, quantidade: number) => {
    try {
      console.log('🔄 Iniciando atribuição de estoque ao afiliado:', { productId, afiliadoId, quantidade });
      
      // Usar a API correta para atualizar estoque do afiliado
      await estoqueAPI.updateAfiliadoEstoque(productId, afiliadoId, quantidade);
      
      // Atualizar o produto local
      const product = products.find(p => p.id === productId);
      if (product) {
        const updatedProduct = {
          ...product,
          estoque_site: Math.max(0, product.estoque_site - quantidade),
          afiliado_estoque: [
            ...(product.afiliado_estoque || []).filter(ae => ae.afiliado_id !== afiliadoId),
            { afiliado_id: afiliadoId, quantidade }
          ]
        };
        
        await updateProduct(productId, updatedProduct);
        console.log('✅ Estoque atribuído ao afiliado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao atribuir estoque ao afiliado:', error);
      alert('Erro ao atribuir estoque ao afiliado. Verifique o console para mais detalhes.');
    }
  };

  const handleSave = async (productData: any) => {
    const action = editingProduct ? 'edição' : 'criação';
    setConfirmAction({
      title: `Confirmar ${action}`,
      message: editingProduct 
        ? `Confirma a edição do produto "${editingProduct.nome}"?`
        : 'Confirma a criação do novo produto?',
      onConfirm: async () => {
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
      }
    });
    setShowConfirmModal(true);
  };

  const handleKitSave = async (kitData: any) => {
    const action = editingKit ? 'edição' : 'criação';
    setConfirmAction({
      title: `Confirmar ${action}`,
      message: editingKit 
        ? `Confirma a edição do kit "${editingKit.nome}"?`
        : 'Confirma a criação do novo kit?',
      onConfirm: async () => {
        try {
          if (editingKit) {
            await updateKit(editingKit.id, kitData);
            console.log('✅ Kit atualizado com sucesso');
          } else {
            await createKit(kitData);
            console.log('✅ Kit criado com sucesso');
          }
          setEditingKit(null);
          setShowKitModal(false);
        } catch (error) {
          console.error('❌ Erro ao salvar kit:', error);
          alert('Erro ao salvar kit. Verifique o console para mais detalhes.');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleConjuntoSave = async (conjuntoData: any) => {
    const action = editingConjunto ? 'edição' : 'criação';
    setConfirmAction({
      title: `Confirmar ${action}`,
      message: editingConjunto 
        ? `Confirma a edição do conjunto "${editingConjunto.nome}"?`
        : 'Confirma a criação do novo conjunto?',
      onConfirm: async () => {
        try {
          if (editingConjunto) {
            await updateConjunto(editingConjunto.id, conjuntoData);
            console.log('✅ Conjunto atualizado com sucesso');
          } else {
            await createConjunto(conjuntoData);
            console.log('✅ Conjunto criado com sucesso');
          }
          setEditingConjunto(null);
          setShowConjuntoModal(false);
        } catch (error) {
          console.error('❌ Erro ao salvar conjunto:', error);
          alert('Erro ao salvar conjunto. Verifique o console para mais detalhes.');
        }
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header title="Gestão de Estoque" onBack={onBack} />

      <div className="container mx-auto p-6">
        {(productsLoading || kitsLoading || conjuntosLoading) && (
          <Alert className="mb-4">
            <AlertDescription>Carregando dados do banco de dados...</AlertDescription>
          </Alert>
        )}

        {productsError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao conectar com o backend: {productsError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos ({products.length})
            </TabsTrigger>
            <TabsTrigger value="kits" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Kits ({kits.length})
            </TabsTrigger>
            <TabsTrigger value="conjuntos" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Conjuntos ({conjuntos.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 my-6">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              {activeTab === 'produtos' && (
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
              )}
              {activeTab === 'kits' && (
                <Button
                  onClick={() => {
                    setEditingKit(null);
                    setShowKitModal(true);
                  }}
                  className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
                  disabled={kitsLoading}
                >
                  Criar Kit
                </Button>
              )}
              {activeTab === 'conjuntos' && (
                <Button
                  onClick={() => {
                    setEditingConjunto(null);
                    setShowConjuntoModal(true);
                  }}
                  className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
                  disabled={conjuntosLoading}
                >
                  Criar Conjunto
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="produtos">
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
                                onClick={() => handleViewInfo(product)}
                                className="hover:bg-blue-500 hover:text-white text-xs"
                                title="Ver informações"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
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
          </TabsContent>

          <TabsContent value="kits">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
                Kits Disponíveis ({kits.length})
              </h2>
              
              {kits.length === 0 && !kitsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum kit encontrado no banco de dados.</p>
                  <p className="text-sm">Crie o primeiro kit clicando no botão acima.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Descrição</th>
                        <th className="text-left p-3">Preço</th>
                        <th className="text-left p-3">Total Produtos</th>
                        <th className="text-left p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKits.map((kit) => (
                        <tr key={kit.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{kit.id}</td>
                          <td className="p-3 font-semibold">{kit.nome}</td>
                          <td className="p-3">{kit.descricao || 'N/A'}</td>
                          <td className="p-3 font-bold text-vertttraue-primary">
                            R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">
                            <Badge>{kit.total_produtos || 0}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingKit(kit);
                                  setShowKitModal(true);
                                }}
                                className="hover:bg-vertttraue-primary hover:text-white text-xs"
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setConfirmAction({
                                    title: 'Confirmar Exclusão',
                                    message: `Tem certeza que deseja excluir o kit "${kit.nome}"?`,
                                    onConfirm: async () => {
                                      try {
                                        await deleteKit(kit.id);
                                        console.log('✅ Kit excluído com sucesso');
                                      } catch (error) {
                                        console.error('❌ Erro ao excluir kit:', error);
                                        alert('Erro ao excluir kit.');
                                      }
                                    }
                                  });
                                  setShowConfirmModal(true);
                                }}
                                className="hover:bg-red-500 hover:text-white text-xs"
                              >
                                Excluir
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
          </TabsContent>

          <TabsContent value="conjuntos">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
                Conjuntos Disponíveis ({conjuntos.length})
              </h2>
              
              {conjuntos.length === 0 && !conjuntosLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum conjunto encontrado no banco de dados.</p>
                  <p className="text-sm">Crie o primeiro conjunto clicando no botão acima.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Descrição</th>
                        <th className="text-left p-3">Preço</th>
                        <th className="text-left p-3">Total Produtos</th>
                        <th className="text-left p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConjuntos.map((conjunto) => (
                        <tr key={conjunto.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{conjunto.id}</td>
                          <td className="p-3 font-semibold">{conjunto.nome}</td>
                          <td className="p-3">{conjunto.descricao || 'N/A'}</td>
                          <td className="p-3 font-bold text-vertttraue-primary">
                            R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">
                            <Badge>{conjunto.total_produtos || 0}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingConjunto(conjunto);
                                  setShowConjuntoModal(true);
                                }}
                                className="hover:bg-vertttraue-primary hover:text-white text-xs"
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setConfirmAction({
                                    title: 'Confirmar Exclusão',
                                    message: `Tem certeza que deseja excluir o conjunto "${conjunto.nome}"?`,
                                    onConfirm: async () => {
                                      try {
                                        await deleteConjunto(conjunto.id);
                                        console.log('✅ Conjunto excluído com sucesso');
                                      } catch (error) {
                                        console.error('❌ Erro ao excluir conjunto:', error);
                                        alert('Erro ao excluir conjunto.');
                                      }
                                    }
                                  });
                                  setShowConfirmModal(true);
                                }}
                                className="hover:bg-red-500 hover:text-white text-xs"
                              >
                                Excluir
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
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

      <KitModal
        isOpen={showKitModal}
        onClose={() => {
          setShowKitModal(false);
          setEditingKit(null);
        }}
        onSave={handleKitSave}
        products={products}
        kit={editingKit}
      />

      <ConjuntoModal
        isOpen={showConjuntoModal}
        onClose={() => {
          setShowConjuntoModal(false);
          setEditingConjunto(null);
        }}
        onSave={handleConjuntoSave}
        products={products}
        conjunto={editingConjunto}
      />

      <AfiliadoEstoqueModal
        isOpen={showAfiliadoEstoqueModal}
        onClose={() => setShowAfiliadoEstoqueModal(false)}
        onSave={handleAfiliadoEstoqueSave}
        product={selectedProduct}
        affiliates={affiliates}
      />

      <ProductInfoModal
        isOpen={showProductInfoModal}
        onClose={() => setShowProductInfoModal(false)}
        product={selectedProduct}
        affiliates={affiliates}
        onUpdateProduct={async (updatedProduct) => {
          await updateProduct(updatedProduct.id, updatedProduct);
        }}
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
      />
    </div>
  );
};

export default EstoquePage;
