import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Gift, Layers, Eye, Trash2, Edit } from 'lucide-react';
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
  console.log('🚀 [EstoquePage] Inicializando componente...');

  // Hooks
  const {
    products = [],
    loading: productsLoading = false,
    error: productsError = null,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts() || {};

  const { suppliers = [] } = useSuppliers() || {};
  const { affiliates = [] } = useAffiliates() || {};
  
  const {
    kits = [],
    loading: kitsLoading = false,
    createKit,
    updateKit,
    deleteKit,
  } = useKits() || {};

  const {
    conjuntos = [],
    loading: conjuntosLoading = false,
    createConjunto,
    updateConjunto,
    deleteConjunto,
  } = useConjuntos() || {};

  // Estados locais
  const [activeTab, setActiveTab] = useState('produtos');
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
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  console.log('📊 [EstoquePage] Estado atual:', {
    productsCount: products.length,
    productsLoading,
    productsError,
    kitsCount: kits.length,
    conjuntosCount: conjuntos.length
  });

  // Filtros seguros
  const filteredProducts = products.filter(product =>
    product?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product?.fornecedor?.nome && product.fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredKits = kits.filter(kit =>
    kit?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit?.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConjuntos = conjuntos.filter(conjunto =>
    conjunto?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conjunto?.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers com verificação de função
  const handleEdit = (product: Product) => {
    try {
      console.log('🔧 [EstoquePage] Editando produto:', product?.id);
      setEditingProduct(product);
      setShowModal(true);
    } catch (error) {
      console.error('❌ [EstoquePage] Erro ao editar produto:', error);
    }
  };

  const handleDelete = (product: Product) => {
    try {
      console.log('🗑️ [EstoquePage] Solicitando exclusão do produto:', product?.id);
      setConfirmAction({
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o produto "${product?.nome || 'N/A'}"? Esta ação não pode ser desfeita.`,
        onConfirm: async () => {
          try {
            if (deleteProduct) {
              await deleteProduct(product.id);
              console.log('✅ [EstoquePage] Produto excluído com sucesso');
            }
          } catch (error) {
            console.error('❌ [EstoquePage] Erro ao excluir produto:', error);
          }
        }
      });
      setShowConfirmModal(true);
    } catch (error) {
      console.error('❌ [EstoquePage] Erro ao preparar exclusão:', error);
    }
  };

  const handleViewDetails = (product: Product) => {
    try {
      console.log('👁️ [EstoquePage] Visualizando detalhes do produto:', product?.id);
      setSelectedProduct(product);
      setShowProductInfoModal(true);
    } catch (error) {
      console.error('❌ [EstoquePage] Erro ao visualizar detalhes:', error);
    }
  };

  const handleSave = async (productData: any) => {
    try {
      console.log('💾 [EstoquePage] Salvando produto:', productData);
      if (editingProduct && updateProduct) {
        await updateProduct(editingProduct.id, productData);
        console.log('✅ [EstoquePage] Produto atualizado com sucesso');
      } else if (createProduct) {
        await createProduct(productData);
        console.log('✅ [EstoquePage] Produto criado com sucesso');
      }
      setEditingProduct(null);
      setShowModal(false);
    } catch (error) {
      console.error('❌ [EstoquePage] Erro ao salvar produto:', error);
    }
  };

  const handleKitSave = async (kitData: any) => {
    try {
      console.log('💾 [EstoquePage] Salvando kit:', kitData);
      if (editingKit && updateKit) {
        await updateKit(editingKit.id, kitData);
      } else if (createKit) {
        await createKit(kitData);
      }
      setEditingKit(null);
      setShowKitModal(false);
    } catch (error) {
      console.error('❌ [EstoquePage] Erro ao salvar kit:', error);
    }
  };

  const handleConjuntoSave = async (conjuntoData: any) => {
    try {
      console.log('💾 [EstoquePage] Salvando conjunto:', conjuntoData);
      if (editingConjunto && updateConjunto) {
        await updateConjunto(editingConjunto.id, conjuntoData);
      } else if (createConjunto) {
        await createConjunto(conjuntoData);
      }
      setEditingConjunto(null);
      setShowConjuntoModal(false);
    } catch (error) {
      console.error('❌ [EstoquePage] Erro ao salvar conjunto:', error);
    }
  };

  const handleUpdateAffiliateStock = async (affiliateId: string, quantity: number) => {
    if (!selectedProduct) return;
    
    try {
      console.log('📦 [EstoquePage] Atualizando estoque do afiliado:', { affiliateId, quantity });
      await estoqueAPI.updateAfiliadoEstoque(selectedProduct.id, affiliateId, quantity);
      console.log('✅ [EstoquePage] Estoque do afiliado atualizado');
      window.location.reload();
    } catch (error) {
      console.error('❌ [EstoquePage] Erro ao atualizar estoque do afiliado:', error);
    }
  };

  // Tratamento de erro
  if (productsError) {
    console.error('❌ [EstoquePage] Erro crítico na página de estoque:', productsError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header title="Gestão de Estoque" onBack={onBack} />
        <div className="container mx-auto p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              Erro ao carregar dados do estoque: {productsError}
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Recarregar Página
            </Button>
            <Button 
              onClick={onBack} 
              variant="outline"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎨 [EstoquePage] Renderizando interface...');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Gestão de Estoque" onBack={onBack} />

      <div className="container mx-auto p-6">
        {productsLoading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando produtos do banco de dados...</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-center">
            <TabsTrigger value="produtos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="kits" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Gift className="w-4 h-4 mr-2" />
              Kits
            </TabsTrigger>
            <TabsTrigger value="conjuntos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Layers className="w-4 h-4 mr-2" />
              Conjuntos
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 my-6">
            <Input
              placeholder="Buscar produtos, kits ou conjuntos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                console.log('➕ [EstoquePage] Abrindo modal de novo produto');
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={productsLoading}
            >
              Novo Produto
            </Button>
            <Button
              onClick={() => {
                console.log('➕ [EstoquePage] Abrindo modal de novo kit');
                setShowKitModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={kitsLoading}
            >
              Novo Kit
            </Button>
            <Button
              onClick={() => {
                console.log('➕ [EstoquePage] Abrindo modal de novo conjunto');
                setShowConjuntoModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={conjuntosLoading}
            >
              Novo Conjunto
            </Button>
          </div>

          <TabsContent value="produtos">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-800">
                Produtos em Estoque ({filteredProducts.length})
              </h2>
              
              {filteredProducts.length === 0 && !productsLoading ? (
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
                        <th className="text-left p-3">Estoque</th>
                        <th className="text-left p-3">Preço</th>
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
                            <div className="flex gap-2">
                              <Badge variant="outline">F: {product.estoque_fisico}</Badge>
                              <Badge variant="outline">S: {product.estoque_site}</Badge>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-blue-600">
                            R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(product)}
                                className="hover:bg-blue-50 hover:border-blue-300 text-xs"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(product)}
                                className="hover:bg-blue-600 hover:text-white text-xs"
                              >
                                <Edit className="w-3 h-3" />
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
                Kits Disponíveis ({filteredKits.length})
              </h2>

              {filteredKits.length === 0 && !kitsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum kit encontrado no banco de dados.</p>
                  <p className="text-sm">Adicione o primeiro kit clicando no botão acima.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Preço</th>
                        <th className="text-left p-3">Estoque</th>
                        <th className="text-left p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKits.map((kit) => (
                        <tr key={kit.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{kit.id}</td>
                          <td className="p-3 font-semibold">{kit.nome}</td>
                          <td className="p-3 font-bold text-vertttraue-primary">
                            R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">{kit.estoque_disponivel}</td>
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
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setConfirmAction({
                                    title: 'Confirmar Exclusão',
                                    message: `Tem certeza que deseja excluir o kit "${kit.nome}"? Esta ação não pode ser desfeita.`,
                                    onConfirm: async () => {
                                      try {
                                        await deleteKit(kit.id);
                                        console.log('✅ Kit excluído com sucesso');
                                      } catch (error) {
                                        console.error('❌ Erro ao excluir kit:', error);
                                        alert('Erro ao excluir kit. Verifique o console para mais detalhes.');
                                      }
                                    }
                                  });
                                  setShowConfirmModal(true);
                                }}
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

          <TabsContent value="conjuntos">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
                Conjuntos Disponíveis ({filteredConjuntos.length})
              </h2>

              {filteredConjuntos.length === 0 && !conjuntosLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum conjunto encontrado no banco de dados.</p>
                  <p className="text-sm">Adicione o primeiro conjunto clicando no botão acima.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Preço</th>
                        <th className="text-left p-3">Estoque</th>
                        <th className="text-left p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConjuntos.map((conjunto) => (
                        <tr key={conjunto.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{conjunto.id}</td>
                          <td className="p-3 font-semibold">{conjunto.nome}</td>
                          <td className="p-3 font-bold text-vertttraue-primary">
                            R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">{conjunto.estoque_disponivel}</td>
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
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setConfirmAction({
                                    title: 'Confirmar Exclusão',
                                    message: `Tem certeza que deseja excluir o conjunto "${conjunto.nome}"? Esta ação não pode ser desfeita.`,
                                    onConfirm: async () => {
                                      try {
                                        await deleteConjunto(conjunto.id);
                                        console.log('✅ Conjunto excluído com sucesso');
                                      } catch (error) {
                                        console.error('❌ Erro ao excluir conjunto:', error);
                                        alert('Erro ao excluir conjunto. Verifique o console para mais detalhes.');
                                      }
                                    }
                                  });
                                  setShowConfirmModal(true);
                                }}
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
        </Tabs>
      </div>

      {/* Modais */}
      {showModal && (
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
      )}

      {showKitModal && (
        <KitModal
          isOpen={showKitModal}
          onClose={() => {
            setShowKitModal(false);
            setEditingKit(null);
          }}
          onSave={handleKitSave}
          kit={editingKit}
          products={products}
        />
      )}

      {showConjuntoModal && (
        <ConjuntoModal
          isOpen={showConjuntoModal}
          onClose={() => {
            setShowConjuntoModal(false);
            setEditingConjunto(null);
          }}
          onSave={handleConjuntoSave}
          conjunto={editingConjunto}
          products={products}
        />
      )}

      {showAfiliadoEstoqueModal && (
        <AfiliadoEstoqueModal
          isOpen={showAfiliadoEstoqueModal}
          onClose={() => setShowAfiliadoEstoqueModal(false)}
          product={selectedProduct}
          affiliates={affiliates}
          onUpdateStock={handleUpdateAffiliateStock}
        />
      )}

      {showProductInfoModal && (
        <ProductInfoModal
          isOpen={showProductInfoModal}
          onClose={() => setShowProductInfoModal(false)}
          product={selectedProduct}
          affiliates={affiliates}
        />
      )}

      {showConfirmModal && confirmAction && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            confirmAction.onConfirm();
            setConfirmAction(null);
            setShowConfirmModal(false);
          }}
          title={confirmAction.title}
          message={confirmAction.message}
          variant={confirmAction.title.includes('Exclusão') ? 'destructive' : 'default'}
        />
      )}
    </div>
  );
};

export default EstoquePage;
