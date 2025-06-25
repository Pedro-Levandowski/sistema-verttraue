
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Affiliate } from '../../types';

interface AfiliadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (afiliado: any) => void;
  afiliado?: Affiliate | null;
}

const AfiliadoModal: React.FC<AfiliadoModalProps> = ({ isOpen, onClose, onSave, afiliado }) => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    comissao: '',
    chave_pix: ''
  });

  useEffect(() => {
    if (afiliado) {
      setFormData({
        nome_completo: afiliado.nome_completo,
        email: afiliado.email,
        telefone: afiliado.telefone,
        comissao: afiliado.comissao.toString(),
        chave_pix: afiliado.chave_pix
      });
    } else {
      setFormData({
        nome_completo: '',
        email: '',
        telefone: '',
        comissao: '',
        chave_pix: ''
      });
    }
  }, [afiliado, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const afiliadoData = {
      nome_completo: formData.nome_completo,
      email: formData.email,
      telefone: formData.telefone,
      comissao: parseFloat(formData.comissao),
      chave_pix: formData.chave_pix,
      ativo: afiliado?.ativo ?? true
    };
    onSave(afiliadoData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{afiliado ? 'Editar Afiliado' : 'Cadastrar Afiliado'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail de Contato *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <Label htmlFor="comissao">Comissão (%) *</Label>
            <Input
              id="comissao"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.comissao}
              onChange={(e) => setFormData({ ...formData, comissao: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="chave_pix">Chave PIX *</Label>
            <Input
              id="chave_pix"
              value={formData.chave_pix}
              onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
              placeholder="E-mail, telefone ou chave aleatória"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary-light">
              {afiliado ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AfiliadoModal;
