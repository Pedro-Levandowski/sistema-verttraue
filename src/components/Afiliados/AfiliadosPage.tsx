
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '../Layout/Header';
import AfiliadoModal from './AfiliadoModal';
import { mockAffiliates } from '../../data/mockData';
import { Affiliate } from '../../types';

interface AfiliadosPageProps {
  onBack: () => void;
}

const AfiliadosPage: React.FC<AfiliadosPageProps> = ({ onBack }) => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(mockAffiliates);
  const [showAfiliadoModal, setShowAfiliadoModal] = useState(false);
  const [editingAfiliado, setEditingAfiliado] = useState<Affiliate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAffiliate = (id: string) => {
    setAffiliates(affiliates.map(affiliate =>
      affiliate.id === id ? { ...affiliate, ativo: !affiliate.ativo } : affiliate
    ));
  };

  const handleEditAfiliado = (affiliate: Affiliate) => {
    setEditingAfiliado(affiliate);
    setShowAfiliadoModal(true);
  };

  const handleSaveAfiliado = (afiliadoData: any) => {
    if (editingAfiliado) {
      setAffiliates(affiliates.map(a => a.id === editingAfiliado.id ? { ...afiliadoData, id: editingAfiliado.id } : a));
    } else {
      const newAfiliado = { ...afiliadoData, id: `AFF${Date.now()}`, ativo: true };
      setAffiliates([...affiliates, newAfiliado]);
    }
    setEditingAfiliado(null);
    setShowAfiliadoModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Afiliados"
        onBack={onBack}
        actions={
          <Button
            onClick={() => {
              setEditingAfiliado(null);
              setShowAfiliadoModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary-light"
          >
            Cadastrar Afiliado
          </Button>
        }
      />

      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar afiliados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">Lista de Afiliados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome Completo</th>
                  <th className="text-left p-2">E-mail</th>
                  <th className="text-left p-2">Telefone</th>
                  <th className="text-left p-2">Comissão (%)</th>
                  <th className="text-left p-2">Chave PIX</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-semibold">{affiliate.nome_completo}</td>
                    <td className="p-2">{affiliate.email}</td>
                    <td className="p-2">{affiliate.telefone}</td>
                    <td className="p-2">{affiliate.comissao}%</td>
                    <td className="p-2 font-mono text-xs">{affiliate.chave_pix}</td>
                    <td className="p-2">
                      <Badge variant={affiliate.ativo ? 'default' : 'secondary'}>
                        {affiliate.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={affiliate.ativo ? 'destructive' : 'default'}
                          onClick={() => toggleAffiliate(affiliate.id)}
                        >
                          {affiliate.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAfiliado(affiliate)}
                          className="hover:bg-vertttraue-primary hover:text-white"
                        >
                          Editar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAffiliates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum afiliado encontrado
            </div>
          )}
        </div>
      </div>

      <AfiliadoModal
        isOpen={showAfiliadoModal}
        onClose={() => {
          setShowAfiliadoModal(false);
          setEditingAfiliado(null);
        }}
        onSave={handleSaveAfiliado}
        afiliado={editingAfiliado}
      />
    </div>
  );
};

export default AfiliadosPage;
