
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '../Layout/Header';
import ProductModal from './ProductModal';
import ConjuntoModal from './ConjuntoModal';
import { mockProducts, mockConjuntos } from '../../data/mockData';
import { Product, Conjunto } from '../../types';

interface EstoquePageProps {
  onBack: () => void;
}

const EstoquePage: React.FC<EstoquePageProps> = ({ onBack }) => {
  const [products] = useState<Product[]>(mockProducts);
  const [conjuntos] = useState<Conjunto[]>(mockConjuntos);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showConjuntoModal, setShowConjuntoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConjuntos = conjuntos.filter(conjunto =>
    conjunto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conjunto.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Estoque"
        onBack={onBack}
        actions={
          <Button
            onClick={() => setShowConjuntoModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white border-red-500"
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
            onClick={() => setShowProductModal(true)}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary-light"
          >
            Adicionar Produto
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtos */}
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
                      <td className="p-2">{product.estoque_total}</td>
                      <td className="p-2">{product.estoque_fisico}</td>
                      <td className="p-2">{product.estoque_site}</td>
                      <td className="p-2">R$ {product.preco.toFixed(2)}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conjuntos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">Conjuntos</h2>
            <div className="space-y-4">
              {filteredConjuntos.map((conjunto) => (
                <div key={conjunto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{conjunto.nome}</h3>
                      <p className="text-sm text-gray-600">{conjunto.descricao}</p>
                      <p className="text-sm font-mono text-gray-500">{conjunto.id}</p>
                    </div>
                    <Badge className="bg-vertttraue-primary">
                      Conjunto
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-600">Estoque: </span>
                      <span className="font-semibold">{conjunto.estoque_disponivel}</span>
                      <span className="text-gray-400 ml-2">(Calculado automaticamente)</span>
                    </div>
                    <div className="text-lg font-bold text-vertttraue-primary">
                      R$ {(conjunto.preco * 0.9).toFixed(2)}
                      <span className="text-sm text-gray-500 ml-2">10% desconto</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      <ConjuntoModal
        isOpen={showConjuntoModal}
        onClose={() => setShowConjuntoModal(false)}
        products={products}
      />
    </div>
  );
};

export default EstoquePage;
