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
  const { products, loading: productsLoading, error: productsError, createProduct, updateProduct, deleteProduct } = useProducts();
  const { suppliers } = useSuppliers();
  const { affiliates } = useAffiliates();
  const { kits, loading: kitsLoading, createKit, updateKit, deleteKit } = useKits();
  const { conjuntos, loading: conjuntosLoading, createConjunto, updateConjunto, deleteConjunto } = useConjuntos();

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

  // Função para corrigir codificação de texto
  const fixTextEncoding = (text: string | undefined): string => {
    if (!text) return '';
    return text
      .replace(/Ã¡/g, 'á')
      .replace(/Ã /g, 'à')
      .replace(/Ã©/g, 'é')
      .replace(/Ãª/g, 'ê')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã§/g, 'ç')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã¢/g, 'â')
      .replace(/Ã´/g, 'ô')
      .replace(/Ã¹/g, 'ù')
      .replace(/Ã¨/g, 'è')
      .replace(/Ã¬/g, 'ì')
      .replace(/Ã²/g, 'ò')
      .replace(/Ã¼/g, 'ü')
      .replace(/Ã¤/g, 'ä')
      .replace(/Ã¶/g, 'ö')
      .replace(/Ã/g, 'Á')
      .replace(/Ã/g, 'É');
  };

  // Aplicar correção aos dados
  const fixedProducts = products.map(product => ({
    ...product,
    nome: fixTextEncoding(product.nome)
  }));

  const fixedKits = kits.map(kit => ({
    ...kit,
    nome: fixTextEncoding(kit.nome)
  }));

  const fixedConjuntos = conjuntos.map(conjunto => ({
    ...conjunto,
    nome: fixTextEncoding(conjunto.nome)
  }));

  const filteredProducts = fixedProducts.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.fornecedor?.nome && product.fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredKits = fixedKits.filter(kit =>
    kit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConjuntos = fixedConjuntos.filter(conjunto =>
    conjunto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conjunto.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    console.log('🔧 Editando produto:', product.id);
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    console.log('🗑️ Solicitando exclusão do produto:', product.id);
    setConfirmAction({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o produto "${fixTextEncoding(product.nome)}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          await deleteProduct(product.id);
          console.log('✅ Produto excluído com sucesso');
        } catch (error) {
          console.error('❌ Erro ao excluir produto:', error);
          alert('Erro ao excluir produto. Verifique o console para mais detalhes.');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewDetails = (product: Product) => {
    console.log('👁️ Visualizando detalhes do produto:', product.id);
    setSelectedProduct(product);
    setShowProductInfoModal(true);
  };

  const handleSave = async (productData: any) => {
    try {
      console.log('💾 Salvando produto:', productData);
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        console.log('✅ Produto atualizado com sucesso');
      } else {
        await createProduct(productData);
        console.log('✅ Produto criado com sucesso');
      }
      setEditingProduct(null);
      setShowModal(false);
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Verifique o console para mais detalhes.');
    }
  };

  const handleKitSave = async (kitData: any) => {
    try {
      console.log('💾 Salvando kit:', kitData);
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
  };

  const handleConjuntoSave = async (conjuntoData: any) => {
    try {
      console.log('💾 Salvando conjunto:', conjuntoData);
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
  };

  const handleUpdateAffiliateStock = async (affiliateId: string, quantity: number) => {
    if (!selectedProduct) return;
    
    try {
      console.log('📦 Atualizando estoque do afiliado:', { affiliateId, quantity });
      await estoqueAPI.updateAfiliadoEstoque(selectedProduct.id, affiliateId, quantity);
      console.log('✅ Estoque do afiliado atualizado');
      // Refresh products data
      window.location.reload();
    } catch (error) {
      console.error('❌ Erro ao atualizar estoque do afiliado:', error);
      alert('Erro ao atualizar estoque do afiliado');
    }
  };

  // Renderização com tratamento de erro
  if (productsError) {
    console.error('❌ Erro na página de estoque:', productsError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
        <Header title="Gestão de Estoque" onBack={onBack} />
        <div className="container mx-auto p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao carregar dados do estoque: {productsError}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-vertttraue-primary hover:bg-vertttraue-primary/80"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header title="Gestão de Estoque" onBack={onBack} />

      <div className="container mx-auto p-6">
        {productsLoading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando produtos do banco de dados...</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-center">
            <TabsTrigger value="produtos" className="data-[state=active]:bg-vertttraue-primary data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="kits" className="data-[state=active]:bg-vertttraue-primary data-[state=active]:text-white">
              <Gift className="w-4 h-4 mr-2" />
              Kits
            </TabsTrigger>
            <TabsTrigger value="conjuntos" className="data-[state=active]:bg-vertttraue-primary data-[state=active]:text-white">
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
                console.log('➕ Abrindo modal de novo produto');
                setShowModal(true);
              }}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
              disabled={productsLoading}
            >
              Novo Produto
            </Button>
            <Button
              onClick={() => {
                console.log('➕ Abrindo modal de novo kit');
                setShowKitModal(true);
              }}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
              disabled={kitsLoading}
            >
              Novo Kit
            </Button>
            <Button
              onClick={() => {
                console.log('➕ Abrindo modal de novo conjunto');
                setShowConjuntoModal(true);
              }}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
              disabled={conjuntosLoading}
            >
              Novo Conjunto
            </Button>
          </div>

          <TabsContent value="produtos">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
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
                          <td className="p-3 font-bold text-vertttraue-primary">
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
                                className="hover:bg-vertttraue-primary hover:text-white text-xs"
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
        kit={editingKit}
        products={fixedProducts}
      />

      <ConjuntoModal
        isOpen={showConjuntoModal}
        onClose={() => {
          setShowConjuntoModal(false);
          setEditingConjunto(null);
        }}
        onSave={handleConjuntoSave}
        conjunto={editingConjunto}
        products={fixedProducts}
      />

      <AfiliadoEstoqueModal
        isOpen={showAfiliadoEstoqueModal}
        onClose={() => setShowAfiliadoEstoqueModal(false)}
        product={selectedProduct}
        affiliates={affiliates}
        onUpdateStock={handleUpdateAffiliateStock}
      />

      <ProductInfoModal
        isOpen={showProductInfoModal}
        onClose={() => setShowProductInfoModal(false)}
        product={selectedProduct}
        affiliates={affiliates}
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

export default EstoquePage;
