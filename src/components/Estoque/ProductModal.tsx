
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product, Supplier } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  initialProduct?: Product | null;
  suppliers: Supplier[];
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  suppliers
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    preco: 0,
    preco_compra: 0,
    estoque_site: 0,
    estoque_fisico: 0,
    fornecedor_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        // Editando produto existente - manter ID original
        setFormData({
          id: initialProduct.id,
          nome: initialProduct.nome,
          descricao: initialProduct.descricao || '',
          preco: initialProduct.preco,
          preco_compra: initialProduct.preco_compra,
          estoque_site: initialProduct.estoque_site,
          estoque_fisico: initialProduct.estoque_fisico,
          fornecedor_id: initialProduct.fornecedor?.id || ''
        });
      } else {
        // Novo produto - começar com ID vazio para usuário digitar
        setFormData({
          id: '',
          nome: '',
          descricao: '',
          preco: 0,
          preco_compra: 0,
          estoque_site: 0,
          estoque_fisico: 0,
          fornecedor_id: ''
        });
      }
      setError(null);
    }
  }, [isOpen, initialProduct]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.id.trim()) {
      setError('ID é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Usar exatamente o ID que o usuário digitou, SEM gerar automaticamente
      await onSave({
        id: formData.id.trim(), // Usar o ID exato que o usuário digitou
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco: Number(formData.preco),
        preco_compra: Number(formData.preco_compra),
        estoque_site: Number(formData.estoque_site),
        estoque_fisico: Number(formData.estoque_fisico),
        fornecedor_id: formData.fornecedor_id || null
      });
      
      onClose();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialProduct ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id">ID do Produto *</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                placeholder="Ex: PROD123"
                required
                disabled={!!initialProduct} // Só desabilitar se estiver editando
              />
              {!initialProduct && (
                <p className="text-xs text-gray-500 mt-1">
                  Digite um ID único para o produto
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Nome do produto"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descrição do produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">Preço de Venda (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => handleInputChange('preco', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="preco_compra">Preço de Compra (R$)</Label>
              <Input
                id="preco_compra"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_compra}
                onChange={(e) => handleInputChange('preco_compra', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estoque_site">Estoque Site</Label>
              <Input
                id="estoque_site"
                type="number"
                min="0"
                value={formData.estoque_site}
                onChange={(e) => handleInputChange('estoque_site', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="estoque_fisico">Estoque Físico</Label>
              <Input
                id="estoque_fisico"
                type="number"
                min="0"
                value={formData.estoque_fisico}
                onChange={(e) => handleInputChange('estoque_fisico', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Fornecedor</Label>
            <Select
              value={formData.fornecedor_id}
              onValueChange={(value) => handleInputChange('fornecedor_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum fornecedor</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.nome} - {supplier.cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
