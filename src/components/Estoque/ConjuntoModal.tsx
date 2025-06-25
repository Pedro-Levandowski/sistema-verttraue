
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Product } from '../../types';

interface ConjuntoModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

const ConjuntoModal: React.FC<ConjuntoModalProps> = ({ isOpen, onClose, products }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    produtos: [] as { produto_id: string; quantidade: number }[]
  });
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantidade, setQuantidade] = useState('');

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
    if (formData.produtos.length === 0) return 0;
    
    return Math.min(...formData.produtos.map(cp => {
      const produto = products.find(p => p.id === cp.produto_id);
      return produto ? Math.floor(produto.estoque_total / cp.quantidade) : 0;
    }));
  };

  const calculatePreco = () => {
    const precoTotal = formData.produtos.reduce((total, cp) => {
      const produto = products.find(p => p.id === cp.produto_id);
      return total + (produto ? produto.preco * cp.quantidade : 0);
    }, 0);
    return precoTotal * 0.9; // 10% desconto
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Conjunto criado:', {
      ...formData,
      estoque_disponivel: calculateEstoque(),
      preco: calculatePreco()
    });
    onClose();
    setFormData({ nome: '', descricao: '', produtos: [] });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Conjuntos</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Conjunto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Produtos do Conjunto</h3>
            
            <div className="flex gap-2 mb-4">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 rounded border p-2"
              >
                <option value="">Selecione um produto</option>
                {products.map(product => (
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

            <div className="space-y-2">
              {formData.produtos.map((cp) => {
                const produto = products.find(p => p.id === cp.produto_id);
                return (
                  <div key={cp.produto_id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{produto?.nome} (x{cp.quantidade})</span>
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
                <div>Estoque Disponível: <Badge>{calculateEstoque()}</Badge> (Calculado automaticamente)</div>
                <div>Preço Final: <span className="font-bold text-vertttraue-primary">R$ {calculatePreco().toFixed(2)}</span> (10% desconto aplicado)</div>
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
              disabled={formData.produtos.length === 0}
            >
              Criar Conjunto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConjuntoModal;
