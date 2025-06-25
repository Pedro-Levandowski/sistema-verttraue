
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AfiliadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AfiliadoModal: React.FC<AfiliadoModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    comissao: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Afiliado cadastrado:', formData);
    onClose();
    setFormData({ nome: '', contato: '', comissao: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Afiliado</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="contato">E-mail de Contato *</Label>
            <Input
              id="contato"
              type="email"
              value={formData.contato}
              onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
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

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-vertttraue-primary hover:bg-vertttraue-primary-light">
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AfiliadoModal;
