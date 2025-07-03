
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Conjunto, Kit, Affiliate, Sale } from '../../types';
import { estoqueAPI } from '../../services/api';

interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: any) => Promise<void>;
  products: Product[];
  conjuntos: Conjunto[];
  kits: Kit[];
  affiliates: Affiliate[];
  initialSale?: Sale | null;
}

const VendaModal: React.FC<VendaModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  products, 
  conjuntos, 
  kits,
  affiliates,
  initialSale 
}) => {
  const [formData, setFormData] = useState({
    tipo_venda: 'online' as 'online' | 'fisica',
    afiliado_id: 'none',
    data_venda: new Date().toISOString().split('T')[0],
    observacoes: '',
    produtos: [] as { type: 'produto' | 'conjunto' | 'kit'; id: string; quantidade: number; preco: number }[]
  });
  const [loading, setLoading] = useState(false);
  const [affiliateProducts, setAffiliateProducts] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState<'produto' | 'conjunto' | 'kit'>('produto');
  const [selectedId, setSelectedId] = useState('none');
  const [quantidade, setQuantidade] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Load initial sale data when editing
  useEffect(() => {
    if (initialSale && isOpen) {
      setFormData({
        tipo_venda: (initialSale.tipo as 'online' | 'fisica') || 'online',
        afiliado_id: initialSale.afiliado_id || 'none',
        data_venda: initialSale.data_venda ? new Date(initialSale.data_venda).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        observacoes: initialSale.observacoes || '',
        produtos: initialSale.produtos?.map(item => ({
          type: item.item_tipo as 'produto' | 'conjunto' | 'kit',
          id: item.produto_id || item.kit_id || item.conjunto_id || '',
          quantidade: item.quantidade,
          preco: item.preco_unitario
        })) || []
      });
    } else if (!initialSale && isOpen) {
      // Reset form for new sale
      setFormData({
        tipo_venda: 'online',
        afiliado_id: 'none',
        data_venda: new Date().toISOString().split('T')[0],
        observacoes: '',
        produtos: []
      });
    }
  }, [initialSale, isOpen]);

  // Buscar produtos do afiliado quando venda física e afiliado selecionado
  useEffect(() => {
    const fetchAffiliateProducts = async () => {
      if (formData.tipo_venda === 'fisica' && formData.afiliado_id !== 'none') {
        try {
          const data = await estoqueAPI.getAffiliateProducts(formData.afiliado_id);
          setAffiliateProducts(data);
        } catch (error) {
          console.error('Erro ao buscar produtos do afiliado:', error);
          setAffiliateProducts([]);
        }
      } else {
        setAffiliateProducts([]);
      }
    };

    fetchAffiliateProducts();
  }, [formData.tipo_venda, formData.afiliado_id]);

  const getNextSaleId = () => {
    const timestamp = Date.now();
    return `VENDA-${timestamp}`;
  };

  const addItem = () => {
    if (!selectedId || selectedId === 'none' || !quantidade) return;

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

    setSelectedId('none');
    setQuantidade('');
    setProductSearch('');
  };

  const addProductById = () => {
    if (!productSearch.trim() || !quantidade) return;
    
    const product = products.find(p => p.id.toLowerCase() === productSearch.toLowerCase());
    if (product) {
      const existingIndex = formData.produtos.findIndex(
        item => item.type === 'produto' && item.id === product.id
      );

      if (existingIndex >= 0) {
        const newItems = [...formData.produtos];
        newItems[existingIndex].quantidade += parseInt(quantidade);
        setFormData({ ...formData, produtos: newItems });
      } else {
        setFormData({
          ...formData,
          produtos: [...formData.produtos, {
            type: 'produto',
            id: product.id,
            quantidade: parseInt(quantidade),
            preco: product.preco
          }]
        });
      }
      
      setProductSearch('');
      setQuantidade('');
    } else {
      alert('Produto não encontrado!');
    }
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
        id: initialSale?.id || getNextSaleId(),
        afiliado_id: formData.afiliado_id === 'none' ? null : formData.afiliado_id,
        tipo_venda: formData.tipo_venda,
        valor_total: calculateTotal(),
        observacoes: formData.observacoes,
        data_venda: formData.data_venda,
        produtos: formData.produtos.map(item => ({
          produto_id: item.type === 'produto' ? item.id : null,
          conjunto_id: item.type === 'conjunto' ? item.id : null,
          kit_id: item.type === 'kit' ? item.id : null,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          subtotal: item.preco * item.quantidade
        }))
      };

      await onSave(saleData);
      onClose();
      setFormData({ 
        tipo_venda: 'online', 
        afiliado_id: 'none', 
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

  const getAvailableProducts = () => {
    if (formData.tipo_venda === 'fisica' && formData.afiliado_id !== 'none') {
      // Para vendas físicas, mostrar apenas produtos do afiliado
      return affiliateProducts.filter(p => 
        selectedType === 'produto' && p.estoque_afiliado > 0
      );
    } else {
      // Para vendas online, mostrar todos os produtos
      if (selectedType === 'produto') {
        return products.filter(p => p.estoque_site > 0);
      } else if (selectedType === 'conjunto') {
        return conjuntos;
      } else {
        return kits;
      }
    }
  };

  const renderOptions = () => {
    const availableItems = getAvailableProducts();
    
    if (selectedType === 'produto') {
      if (formData.tipo_venda === 'fisica' && formData.afiliado_id !== 'none') {
        return affiliateProducts.map(product => (
          <SelectItem key={product.id} value={product.id}>
            {product.nome} - R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
            (Estoque: {product.estoque_afiliado})
          </SelectItem>
        ));
      } else {
        return products.filter(p => p.estoque_site > 0).map(product => (
          <SelectItem key={product.id} value={product.id}>
            {product.nome} - R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </SelectItem>
        ));
      }
    } else if (selectedType === 'conjunto') {
      return conjuntos.map(conjunto => (
        <SelectItem key={conjunto.id} value={conjunto.id}>
          {conjunto.nome} - R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </SelectItem>
      ));
    } else {
      return kits.map(kit => (
        <SelectItem key={kit.id} value={kit.id}>
          {kit.nome} - R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </SelectItem>
      ));
    }
  };

  // Filtrar apenas afiliados ativos
  const activeAffiliates = affiliates.filter(affiliate => affiliate.ativo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialSale ? 'Editar Venda' : 'Registrar Nova Venda'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Venda</Label>
              <Select 
                value={formData.tipo_venda} 
                onValueChange={(value) => setFormData({ ...formData, tipo_venda: value as 'online' | 'fisica' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="fisica">Física</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Afiliado {formData.tipo_venda === 'fisica' && '(obrigatório)'}</Label>
              <Select
                value={formData.afiliado_id}
                onValueChange={(value) => setFormData({ ...formData, afiliado_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um afiliado" />
                </SelectTrigger>
                <SelectContent>
                  {formData.tipo_venda === 'online' && <SelectItem value="none">Nenhum afiliado</SelectItem>}
                  {activeAffiliates.map(affiliate => (
                    <SelectItem key={affiliate.id} value={affiliate.id}>
                      {affiliate.nome_completo} ({affiliate.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            
            {/* Busca por ID do Produto */}
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <Label className="text-sm font-medium mb-2 block">Buscar Produto por ID</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Digite o ID do produto"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Qtd"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  min="1"
                />
                <Button type="button" onClick={addProductById} size="sm">
                  Adicionar por ID
                </Button>
              </div>
            </div>
            
            {/* Seleção por Lista */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value as 'produto' | 'conjunto' | 'kit');
                  setSelectedId('none');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produto">Produto</SelectItem>
                  {formData.tipo_venda === 'online' && <SelectItem value="conjunto">Conjunto</SelectItem>}
                  {formData.tipo_venda === 'online' && <SelectItem value="kit">Kit</SelectItem>}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedId}
                onValueChange={(value) => setSelectedId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione...</SelectItem>
                  {renderOptions()}
                </SelectContent>
              </Select>
              
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
              disabled={formData.produtos.length === 0 || loading || (formData.tipo_venda === 'fisica' && formData.afiliado_id === 'none')}
            >
              {loading ? (initialSale ? 'Atualizando...' : 'Registrando...') : (initialSale ? 'Atualizar Venda' : 'Registrar Venda')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendaModal;
