
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
  products, 
  conjuntos, 
  kits 
}) => {
  if (!sale) return null;

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
    return 'Item não identificado';
  };

  const getItemType = (saleProduct: any) => {
    if (saleProduct.produto_id) return 'Produto';
    if (saleProduct.conjunto_id) return 'Conjunto';
    if (saleProduct.kit_id) return 'Kit';
    return 'Desconhecido';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda - {sale.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-vertttraue-primary">Informações Gerais</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">ID da Venda:</span> {sale.id}</p>
                <p><span className="font-medium">Data:</span> {sale.data.toLocaleDateString('pt-BR')}</p>
                <p><span className="font-medium">Tipo:</span> 
                  <Badge variant={sale.tipo === 'online' ? 'default' : 'secondary'} className="ml-2">
                    {sale.tipo === 'online' ? 'Online' : 'Física'}
                  </Badge>
                </p>
                <p><span className="font-medium">Total:</span> 
                  <span className="font-bold text-vertttraue-primary ml-2">
                    R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-vertttraue-primary">Afiliado</h3>
              <div className="space-y-2 mt-2">
                {sale.afiliado ? (
                  <>
                    <p><span className="font-medium">Nome:</span> {sale.afiliado.nome_completo}</p>
                    <p><span className="font-medium">Email:</span> {sale.afiliado.email}</p>
                    <p><span className="font-medium">Telefone:</span> {sale.afiliado.telefone}</p>
                    <p><span className="font-medium">Comissão:</span> {sale.afiliado.comissao}%</p>
                    <p><span className="font-medium">Valor Comissão:</span> 
                      <span className="font-bold text-green-600 ml-1">
                        R$ {(sale.total * sale.afiliado.comissao / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Venda sem afiliado</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-vertttraue-primary">Itens da Venda</h3>
            <div className="mt-2">
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
                  {sale.produtos.map((saleProduct, index) => {
                    const subtotal = saleProduct.quantidade * saleProduct.preco_unitario;
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-2">{getItemName(saleProduct)}</td>
                        <td className="p-2">
                          <Badge variant="outline">{getItemType(saleProduct)}</Badge>
                        </td>
                        <td className="p-2">{saleProduct.quantidade}</td>
                        <td className="p-2">R$ {saleProduct.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 font-semibold">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendaDetalhesModal;
