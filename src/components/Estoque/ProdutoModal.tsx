
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Product, Supplier } from '../../types';

interface ProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  product?: Product | null;
  suppliers: Supplier[];
}

const ProdutoModal: React.FC<ProdutoModalProps> = ({ isOpen, onClose, onSave, product, suppliers }) => {
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    estoque_fisico: 0,
    estoque_site: 0,
    preco: 0,
    preco_compra: 0,
    fornecedor_id: ''
  });

  useEffect(() => {
    console.log('🔧 [ProdutoModal] Atualizando formulário:', { product, isOpen });
    if (product && isOpen) {
      setFormData({
        id: product.id || '',
        nome: product.nome || '',
        descricao: product.descricao || '',
        estoque_fisico: product.estoque_fisico || 0,
        estoque_site: product.estoque_site || 0,
        preco: product.preco || 0,
        preco_compra: product.preco_compra || 0,
        fornecedor_id: product.fornecedor?.id || 'none'
      });
    } else if (!product && isOpen) {
      setFormData({
        id: `PROD${Date.now()}`,
        nome: '',
        descricao: '',
        estoque_fisico: 0,
        estoque_site: 0,
        preco: 0,
        preco_compra: 0,
        fornecedor_id: 'none'
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('💾 [ProdutoModal] Salvando produto:', formData);
    
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o nome do produto.');
      return;
    }

    // Confirmação antes de salvar
    const action = product ? 'atualizar' : 'criar';
    if (confirm(`Tem certeza que deseja ${action} este produto?`)) {
      try {
        // Preparar dados no formato esperado
        const productData = {
          ...formData,
          estoque_fisico: Number(formData.estoque_fisico) || 0,
          estoque_site: Number(formData.estoque_site) || 0,
          preco: Number(formData.preco) || 0,
          preco_compra: Number(formData.preco_compra) || 0,
          fornecedor_id: formData.fornecedor_id === 'none' ? null : formData.fornecedor_id
        };
        
        console.log('📤 [ProdutoModal] Enviando dados:', productData);
        onSave(productData);
      } catch (error) {
        console.error('❌ [ProdutoModal] Erro ao salvar:', error);
        alert('Erro ao salvar produto. Tente novamente.');
      }
    }
  };

  const handleClose = () => {
    console.log('🚪 [ProdutoModal] Fechando modal');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!product && (
            <div>
              <Label htmlFor="id">ID do Produto *</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                placeholder="Ex: PROD001"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome do produto"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do produto"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="fornecedor_id">Fornecedor</Label>
            <Select 
              value={formData.fornecedor_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, fornecedor_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum fornecedor</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.nome} - {supplier.cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estoque_site">Estoque Site</Label>
              <Input
                id="estoque_site"
                type="number"
                min="0"
                value={formData.estoque_site}
                onChange={(e) => setFormData(prev => ({ ...prev, estoque_site: parseInt(e.target.value) || 0 }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, estoque_fisico: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco_compra">Preço de Compra</Label>
              <Input
                id="preco_compra"
                type="number"
                min="0"
                step="0.01"
                value={formData.preco_compra}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_compra: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="preco">Preço de Venda</Label>
              <Input
                id="preco"
                type="number"
                min="0"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {product ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProdutoModal;
