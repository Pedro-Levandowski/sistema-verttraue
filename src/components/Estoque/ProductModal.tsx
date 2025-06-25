
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    estoque_total: '',
    estoque_fisico: '',
    estoque_site: '',
    preco: '',
    fornecedor_nome: '',
    fornecedor_cidade: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Produto adicionado:', formData);
    onClose();
    setFormData({
      nome: '',
      descricao: '',
      estoque_total: '',
      estoque_fisico: '',
      estoque_site: '',
      preco: '',
      fornecedor_nome: '',
      fornecedor_cidade: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
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
                value={formData.estoque_total}
                onChange={(e) => setFormData({ ...formData, estoque_total: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="estoque_fisico">Est. Físico</Label>
              <Input
                id="estoque_fisico"
                type="number"
                value={formData.estoque_fisico}
                onChange={(e) => setFormData({ ...formData, estoque_fisico: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="estoque_site">Est. Site</Label>
              <Input
                id="estoque_site"
                type="number"
                value={formData.estoque_site}
                onChange={(e) => setFormData({ ...formData, estoque_site: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$)</Label>
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
            <Label htmlFor="fornecedor_nome">Fornecedor</Label>
            <Input
              id="fornecedor_nome"
              value={formData.fornecedor_nome}
              onChange={(e) => setFormData({ ...formData, fornecedor_nome: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="fornecedor_cidade">Cidade do Fornecedor</Label>
            <Input
              id="fornecedor_cidade"
              value={formData.fornecedor_cidade}
              onChange={(e) => setFormData({ ...formData, fornecedor_cidade: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary-light">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
