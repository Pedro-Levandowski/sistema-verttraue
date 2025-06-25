
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Product, Conjunto, Affiliate } from '../../types';

interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  conjuntos: Conjunto[];
  affiliates: Affiliate[];
}

const VendaModal: React.FC<VendaModalProps> = ({ 
  isOpen, 
  onClose, 
  products, 
  conjuntos, 
  affiliates 
}) => {
  const [formData, setFormData] = useState({
    tipo: 'online' as 'online' | 'fisica',
    afiliado_id: '',
    items: [] as { type: 'produto' | 'conjunto'; id: string; quantidade: number; preco: number }[]
  });

  const [selectedType, setSelectedType] = useState<'produto' | 'conjunto'>('produto');
  const [selectedId, setSelectedId] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const addItem = () => {
    if (!selectedId || !quantidade) return;

    let preco = 0;
    if (selectedType === 'produto') {
      const produto = products.find(p => p.id === selectedId);
      preco = produto?.preco || 0;
    } else {
      const conjunto = conjuntos.find(c => c.id === selectedId);
      preco = conjunto ? conjunto.preco * 0.9 : 0;
    }

    const existingIndex = formData.items.findIndex(
      item => item.type === selectedType && item.id === selectedId
    );

    if (existingIndex >= 0) {
      // Soma a quantidade ao invés de substituir
      const newItems = [...formData.items];
      newItems[existingIndex].quantidade += parseInt(quantidade);
      setFormData({ ...formData, items: newItems });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, {
          type: selectedType,
          id: selectedId,
          quantidade: parseInt(quantidade),
          preco
        }]
      });
    }

    setSelectedId('');
    setQuantidade('');
  };

  const removeItem = (type: string, id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => !(item.type === type && item.id === id))
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Venda registrada:', {
      ...formData,
      total: calculateTotal(),
      data: new Date()
    });
    onClose();
    setFormData({ tipo: 'online', afiliado_id: '', items: [] });
  };

  const getItemName = (item: any) => {
    if (item.type === 'produto') {
      const produto = products.find(p => p.id === item.id);
      return produto?.nome || 'Produto não encontrado';
    } else {
      const conjunto = conjuntos.find(c => c.id === item.id);
      return conjunto?.nome || 'Conjunto não encontrado';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Venda</Label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'online' | 'fisica' })}
                className="w-full rounded border p-2"
              >
                <option value="online">Online</option>
                <option value="fisica">Física</option>
              </select>
            </div>

            <div>
              <Label>Afiliado (opcional)</Label>
              <select
                value={formData.afiliado_id}
                onChange={(e) => setFormData({ ...formData, afiliado_id: e.target.value })}
                className="w-full rounded border p-2"
              >
                <option value="">Nenhum afiliado</option>
                {affiliates.filter(a => a.ativo).map(affiliate => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.nome_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Itens da Venda</h3>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'produto' | 'conjunto');
                  setSelectedId('');
                }}
                className="rounded border p-2"
              >
                <option value="produto">Produto</option>
                <option value="conjunto">Conjunto</option>
              </select>
              
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 rounded border p-2"
              >
                <option value="">Selecione...</option>
                {selectedType === 'produto' 
                  ? products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.nome} - R$ {product.preco.toFixed(2)}
                      </option>
                    ))
                  : conjuntos.map(conjunto => (
                      <option key={conjunto.id} value={conjunto.id}>
                        {conjunto.nome} - R$ {(conjunto.preco * 0.9).toFixed(2)}
                      </option>
                    ))
                }
              </select>
              
              <Input
                type="number"
                placeholder="Qtd"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                min="1"
              />
              
              <Button type="button" onClick={addItem} size="sm">
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={`${item.type}-${item.id}-${index}`} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'produto' ? 'default' : 'secondary'}>
                      {item.type}
                    </Badge>
                    <span>{getItemName(item)} (x{item.quantidade})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.type, item.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {formData.items.length > 0 && (
            <div className="border rounded p-4 bg-gray-50">
              <div className="text-lg font-bold text-vertttraue-primary">
                Total: R$ {calculateTotal().toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary-light"
              disabled={formData.items.length === 0}
            >
              Registrar Venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendaModal;
