
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Affiliate, Product } from '../../types';

interface AfiliadoProdutosModalProps {
  isOpen: boolean;
  onClose: () => void;
  afiliado: Affiliate | null;
  products: Product[];
}

const AfiliadoProdutosModal: React.FC<AfiliadoProdutosModalProps> = ({ 
  isOpen, 
  onClose, 
  afiliado, 
  products 
}) => {
  if (!afiliado) return null;

  const produtosAfiliado = products.filter(product => 
    product.afiliado_estoque?.some(ae => ae.afiliado_id === afiliado.id)
  );

  const getQuantidadeAfiliado = (product: Product) => {
    const afiliadoEstoque = product.afiliado_estoque?.find(ae => ae.afiliado_id === afiliado.id);
    return afiliadoEstoque?.quantidade || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Produtos - {afiliado.nome_completo}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {produtosAfiliado.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Quantidade</th>
                    <th className="text-left p-2">Preço</th>
                    <th className="text-left p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosAfiliado.map((product) => {
                    const quantidade = getQuantidadeAfiliado(product);
                    const total = quantidade * product.preco;
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono">{product.id}</td>
                        <td className="p-2">{product.nome}</td>
                        <td className="p-2">
                          <Badge variant="outline">{quantidade}</Badge>
                        </td>
                        <td className="p-2">R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 font-bold text-vertttraue-primary">
                          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="text-lg font-bold text-vertttraue-primary">
                  Total de Produtos: {produtosAfiliado.reduce((sum, product) => sum + getQuantidadeAfiliado(product), 0)}
                </div>
                <div className="text-lg font-bold text-vertttraue-primary">
                  Valor Total: R$ {produtosAfiliado.reduce((sum, product) => {
                    const quantidade = getQuantidadeAfiliado(product);
                    return sum + (quantidade * product.preco);
                  }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto associado a este afiliado
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AfiliadoProdutosModal;
