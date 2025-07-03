
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Supplier } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  suppliers: Supplier[];
  initialProduct?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  suppliers, 
  initialProduct 
}) => {
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    estoque_fisico: 0,
    estoque_site: 0,
    preco: 0,
    preco_compra: 0,
    fornecedor_id: 'none'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialProduct && isOpen) {
      setFormData({
        id: initialProduct.id,
        nome: initialProduct.nome,
        descricao: initialProduct.descricao || '',
        estoque_fisico: initialProduct.estoque_fisico,
        estoque_site: initialProduct.estoque_site,
        preco: initialProduct.preco,
        preco_compra: initialProduct.preco_compra,
        fornecedor_id: initialProduct.fornecedor?.id || 'none'
      });
    } else if (!initialProduct && isOpen) {
      // Gerar ID automático para novos produtos
      const newId = `PROD${Date.now()}`;
      setFormData({
        id: newId,
        nome: '',
        descricao: '',
        estoque_fisico: 0,
        estoque_site: 0,
        preco: 0,
        preco_compra: 0,
        fornecedor_id: 'none'
      });
    }
  }, [initialProduct, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        ...formData,
        id: formData.id.trim(), // Garantir que o ID seja salvo
        estoque_fisico: Number(formData.estoque_fisico),
        estoque_site: Number(formData.estoque_site),
        preco: Number(formData.preco),
        preco_compra: Number(formData.preco_compra),
        fornecedor_id: formData.fornecedor_id === 'none' ? null : formData.fornecedor_id
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialProduct ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="id">ID do Produto</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="ID único do produto"
              required
              disabled={!!initialProduct} // Não permitir editar ID de produto existente
            />
          </div>

          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do produto"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do produto (opcional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estoque_fisico">Estoque Físico</Label>
              <Input
                id="estoque_fisico"
                type="number"
                value={formData.estoque_fisico}
                onChange={(e) => setFormData({ ...formData, estoque_fisico: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="estoque_site">Estoque Site</Label>
              <Input
                id="estoque_site"
                type="number"
                value={formData.estoque_site}
                onChange={(e) => setFormData({ ...formData, estoque_site: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">Preço de Venda</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="preco_compra">Preço de Compra</Label>
              <Input
                id="preco_compra"
                type="number"
                step="0.01"
                value={formData.preco_compra}
                onChange={(e) => setFormData({ ...formData, preco_compra: parseFloat(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label>Fornecedor</Label>
            <Select
              value={formData.fornecedor_id}
              onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum fornecedor</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary/80"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (initialProduct ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
