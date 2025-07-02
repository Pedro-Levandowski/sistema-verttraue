
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sale, Product, Conjunto, Kit } from '../../types';

interface VendaDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  products: Product[];
  conjuntos: Conjunto[];
  kits: Kit[];
}

const VendaDetalhesModal: React.FC<VendaDetalhesModalProps> = ({ 
  isOpen, 
  onClose, 
  sale, 
  products = [], 
  conjuntos = [], 
  kits = [] 
}) => {
  if (!sale) return null;

  console.log('🚀 [VendaDetalhesModal] Sale data:', sale);

  const getItemName = (saleProduct: any) => {
    if (saleProduct.produto_id) {
      const produto = products.find(p => p.id === saleProduct.produto_id);
      return produto?.nome || 'Produto não encontrado';
    }
    if (saleProduct.conjunto_id) {
      const conjunto = conjuntos.find(c => c.id === saleProduct.conjunto_id);
      return conjunto?.nome || 'Conjunto não encontrado';
    }
    if (saleProduct.kit_id) {
      const kit = kits.find(k => k.id === saleProduct.kit_id);
      return kit?.nome || 'Kit não encontrado';
    }
    return saleProduct.nome || saleProduct.produto_nome || 'Item não identificado';
  };

  const getItemType = (saleProduct: any) => {
    if (saleProduct.produto_id) return 'Produto';
    if (saleProduct.conjunto_id) return 'Conjunto';
    if (saleProduct.kit_id) return 'Kit';
    return 'Produto';
  };

  // Garantir que temos dados válidos
  const saleData = {
    id: sale.id || 'N/A',
    data_venda: sale.data_venda || sale.data || new Date().toISOString(),
    valor_total: sale.valor_total || sale.total || 0,
    tipo: sale.tipo || 'fisica',
    afiliado: sale.afiliado || null,
    afiliado_nome: sale.afiliado_nome || sale.afiliado?.nome_completo || null,
    produtos: sale.produtos || []
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda - {saleData.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-600">Informações Gerais</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">ID da Venda:</span> {saleData.id}</p>
                <p><span className="font-medium">Data:</span> {
                  saleData.data_venda ? new Date(saleData.data_venda).toLocaleDateString('pt-BR') : 'N/A'
                }</p>
                <p><span className="font-medium">Tipo:</span> 
                  <Badge variant={saleData.tipo === 'online' ? 'default' : 'secondary'} className="ml-2">
                    {saleData.tipo === 'online' ? 'Online' : 'Física'}
                  </Badge>
                </p>
                <p><span className="font-medium">Total:</span> 
                  <span className="font-bold text-blue-600 ml-2">
                    R$ {saleData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">Afiliado</h3>
              <div className="space-y-2 mt-2">
                {saleData.afiliado || saleData.afiliado_nome ? (
                  <>
                    <p><span className="font-medium">Nome:</span> {
                      saleData.afiliado?.nome_completo || 
                      saleData.afiliado_nome || 
                      'N/A'
                    }</p>
                    {saleData.afiliado?.email && (
                      <p><span className="font-medium">Email:</span> {saleData.afiliado.email}</p>
                    )}
                    {saleData.afiliado?.telefone && (
                      <p><span className="font-medium">Telefone:</span> {saleData.afiliado.telefone}</p>
                    )}
                    {saleData.afiliado?.comissao && (
                      <>
                        <p><span className="font-medium">Comissão:</span> {saleData.afiliado.comissao}%</p>
                        <p><span className="font-medium">Valor Comissão:</span> 
                          <span className="font-bold text-green-600 ml-1">
                            R$ {(saleData.valor_total * saleData.afiliado.comissao / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">Venda sem afiliado</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-blue-600">Itens da Venda</h3>
            <div className="mt-2">
              {saleData.produtos && saleData.produtos.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Quantidade</th>
                      <th className="text-left p-2">Preço Unitário</th>
                      <th className="text-left p-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleData.produtos.map((saleProduct: any, index: number) => {
                      const quantidade = saleProduct.quantidade || 1;
                      const precoUnitario = saleProduct.preco_unitario || saleProduct.preco || 0;
                      const subtotal = saleProduct.subtotal || (quantidade * precoUnitario);
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2">{getItemName(saleProduct)}</td>
                          <td className="p-2">
                            <Badge variant="outline">{getItemType(saleProduct)}</Badge>
                          </td>
                          <td className="p-2">{quantidade}</td>
                          <td className="p-2">R$ {precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2 font-semibold">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum produto encontrado nesta venda</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendaDetalhesModal;
