
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '../Layout/Header';
import ProductModal from './ProductModal';
import ConjuntoModal from './ConjuntoModal';
import { mockProducts, mockConjuntos, mockAffiliates, mockSuppliers } from '../../data/mockData';
import { Product, Conjunto } from '../../types';

interface EstoquePageProps {
  onBack: () => void;
}

const EstoquePage: React.FC<EstoquePageProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [conjuntos, setConjuntos] = useState<Conjunto[]>(mockConjuntos);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showConjuntoModal, setShowConjuntoModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingConjunto, setEditingConjunto] = useState<Conjunto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConjuntos = conjuntos.filter(conjunto =>
    conjunto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conjunto.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAfiliadoName = (afiliadoId?: string) => {
    if (!afiliadoId) return 'Sem afiliado';
    const afiliado = mockAffiliates.find(a => a.id === afiliadoId);
    return afiliado ? afiliado.nome_completo : 'Afiliado não encontrado';
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleEditConjunto = (conjunto: Conjunto) => {
    setEditingConjunto(conjunto);
    setShowConjuntoModal(true);
  };

  const handleDeleteConjunto = (conjuntoId: string) => {
    setConjuntos(conjuntos.filter(c => c.id !== conjuntoId));
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p));
    } else {
      const newProduct = { ...productData, id: `PROD${Date.now()}` };
      setProducts([...products, newProduct]);
    }
    setEditingProduct(null);
    setShowProductModal(false);
  };

  const handleSaveConjunto = (conjuntoData: any) => {
    if (editingConjunto) {
      setConjuntos(conjuntos.map(c => c.id === editingConjunto.id ? { ...conjuntoData, id: editingConjunto.id } : c));
    } else {
      const newConjunto = { ...conjuntoData, id: `CONJ${Date.now()}` };
      setConjuntos([...conjuntos, newConjunto]);
    }
    setEditingConjunto(null);
    setShowConjuntoModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Estoque"
        onBack={onBack}
        actions={
          <Button
            onClick={() => {
              setEditingConjunto(null);
              setShowConjuntoModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary-light text-white"
          >
            Gerenciar Conjuntos
          </Button>
        }
      />

      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar produtos ou conjuntos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary-light"
          >
            Adicionar Produto
          </Button>
        </div>

        {/* Produtos - Layout em coluna única */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">Produtos</h2>
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
                    <th className="text-left p-2">Afiliado</th>
                    <th className="text-left p-2">Preço</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{product.id}</td>
                      <td className="p-2">{product.nome}</td>
                      <td className="p-2">{product.fornecedor.nome}</td>
                      <td className="p-2 font-semibold">{product.estoque_fisico + product.estoque_site}</td>
                      <td className="p-2">{product.estoque_fisico}</td>
                      <td className="p-2">{product.estoque_site}</td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-1 rounded ${product.afiliado_id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                          {getAfiliadoName(product.afiliado_id)}
                        </span>
                      </td>
                      <td className="p-2">R$ {product.preco.toFixed(2)}</td>
                      <td className="p-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                          className="hover:bg-vertttraue-primary hover:text-white"
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Conjuntos - Layout em coluna única, cards menores */}
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
                    R$ {(conjunto.preco * 0.9).toFixed(2)}
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
                    variant="destructive"
                    onClick={() => handleDeleteConjunto(conjunto.id)}
                    className="flex-1 text-xs"
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
        suppliers={mockSuppliers}
        affiliates={mockAffiliates}
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
    </div>
  );
};

export default EstoquePage;
