
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Product } from '../../types';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Informações do Produto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-vertttraue-primary">Dados Básicos</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">ID:</span> {product.id}</p>
                <p><span className="font-medium">Nome:</span> {product.nome}</p>
                <p><span className="font-medium">Descrição:</span> {product.descricao}</p>
                <p><span className="font-medium">Fornecedor:</span> {product.fornecedor.nome}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-vertttraue-primary">Estoque e Preços</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">Estoque Total:</span> {product.estoque_fisico + product.estoque_site}</p>
                <p><span className="font-medium">Estoque Físico:</span> {product.estoque_fisico}</p>
                <p><span className="font-medium">Estoque Site:</span> {product.estoque_site}</p>
                <p><span className="font-medium">Preço Venda:</span> R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p><span className="font-medium">Preço Compra:</span> R$ {product.preco_compra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {product.afiliado_estoque && product.afiliado_estoque.length > 0 && (
            <div>
              <h3 className="font-semibold text-vertttraue-primary">Estoque com Afiliados</h3>
              <div className="space-y-1 mt-2">
                {product.afiliado_estoque.map((ae, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>Afiliado {ae.afiliado_id}:</span>
                    <Badge>{ae.quantidade} unidades</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.fotos && product.fotos.length > 0 && (
            <div>
              <h3 className="font-semibold text-vertttraue-primary">Fotos do Produto</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {product.fotos.map((foto, index) => (
                  <img 
                    key={index} 
                    src={foto} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInfoModal;
