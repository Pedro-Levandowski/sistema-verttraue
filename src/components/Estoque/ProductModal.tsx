
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Product, Supplier, Affiliate } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product?: Product | null;
  suppliers: Supplier[];
  affiliates: Affiliate[];
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product, 
  suppliers, 
  affiliates 
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    estoque_fisico: '',
    estoque_site: '',
    preco: '',
    preco_custo: '',
    fornecedor_id: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome,
        descricao: product.descricao,
        estoque_fisico: product.estoque_fisico.toString(),
        estoque_site: product.estoque_site.toString(),
        preco: product.preco.toString(),
        preco_custo: product.preco_custo.toString(),
        fornecedor_id: product.fornecedor.id
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        estoque_fisico: '',
        estoque_site: '',
        preco: '',
        preco_custo: '',
        fornecedor_id: ''
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedSupplier = suppliers.find(s => s.id === formData.fornecedor_id);
    if (!selectedSupplier) return;

    const productData = {
      nome: formData.nome,
      descricao: formData.descricao,
      estoque_fisico: parseInt(formData.estoque_fisico),
      estoque_site: parseInt(formData.estoque_site),
      preco: parseFloat(formData.preco),
      preco_custo: parseFloat(formData.preco_custo),
      fornecedor: selectedSupplier,
      afiliado_estoque: []
    };

    onSave(productData);
  };

  const estoqueTotal = (parseInt(formData.estoque_fisico) || 0) + (parseInt(formData.estoque_site) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Produto *</Label>
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

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="estoque_total">Est. Total</Label>
              <Input
                id="estoque_total"
                type="number"
                value={estoqueTotal}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="estoque_fisico">Est. Físico *</Label>
              <Input
                id="estoque_fisico"
                type="number"
                value={formData.estoque_fisico}
                onChange={(e) => setFormData({ ...formData, estoque_fisico: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="estoque_site">Est. Site *</Label>
              <Input
                id="estoque_site"
                type="number"
                value={formData.estoque_site}
                onChange={(e) => setFormData({ ...formData, estoque_site: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="preco_custo">Preço Custo (R$) *</Label>
              <Input
                id="preco_custo"
                type="number"
                step="0.01"
                value={formData.preco_custo}
                onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fornecedor_id">Fornecedor *</Label>
            <select
              id="fornecedor_id"
              value={formData.fornecedor_id}
              onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
              className="w-full rounded border p-2"
              required
            >
              <option value="">Selecione um fornecedor</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.nome} - {supplier.cidade}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary-light">
              {product ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
