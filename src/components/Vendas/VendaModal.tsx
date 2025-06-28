
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Product, Conjunto, Kit, Affiliate } from '../../types';

interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: any) => Promise<void>;
  products: Product[];
  conjuntos: Conjunto[];
  kits: Kit[];
  affiliates: Affiliate[];
}

const VendaModal: React.FC<VendaModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  products, 
  conjuntos, 
  kits,
  affiliates 
}) => {
  const [formData, setFormData] = useState({
    tipo_venda: 'online' as 'online' | 'fisica',
    afiliado_id: '',
    data_venda: new Date().toISOString().split('T')[0],
    observacoes: '',
    produtos: [] as { type: 'produto' | 'conjunto' | 'kit'; id: string; quantidade: number; preco: number }[]
  });
  const [loading, setLoading] = useState(false);

  const [selectedType, setSelectedType] = useState<'produto' | 'conjunto' | 'kit'>('produto');
  const [selectedId, setSelectedId] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const getNextSaleId = () => {
    const timestamp = Date.now();
    return `VENDA-${timestamp}`;
  };

  const addItem = () => {
    if (!selectedId || !quantidade) return;

    let preco = 0;
    if (selectedType === 'produto') {
      const produto = products.find(p => p.id === selectedId);
      preco = produto?.preco || 0;
    } else if (selectedType === 'conjunto') {
      const conjunto = conjuntos.find(c => c.id === selectedId);
      preco = conjunto?.preco || 0;
    } else {
      const kit = kits.find(k => k.id === selectedId);
      preco = kit?.preco || 0;
    }

    const existingIndex = formData.produtos.findIndex(
      item => item.type === selectedType && item.id === selectedId
    );

    if (existingIndex >= 0) {
      const newItems = [...formData.produtos];
      newItems[existingIndex].quantidade += parseInt(quantidade);
      setFormData({ ...formData, produtos: newItems });
    } else {
      setFormData({
        ...formData,
        produtos: [...formData.produtos, {
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
      produtos: formData.produtos.filter(item => !(item.type === type && item.id === id))
    });
  };

  const calculateTotal = () => {
    return formData.produtos.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const saleData = {
        id: getNextSaleId(),
        afiliado_id: formData.afiliado_id || null,
        tipo_venda: formData.tipo_venda,
        valor_total: calculateTotal(),
        observacoes: formData.observacoes,
        data_venda: formData.data_venda,
        produtos: formData.produtos.map(item => ({
          produto_id: item.type === 'produto' ? item.id : null,
          conjunto_id: item.type === 'conjunto' ? item.id : null,
          kit_id: item.type === 'kit' ? item.id : null,
          quantidade: item.quantidade,
          preco_unitario: item.preco
        }))
      };

      await onSave(saleData);
      onClose();
      setFormData({ 
        tipo_venda: 'online', 
        afiliado_id: '', 
        data_venda: new Date().toISOString().split('T')[0],
        observacoes: '',
        produtos: [] 
      });
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('Erro ao registrar venda. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (item: any) => {
    if (item.type === 'produto') {
      const produto = products.find(p => p.id === item.id);
      return produto?.nome || 'Produto não encontrado';
    } else if (item.type === 'conjunto') {
      const conjunto = conjuntos.find(c => c.id === item.id);
      return conjunto?.nome || 'Conjunto não encontrado';
    } else {
      const kit = kits.find(k => k.id === item.id);
      return kit?.nome || 'Kit não encontrado';
    }
  };

  const renderOptions = () => {
    if (selectedType === 'produto') {
      return products.map(product => (
        <option key={product.id} value={product.id}>
          {product.nome} - R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </option>
      ));
    } else if (selectedType === 'conjunto') {
      return conjuntos.map(conjunto => (
        <option key={conjunto.id} value={conjunto.id}>
          {conjunto.nome} - R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </option>
      ));
    } else {
      return kits.map(kit => (
        <option key={kit.id} value={kit.id}>
          {kit.nome} - R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </option>
      ));
    }
  };

  // Filtrar apenas afiliados ativos
  const activeAffiliates = affiliates.filter(affiliate => affiliate.ativo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Venda</Label>
              <select
                value={formData.tipo_venda}
                onChange={(e) => setFormData({ ...formData, tipo_venda: e.target.value as 'online' | 'fisica' })}
                className="w-full rounded border p-2"
              >
                <option value="online">Online</option>
                <option value="fisica">Física</option>
              </select>
            </div>

            <div>
              <Label>Data da Venda</Label>
              <Input
                type="date"
                value={formData.data_venda}
                onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Afiliado (opcional)</Label>
              <select
                value={formData.afiliado_id}
                onChange={(e) => setFormData({ ...formData, afiliado_id: e.target.value })}
                className="w-full rounded border p-2"
              >
                <option value="">Nenhum afiliado</option>
                {activeAffiliates.map(affiliate => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.nome_completo} ({affiliate.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Input
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações sobre a venda (opcional)"
            />
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Itens da Venda</h3>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'produto' | 'conjunto' | 'kit');
                  setSelectedId('');
                }}
                className="rounded border p-2"
              >
                <option value="produto">Produto</option>
                <option value="conjunto">Conjunto</option>
                <option value="kit">Kit</option>
              </select>
              
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 rounded border p-2"
              >
                <option value="">Selecione...</option>
                {renderOptions()}
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
              {formData.produtos.map((item, index) => (
                <div key={`${item.type}-${item.id}-${index}`} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'produto' ? 'default' : item.type === 'conjunto' ? 'secondary' : 'outline'}>
                      {item.type}
                    </Badge>
                    <span>{getItemName(item)} (x{item.quantidade})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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

          {formData.produtos.length > 0 && (
            <div className="border rounded p-4 bg-gray-50">
              <div className="text-lg font-bold text-vertttraue-primary">
                Total: R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary/80"
              disabled={formData.produtos.length === 0 || loading}
            >
              {loading ? 'Registrando...' : 'Registrar Venda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendaModal;
