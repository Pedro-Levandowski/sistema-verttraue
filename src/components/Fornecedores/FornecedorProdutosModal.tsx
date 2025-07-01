
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Product, Supplier } from '../../types';

interface FornecedorProdutosModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  products: Product[];
}

const FornecedorProdutosModal: React.FC<FornecedorProdutosModalProps> = ({ 
  isOpen, 
  onClose, 
  supplier, 
  products 
}) => {
  if (!supplier) return null;

  // Calcular valor total investido (soma ÚNICA do preço de compra, sem considerar estoque)
  const valorTotalInvestido = products.reduce((total, product) => {
    return total + (product.preco_compra || 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Produtos do Fornecedor: {supplier.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-xl font-bold text-vertttraue-primary">{products.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total de Compra</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {valorTotalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Produtos com Estoque Baixo</p>
                <p className="text-xl font-bold text-red-600">
                  {products.filter(p => p.estoque_site < 3).length}
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Produtos */}
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Este fornecedor não possui produtos cadastrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white border-b">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Estoque Site</th>
                    <th className="text-left p-3">Preço Compra</th>
                    <th className="text-left p-3">Preço Venda</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{product.id}</td>
                      <td className="p-3 font-semibold">{product.nome}</td>
                      <td className="p-3">
                        <Badge variant={product.estoque_site < 3 ? "destructive" : "default"}>
                          {product.estoque_site}
                        </Badge>
                      </td>
                      <td className="p-3">
                        R$ {(product.preco_compra || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-bold text-vertttraue-primary">
                        R$ {(product.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <Badge variant={product.estoque_site > 0 ? "default" : "secondary"}>
                          {product.estoque_site > 0 ? 'Disponível' : 'Esgotado'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FornecedorProdutosModal;
