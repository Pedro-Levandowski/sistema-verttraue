
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Product, Conjunto } from '../../types';

interface ConjuntoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conjunto: any) => void;
  products: Product[];
  conjunto?: Conjunto | null;
}

const ConjuntoModal: React.FC<ConjuntoModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  products, 
  conjunto 
}) => {
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    preco: '',
    produtos: [] as { produto_id: string; quantidade: number }[]
  });
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantidade, setQuantidade] = useState('');

  useEffect(() => {
    if (conjunto && isOpen) {
      setFormData({
        id: conjunto.id,
        nome: conjunto.nome,
        descricao: conjunto.descricao,
        preco: conjunto.preco.toString(),
        produtos: Array.isArray(conjunto.produtos) ? conjunto.produtos : []
      });
    } else if (!conjunto && isOpen) {
      setFormData({
        id: `CONJ${Date.now()}`,
        nome: '',
        descricao: '',
        preco: '',
        produtos: []
      });
    }
  }, [conjunto, isOpen]);

  const addProduct = () => {
    if (selectedProductId && quantidade) {
      const existingIndex = formData.produtos.findIndex(p => p.produto_id === selectedProductId);
      if (existingIndex >= 0) {
        const newProdutos = [...formData.produtos];
        newProdutos[existingIndex].quantidade = parseInt(quantidade);
        setFormData({ ...formData, produtos: newProdutos });
      } else {
        setFormData({
          ...formData,
          produtos: [...formData.produtos, { produto_id: selectedProductId, quantidade: parseInt(quantidade) }]
        });
      }
      setSelectedProductId('');
      setQuantidade('');
    }
  };

  const removeProduct = (produto_id: string) => {
    setFormData({
      ...formData,
      produtos: formData.produtos.filter(p => p.produto_id !== produto_id)
    });
  };

  const calculateEstoque = () => {
    if (formData.produtos.length === 0 || !Array.isArray(products) || products.length === 0) return 0;
    
    return Math.min(...formData.produtos.map(cp => {
      const produto = products.find(p => p.id === cp.produto_id);
      const estoquesite = produto ? produto.estoque_site : 0;
      return Math.floor(estoquesite / cp.quantidade);
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o nome do conjunto.');
      return;
    }

    if (formData.produtos.length === 0) {
      alert('Por favor, adicione pelo menos um produto ao conjunto.');
      return;
    }

    const conjuntoData = {
      id: formData.id || `CONJ${Date.now()}`,
      nome: formData.nome,
      descricao: formData.descricao,
      preco: parseFloat(formData.preco) || 0,
      produtos: formData.produtos,
      estoque_disponivel: calculateEstoque()
    };
    
    onSave(conjuntoData);
  };

  // Verificar se produtos estão disponíveis
  const availableProducts = Array.isArray(products) ? products : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{conjunto ? 'Editar Conjunto' : 'Criar Conjunto'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="id">ID do Conjunto *</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="Ex: CONJ001"
              required
              disabled={!!conjunto}
            />
          </div>

          <div>
            <Label htmlFor="nome">Nome do Conjunto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do conjunto"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do conjunto"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Produtos do Conjunto</h3>
            
            {availableProducts.length > 0 ? (
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 rounded border border-gray-300 p-2"
                >
                  <option value="">Selecione um produto</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nome} (ID: {product.id})
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Qtd"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-20"
                  min="1"
                />
                <Button type="button" onClick={addProduct} size="sm">
                  Adicionar
                </Button>
              </div>
            ) : (
              <div className="text-gray-500 text-sm mb-4">
                Nenhum produto disponível. Crie produtos primeiro.
              </div>
            )}

            <div className="space-y-2">
              {formData.produtos.map((cp) => {
                const produto = availableProducts.find(p => p.id === cp.produto_id);
                return (
                  <div key={cp.produto_id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{produto?.nome || 'Produto não encontrado'} (x{cp.quantidade})</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProduct(cp.produto_id)}
                    >
                      Remover
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {formData.produtos.length > 0 && (
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Resumo do Conjunto</h3>
              <div className="space-y-1 text-sm">
                <div>Estoque Disponível: <Badge>{calculateEstoque()}</Badge> (Baseado no estoque site)</div>
                <div>Preço: <span className="font-bold text-vertttraue-primary">R$ {parseFloat(formData.preco || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary/80"
              disabled={formData.produtos.length === 0 || !formData.nome.trim()}
            >
              {conjunto ? 'Salvar' : 'Criar Conjunto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConjuntoModal;
