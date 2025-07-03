
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../Layout/Header';
import ProductModal from './ProductModal';
import ProdutoModal from './ProdutoModal';
import ProductInfoModal from './ProductInfoModal';
import KitModal from './KitModal';
import KitDetalhesModal from './KitDetalhesModal';
import ConjuntoModal from './ConjuntoModal';
import ConjuntoDetalhesModal from './ConjuntoDetalhesModal';
import AfiliadoEstoqueModal from './AfiliadoEstoqueModal';
import ConfirmModal from '../Layout/ConfirmModal';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAffiliates } from '../../hooks/useAffiliates';
import { useKits } from '../../hooks/useKits';
import { useConjuntos } from '../../hooks/useConjuntos';
import { Product, Kit, Conjunto } from '../../types';
import { Eye, Edit, Trash2, Users } from 'lucide-react';
import { estoqueAPI } from '../../services/api';

interface EstoquePageProps {
  onBack: () => void;
}

const EstoquePage: React.FC<EstoquePageProps> = ({ onBack }) => {
  const { products, loading: productsLoading, error: productsError, createProduct, updateProduct, deleteProduct } = useProducts();
  const { suppliers } = useSuppliers();
  const { affiliates } = useAffiliates();
  const { kits, loading: kitsLoading, createKit, updateKit, deleteKit } = useKits();
  const { conjuntos, loading: conjuntosLoading, createConjunto, updateConjunto, deleteConjunto } = useConjuntos();

  // Estados para modais
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showProductInfoModal, setShowProductInfoModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);
  const [showKitDetalhesModal, setShowKitDetalhesModal] = useState(false);
  const [showConjuntoModal, setShowConjuntoModal] = useState(false);
  const [showConjuntoDetalhesModal, setShowConjuntoDetalhesModal] = useState(false);
  const [showAfiliadoEstoqueModal, setShowAfiliadoEstoqueModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para itens selecionados
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [selectedConjunto, setSelectedConjunto] = useState<Conjunto | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'kit' | 'conjunto', item: any } | null>(null);

  // Estados para busca
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros
  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKits = kits.filter(kit =>
    kit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConjuntos = conjuntos.filter(conjunto =>
    conjunto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conjunto.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers para produtos
  const handleShowProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowProductInfoModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProdutoModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setItemToDelete({ type: 'product', item: product });
    setShowDeleteModal(true);
  };

  const handleAssignProductToAffiliate = (product: Product) => {
    setSelectedProduct(product);
    setShowAfiliadoEstoqueModal(true);
  };

  // Handlers para kits
  const handleShowKitDetails = (kit: Kit) => {
    setSelectedKit(kit);
    setShowKitDetalhesModal(true);
  };

  const handleEditKit = (kit: Kit) => {
    setSelectedKit(kit);
    setShowKitModal(true);
  };

  const handleDeleteKit = (kit: Kit) => {
    setItemToDelete({ type: 'kit', item: kit });
    setShowDeleteModal(true);
  };

  const handleAssignKitToAffiliate = (kit: Kit) => {
    // Converter kit para formato produto para reutilizar modal
    const kitAsProduct: Product = {
      id: kit.id,
      nome: kit.nome,
      descricao: kit.descricao || '',
      estoque_fisico: 0,
      estoque_site: 1, // Considera que kit sempre tem "estoque"
      preco: kit.preco,
      preco_compra: 0,
      fornecedor: null,
      afiliado_estoque: [],
      fotos: []
    };
    setSelectedProduct(kitAsProduct);
    setShowAfiliadoEstoqueModal(true);
  };

  // Handlers para conjuntos
  const handleShowConjuntoDetails = (conjunto: Conjunto) => {
    setSelectedConjunto(conjunto);
    setShowConjuntoDetalhesModal(true);
  };

  const handleEditConjunto = (conjunto: Conjunto) => {
    setSelectedConjunto(conjunto);
    setShowConjuntoModal(true);
  };

  const handleDeleteConjunto = (conjunto: Conjunto) => {
    setItemToDelete({ type: 'conjunto', item: conjunto });
    setShowDeleteModal(true);
  };

  const handleAssignConjuntoToAffiliate = (conjunto: Conjunto) => {
    // Converter conjunto para formato produto para reutilizar modal
    const conjuntoAsProduct: Product = {
      id: conjunto.id,
      nome: conjunto.nome,
      descricao: conjunto.descricao || '',
      estoque_fisico: 0,
      estoque_site: 1, // Considera que conjunto sempre tem "estoque"
      preco: conjunto.preco,
      preco_compra: 0,
      fornecedor: null,
      afiliado_estoque: [],
      fotos: []
    };
    setSelectedProduct(conjuntoAsProduct);
    setShowAfiliadoEstoqueModal(true);
  };

  // Confirmar exclusão
  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        switch (itemToDelete.type) {
          case 'product':
            await deleteProduct(itemToDelete.item.id);
            break;
          case 'kit':
            await deleteKit(itemToDelete.item.id);
            break;
          case 'conjunto':
            await deleteConjunto(itemToDelete.item.id);
            break;
        }
        console.log(`✅ ${itemToDelete.type} excluído com sucesso`);
        setShowDeleteModal(false);
        setItemToDelete(null);
      } catch (error) {
        console.error(`❌ Erro ao excluir ${itemToDelete.type}:`, error);
      }
    }
  };

  // Handler para salvar produto
  const handleSaveProduct = async (productData: any) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      setShowProdutoModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      throw error;
    }
  };

  // Handler para salvar kit
  const handleSaveKit = async (kitData: any) => {
    try {
      if (selectedKit) {
        await updateKit(selectedKit.id, kitData);
      } else {
        await createKit(kitData);
      }
      setShowKitModal(false);
      setSelectedKit(null);
    } catch (error) {
      console.error('❌ Erro ao salvar kit:', error);
      throw error;
    }
  };

  // Handler para salvar conjunto
  const handleSaveConjunto = async (conjuntoData: any) => {
    try {
      if (selectedConjunto) {
        await updateConjunto(selectedConjunto.id, conjuntoData);
      } else {
        await createConjunto(conjuntoData);
      }
      setShowConjuntoModal(false);
      setSelectedConjunto(null);
    } catch (error) {
      console.error('❌ Erro ao salvar conjunto:', error);
      throw error;
    }
  };

  // Handler para estoque de afiliado
  const handleUpdateAffiliateStock = async (affiliateId: string, quantity: number) => {
    if (selectedProduct) {
      try {
        await estoqueAPI.updateAffiliateStock({
          produto_id: selectedProduct.id,
          afiliado_id: affiliateId,
          quantidade: quantity
        });
        console.log('✅ Estoque de afiliado atualizado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao atualizar estoque de afiliado:', error);
        throw error;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Estoque"
        onBack={onBack}
      />

      <div className="container mx-auto p-6">
        {/* Indicadores de carregamento e erro */}
        {(productsLoading || kitsLoading || conjuntosLoading) && (
          <Alert className="mb-4">
            <AlertDescription>Carregando dados do estoque...</AlertDescription>
          </Alert>
        )}

        {productsError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao carregar produtos: {productsError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar produtos, kits ou conjuntos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="produtos">Produtos ({products.length})</TabsTrigger>
            <TabsTrigger value="kits">Kits ({kits.length})</TabsTrigger>
            <TabsTrigger value="conjuntos">Conjuntos ({conjuntos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-vertttraue-primary">Produtos</h2>
                <Button
                  onClick={() => setShowProdutoModal(true)}
                  className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
                >
                  Novo Produto
                </Button>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Estoque Site</th>
                        <th className="text-left p-2">Preço</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono text-xs">{product.id}</td>
                          <td className="p-2">{product.nome}</td>
                          <td className="p-2">
                            <Badge variant={product.estoque_site > 0 ? "default" : "destructive"}>
                              {product.estoque_site}
                            </Badge>
                          </td>
                          <td className="p-2 font-bold text-vertttraue-primary">
                            R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleShowProductDetails(product)} title="Ver detalhes">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)} title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAssignProductToAffiliate(product)} title="Vincular a afiliado">
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product)} title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? `Nenhum produto encontrado para "${searchTerm}"` : 'Nenhum produto cadastrado'}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="kits" className="mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-vertttraue-primary">Kits</h2>
                <Button
                  onClick={() => setShowKitModal(true)}
                  className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
                >
                  Novo Kit
                </Button>
              </div>

              {filteredKits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Produtos</th>
                        <th className="text-left p-2">Preço</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKits.map((kit) => (
                        <tr key={kit.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono text-xs">{kit.id}</td>
                          <td className="p-2">{kit.nome}</td>
                          <td className="p-2">
                            <Badge>{kit.produtos?.length || 0}</Badge>
                          </td>
                          <td className="p-2 font-bold text-vertttraue-primary">
                            R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleShowKitDetails(kit)} title="Ver detalhes">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditKit(kit)} title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAssignKitToAffiliate(kit)} title="Vincular a afiliado">
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteKit(kit)} title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? `Nenhum kit encontrado para "${searchTerm}"` : 'Nenhum kit cadastrado'}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conjuntos" className="mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-vertttraue-primary">Conjuntos</h2>
                <Button
                  onClick={() => setShowConjuntoModal(true)}
                  className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
                >
                  Novo Conjunto
                </Button>
              </div>

              {filteredConjuntos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Produtos</th>
                        <th className="text-left p-2">Preço</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConjuntos.map((conjunto) => (
                        <tr key={conjunto.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono text-xs">{conjunto.id}</td>
                          <td className="p-2">{conjunto.nome}</td>
                          <td className="p-2">
                            <Badge>{conjunto.produtos?.length || 0}</Badge>
                          </td>
                          <td className="p-2 font-bold text-vertttraue-primary">
                            R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleShowConjuntoDetails(conjunto)} title="Ver detalhes">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditConjunto(conjunto)} title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAssignConjuntoToAffiliate(conjunto)} title="Vincular a afiliado">
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteConjunto(conjunto)} title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? `Nenhum conjunto encontrado para "${searchTerm}"` : 'Nenhum conjunto cadastrado'}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        suppliers={suppliers}
        affiliates={affiliates}
      />

      <ProdutoModal
        isOpen={showProdutoModal}
        onClose={() => {
          setShowProdutoModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        suppliers={suppliers}
        product={selectedProduct}
      />

      <ProductInfoModal
        isOpen={showProductInfoModal}
        onClose={() => setShowProductInfoModal(false)}
        product={selectedProduct}
        affiliates={affiliates}
      />

      <KitModal
        isOpen={showKitModal}
        onClose={() => {
          setShowKitModal(false);
          setSelectedKit(null);
        }}
        onSave={handleSaveKit}
        products={products}
        kit={selectedKit}
      />

      <KitDetalhesModal
        isOpen={showKitDetalhesModal}
        onClose={() => setShowKitDetalhesModal(false)}
        kit={selectedKit}
        products={products}
      />

      <ConjuntoModal
        isOpen={showConjuntoModal}
        onClose={() => {
          setShowConjuntoModal(false);
          setSelectedConjunto(null);
        }}
        onSave={handleSaveConjunto}
        products={products}
        conjunto={selectedConjunto}
      />

      <ConjuntoDetalhesModal
        isOpen={showConjuntoDetalhesModal}
        onClose={() => setShowConjuntoDetalhesModal(false)}
        conjunto={selectedConjunto}
        products={products}
      />

      <AfiliadoEstoqueModal
        isOpen={showAfiliadoEstoqueModal}
        onClose={() => {
          setShowAfiliadoEstoqueModal(false);
          setSelectedProduct(null);
        }}
        onUpdateStock={handleUpdateAffiliateStock}
        product={selectedProduct}
        affiliates={affiliates}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={`Excluir ${itemToDelete?.type === 'product' ? 'Produto' : itemToDelete?.type === 'kit' ? 'Kit' : 'Conjunto'}`}
        message={`Tem certeza que deseja excluir ${itemToDelete?.item?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default EstoquePage;
