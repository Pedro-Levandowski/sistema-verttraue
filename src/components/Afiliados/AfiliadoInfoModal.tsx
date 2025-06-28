
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Affiliate, Product } from '../../types';

interface AfiliadoInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  afiliado: Affiliate | null;
  products: Product[];
}

const AfiliadoInfoModal: React.FC<AfiliadoInfoModalProps> = ({
  isOpen,
  onClose,
  afiliado,
  products
}) => {
  if (!afiliado) return null;

  const afiliadoProducts = products.filter(product => 
    product.afiliado_estoque?.some(ae => ae.afiliado_id === afiliado.id)
  );

  const totalEstoque = afiliadoProducts.reduce((total, product) => {
    const estoqueAfiliado = product.afiliado_estoque?.find(ae => ae.afiliado_id === afiliado.id);
    return total + (estoqueAfiliado?.quantidade || 0);
  }, 0);

  const totalValor = afiliadoProducts.reduce((total, product) => {
    const estoqueAfiliado = product.afiliado_estoque?.find(ae => ae.afiliado_id === afiliado.id);
    const quantidade = estoqueAfiliado?.quantidade || 0;
    return total + (product.preco * quantidade);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Informações do Afiliado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">{afiliado.nome_completo}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ID:</span> {afiliado.id}
              </div>
              <div>
                <span className="font-medium">Email:</span> {afiliado.email}
              </div>
              <div>
                <span className="font-medium">Telefone:</span> {afiliado.telefone || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Comissão:</span> {afiliado.comissao}%
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <Badge variant={afiliado.ativo ? "default" : "secondary"}>
                  {afiliado.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Tipo Chave PIX:</span> {afiliado.tipo_chave_pix}
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium">Chave PIX:</span> {afiliado.chave_pix}
            </div>
          </div>

          {/* Resumo do Estoque */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Resumo do Estoque</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{afiliadoProducts.length}</div>
                <div className="text-sm text-gray-600">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalEstoque}</div>
                <div className="text-sm text-gray-600">Unidades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-vertttraue-primary">
                  R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Valor Total</div>
              </div>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div>
            <h3 className="font-semibold mb-3">Produtos do Afiliado</h3>
            {afiliadoProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Quantidade</th>
                      <th className="text-left p-2">Preço Unit.</th>
                      <th className="text-left p-2">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {afiliadoProducts.map((product) => {
                      const estoqueAfiliado = product.afiliado_estoque?.find(ae => ae.afiliado_id === afiliado.id);
                      const quantidade = estoqueAfiliado?.quantidade || 0;
                      const valorTotal = product.preco * quantidade;
                      
                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{product.nome}</div>
                              <div className="text-gray-500 text-xs">{product.id}</div>
                            </div>
                          </td>
                          <td className="p-2 font-semibold">{quantidade}</td>
                          <td className="p-2">R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2 font-semibold text-vertttraue-primary">
                            R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Este afiliado não possui produtos em estoque
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AfiliadoInfoModal;
