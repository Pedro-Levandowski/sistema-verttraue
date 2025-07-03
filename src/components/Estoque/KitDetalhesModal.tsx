
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Kit, Product } from '../../types';

interface KitDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  kit: Kit | null;
  products: Product[];
}

const KitDetalhesModal: React.FC<KitDetalhesModalProps> = ({ 
  isOpen, 
  onClose, 
  kit, 
  products = [] 
}) => {
  if (!kit) return null;

  const calculateEstoque = () => {
    if (!kit.produtos || kit.produtos.length === 0 || !Array.isArray(products) || products.length === 0) return 0;
    
    return Math.min(...kit.produtos.map(kp => {
      const produto = products.find(p => p.id === kp.produto_id);
      const estoquesite = produto ? produto.estoque_site : 0;
      return Math.floor(estoquesite / kp.quantidade);
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Kit - {kit.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-600">Informações Gerais</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">ID:</span> {kit.id}</p>
                <p><span className="font-medium">Nome:</span> {kit.nome}</p>
                <p><span className="font-medium">Descrição:</span> {kit.descricao || 'N/A'}</p>
                <p><span className="font-medium">Preço:</span> 
                  <span className="font-bold text-blue-600 ml-2">
                    R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">Estoque</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">Estoque Disponível:</span> 
                  <Badge className="ml-2">{calculateEstoque()}</Badge>
                  <span className="text-xs text-gray-500 ml-2">(baseado no estoque site)</span>
                </p>
                <p><span className="font-medium">Total de Produtos:</span> {kit.produtos?.length || 0}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-blue-600">Produtos do Kit</h3>
            <div className="mt-2">
              {kit.produtos && kit.produtos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 border border-gray-200 font-medium">Produto</th>
                        <th className="text-left p-3 border border-gray-200 font-medium">Quantidade</th>
                        <th className="text-left p-3 border border-gray-200 font-medium">Estoque Individual</th>
                        <th className="text-left p-3 border border-gray-200 font-medium">Preço Unitário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kit.produtos.map((kitProduct, index) => {
                        const produto = products.find(p => p.id === kitProduct.produto_id);
                        
                        return (
                          <tr key={`kit-product-${index}`} className="hover:bg-gray-50">
                            <td className="p-3 border border-gray-200">
                              {produto?.nome || kitProduct.produto_nome || 'Produto não encontrado'}
                            </td>
                            <td className="p-3 border border-gray-200">{kitProduct.quantidade}</td>
                            <td className="p-3 border border-gray-200">
                              {produto ? produto.estoque_site : 0}
                            </td>
                            <td className="p-3 border border-gray-200">
                              R$ {(produto?.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum produto encontrado neste kit</p>
                </div>
              )}
            </div>
          </div>

          {kit.created_at && (
            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>Criado em: {new Date(kit.created_at).toLocaleString('pt-BR')}</p>
              {kit.updated_at && kit.updated_at !== kit.created_at && (
                <p>Última atualização: {new Date(kit.updated_at).toLocaleString('pt-BR')}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KitDetalhesModal;
