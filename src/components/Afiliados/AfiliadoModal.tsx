
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
    chave_pix: '',
    tipo_chave_pix: 'aleatoria' as 'aleatoria' | 'cpf' | 'telefone'
  });

  useEffect(() => {
    if (afiliado) {
      setFormData({
        nome_completo: afiliado.nome_completo,
        email: afiliado.email,
        telefone: afiliado.telefone,
        comissao: afiliado.comissao.toString(),
        chave_pix: afiliado.chave_pix,
        tipo_chave_pix: afiliado.tipo_chave_pix
      });
    } else {
      setFormData({
        nome_completo: '',
        email: '',
        telefone: '',
        comissao: '',
        chave_pix: '',
        tipo_chave_pix: 'aleatoria'
      });
    }
  }, [afiliado, isOpen]);

  const formatTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const afiliadoData = {
      nome_completo: formData.nome_completo,
      email: formData.email,
      telefone: formData.telefone,
      comissao: parseFloat(formData.comissao),
      chave_pix: formData.chave_pix,
      tipo_chave_pix: formData.tipo_chave_pix,
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
              onChange={handleTelefoneChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
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
            <Label htmlFor="tipo_chave_pix">Tipo de Chave PIX *</Label>
            <select
              id="tipo_chave_pix"
              value={formData.tipo_chave_pix}
              onChange={(e) => setFormData({ ...formData, tipo_chave_pix: e.target.value as 'aleatoria' | 'cpf' | 'telefone' })}
              className="w-full rounded border p-2"
              required
            >
              <option value="aleatoria">Chave Aleatória</option>
              <option value="cpf">CPF</option>
              <option value="telefone">Telefone</option>
            </select>
          </div>

          <div>
            <Label htmlFor="chave_pix">Chave PIX *</Label>
            <Input
              id="chave_pix"
              value={formData.chave_pix}
              onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
              placeholder={
                formData.tipo_chave_pix === 'cpf' ? 'xxx.xxx.xxx-xx' :
                formData.tipo_chave_pix === 'telefone' ? '11999999999' :
                'Chave aleatória gerada pelo banco'
              }
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary/80">
              {afiliado ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AfiliadoModal;
