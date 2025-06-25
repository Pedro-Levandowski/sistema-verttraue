
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Supplier, Product } from '../../types';

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

  const supplierProducts = products.filter(product => product.fornecedor.id === supplier.id);
  const totalValue = supplierProducts.reduce((sum, product) => sum + (product.preco_compra * (product.estoque_fisico + product.estoque_site)), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Produtos - {supplier.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-vertttraue-primary mb-2">Resumo Geral</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total de Produtos:</span>
                <p className="font-bold text-lg">{supplierProducts.length}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Valor Total Investido:</span>
                <p className="font-bold text-lg text-vertttraue-primary">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Estoque Total:</span>
                <p className="font-bold text-lg">{supplierProducts.reduce((sum, p) => sum + p.estoque_fisico + p.estoque_site, 0)}</p>
              </div>
            </div>
          </div>

          {supplierProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Estoque</th>
                    <th className="text-left p-2">Preço Compra</th>
                    <th className="text-left p-2">Preço Venda</th>
                    <th className="text-left p-2">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierProducts.map((product) => {
                    const estoqueTotal = product.estoque_fisico + product.estoque_site;
                    const valorTotal = product.preco_compra * estoqueTotal;
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono">{product.id}</td>
                        <td className="p-2">{product.nome}</td>
                        <td className="p-2">
                          <Badge variant="outline">{estoqueTotal}</Badge>
                        </td>
                        <td className="p-2">R$ {product.preco_compra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2">R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 font-bold text-vertttraue-primary">
                          R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto encontrado para este fornecedor
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FornecedorProdutosModal;
