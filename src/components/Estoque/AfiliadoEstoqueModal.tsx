
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, Affiliate } from '../../types';

interface AfiliadoEstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, afiliadoId: string, quantidade: number) => void;
  product: Product | null;
  affiliates: Affiliate[];
}

const AfiliadoEstoqueModal: React.FC<AfiliadoEstoqueModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product, 
  affiliates 
}) => {
  const [selectedAfiliadoId, setSelectedAfiliadoId] = useState('');
  const [quantidade, setQuantidade] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedAfiliadoId('');
      setQuantidade('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product && selectedAfiliadoId && quantidade) {
      const qtd = parseInt(quantidade);
      if (qtd > 0 && qtd <= product.estoque_site) {
        onSave(product.id, selectedAfiliadoId, qtd);
        onClose();
      }
    }
  };

  if (!product) return null;

  const afiliadosAtivos = affiliates.filter(a => a.ativo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Produto ao Afiliado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="font-semibold">{product.nome}</h3>
            <p className="text-sm text-gray-600">ID: {product.id}</p>
            <p className="text-sm">Estoque Site Disponível: <span className="font-semibold">{product.estoque_site}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="afiliado">Afiliado *</Label>
              <select
                id="afiliado"
                value={selectedAfiliadoId}
                onChange={(e) => setSelectedAfiliadoId(e.target.value)}
                className="w-full rounded border p-2"
                required
              >
                <option value="">Selecione um afiliado</option>
                {afiliadosAtivos.map(afiliado => (
                  <option key={afiliado.id} value={afiliado.id}>
                    {afiliado.nome_completo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                max={product.estoque_site}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo: {product.estoque_site} (será transferido do estoque site para físico)
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-vertttraue-primary">
                Atribuir
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AfiliadoEstoqueModal;
