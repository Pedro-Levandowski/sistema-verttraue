
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Affiliate } from '../../types';

interface AfiliadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  afiliado?: Affiliate | null;
}

const AfiliadoModal: React.FC<AfiliadoModalProps> = ({ isOpen, onClose, onSave, afiliado }) => {
  const [formData, setFormData] = useState({
    id: '',
    nome_completo: '',
    email: '',
    telefone: '',
    comissao: 0,
    chave_pix: '',
    tipo_chave_pix: 'aleatoria' as 'aleatoria' | 'cpf' | 'telefone' | 'email',
    ativo: true
  });

  useEffect(() => {
    if (afiliado) {
      setFormData({
        id: afiliado.id,
        nome_completo: afiliado.nome_completo,
        email: afiliado.email,
        telefone: afiliado.telefone || '',
        comissao: afiliado.comissao || 0,
        chave_pix: afiliado.chave_pix || '',
        tipo_chave_pix: (afiliado.tipo_chave_pix as any) || 'aleatoria',
        ativo: afiliado.ativo
      });
    } else {
      setFormData({
        id: '',
        nome_completo: '',
        email: '',
        telefone: '',
        comissao: 0,
        chave_pix: '',
        tipo_chave_pix: 'aleatoria',
        ativo: true
      });
    }
  }, [afiliado, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.nome_completo || !formData.email) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Confirmação antes de salvar
    const action = afiliado ? 'atualizar' : 'criar';
    if (confirm(`Tem certeza que deseja ${action} este afiliado?`)) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {afiliado ? 'Editar Afiliado' : 'Novo Afiliado'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="id">ID do Afiliado *</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="Ex: AFIL-001"
              disabled={!!afiliado} // Só permite editar se for novo
              required
            />
          </div>

          <div>
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
              placeholder="Nome completo do afiliado"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="comissao">Comissão (%)</Label>
            <Input
              id="comissao"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.comissao}
              onChange={(e) => setFormData(prev => ({ ...prev, comissao: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="tipo_chave_pix">Tipo de Chave PIX</Label>
            <Select 
              value={formData.tipo_chave_pix} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_chave_pix: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chave_pix">Chave PIX</Label>
            <Input
              id="chave_pix"
              value={formData.chave_pix}
              onChange={(e) => setFormData(prev => ({ ...prev, chave_pix: e.target.value }))}
              placeholder="Chave PIX do afiliado"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
            />
            <Label htmlFor="ativo">Afiliado Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-vertttraue-primary hover:bg-vertttraue-primary/80">
              {afiliado ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AfiliadoModal;
