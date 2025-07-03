
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
  console.log('🚀 [VendaDetalhesModal] Products:', products);
  console.log('🚀 [VendaDetalhesModal] Conjuntos:', conjuntos);
  console.log('🚀 [VendaDetalhesModal] Kits:', kits);

  const getItemName = (saleProduct: any) => {
    console.log('🔍 [VendaDetalhesModal] Getting item name for:', saleProduct);
    
    if (saleProduct?.produto_id) {
      const produto = products.find(p => p?.id === saleProduct.produto_id);
      console.log('🔍 Found produto:', produto);
      return produto?.nome || 'Produto não encontrado';
    }
    if (saleProduct?.conjunto_id) {
      const conjunto = conjuntos.find(c => c?.id === saleProduct.conjunto_id);
      console.log('🔍 Found conjunto:', conjunto);
      return conjunto?.nome || 'Conjunto não encontrado';
    }
    if (saleProduct?.kit_id) {
      const kit = kits.find(k => k?.id === saleProduct.kit_id);
      console.log('🔍 Found kit:', kit);
      return kit?.nome || 'Kit não encontrado';
    }
    return saleProduct?.nome || saleProduct?.produto_nome || saleProduct?.item_nome || 'Item não identificado';
  };

  const getItemType = (saleProduct: any) => {
    if (saleProduct?.produto_id) return 'Produto';
    if (saleProduct?.conjunto_id) return 'Conjunto';
    if (saleProduct?.kit_id) return 'Kit';
    return 'Produto';
  };

  // Tratamento robusto dos dados da venda
  const saleData = {
    id: sale?.id || 'N/A',
    data_venda: sale?.data_venda || sale?.data || new Date().toISOString(),
    valor_total: Number(sale?.valor_total || sale?.total || 0),
    tipo: sale?.tipo || 'fisica',
    afiliado: sale?.afiliado || null,
    afiliado_nome: sale?.afiliado_nome || sale?.afiliado?.nome_completo || null,
    produtos: Array.isArray(sale?.produtos) ? sale.produtos : 
               Array.isArray(sale?.itens) ? sale.itens : []
  };

  console.log('📊 [VendaDetalhesModal] Processed sale data:', saleData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda - {saleData.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-600">Informações Gerais</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">ID da Venda:</span> {saleData.id}</p>
                <p><span className="font-medium">Data:</span> {
                  saleData.data_venda ? 
                    new Date(saleData.data_venda).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    }) : 'N/A'
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 border border-gray-200 font-medium">Item</th>
                        <th className="text-left p-3 border border-gray-200 font-medium">Tipo</th>
                        <th className="text-left p-3 border border-gray-200 font-medium">Quantidade</th>
                        <th className="text-left p-3 border border-gray-200 font-medium">Preço Unitário</th>
                        <th className="text-left p-3 border border-gray-200 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleData.produtos.map((saleProduct: any, index: number) => {
                        const quantidade = Number(saleProduct?.quantidade || 1);
                        const precoUnitario = Number(saleProduct?.preco_unitario || saleProduct?.preco || 0);
                        const subtotal = Number(saleProduct?.subtotal || (quantidade * precoUnitario));
                        
                        console.log('📋 [VendaDetalhesModal] Processing product:', { saleProduct, quantidade, precoUnitario, subtotal });
                        
                        return (
                          <tr key={`sale-product-${index}`} className="hover:bg-gray-50">
                            <td className="p-3 border border-gray-200">{getItemName(saleProduct)}</td>
                            <td className="p-3 border border-gray-200">
                              <Badge variant="outline">{getItemType(saleProduct)}</Badge>
                            </td>
                            <td className="p-3 border border-gray-200">{quantidade}</td>
                            <td className="p-3 border border-gray-200">
                              R$ {precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 border border-gray-200 font-semibold">
                              R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum produto encontrado nesta venda</p>
                  <p className="text-xs text-gray-400 mt-1">Verifique se os dados da venda estão corretos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendaDetalhesModal;
