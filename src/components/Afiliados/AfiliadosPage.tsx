
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../Layout/Header';
import AfiliadoModal from './AfiliadoModal';
import AfiliadoProdutosModal from './AfiliadoProdutosModal';
import { useAffiliates } from '../../hooks/useAffiliates';
import { useProducts } from '../../hooks/useProducts';
import { Affiliate } from '../../types';

interface AfiliadosPageProps {
  onBack: () => void;
}

const AfiliadosPage: React.FC<AfiliadosPageProps> = ({ onBack }) => {
  const { affiliates, loading: affiliatesLoading, error: affiliatesError, createAffiliate, updateAffiliate, deleteAffiliate } = useAffiliates();
  const { products } = useProducts();
  
  const [showModal, setShowModal] = useState(false);
  const [showProdutosModal, setShowProdutosModal] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setShowModal(true);
  };

  const handleDelete = async (affiliate: Affiliate) => {
    if (confirm(`Tem certeza que deseja excluir o afiliado "${affiliate.nome_completo}"?`)) {
      try {
        await deleteAffiliate(affiliate.id);
        console.log('✅ Afiliado excluído com sucesso');
      } catch (error) {
        console.error('❌ Erro ao excluir afiliado:', error);
        alert('Erro ao excluir afiliado. Verifique se não há vendas vinculadas.');
      }
    }
  };

  const handleShowProdutos = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowProdutosModal(true);
  };

  const handleSave = async (affiliateData: any) => {
    try {
      if (editingAffiliate) {
        await updateAffiliate(editingAffiliate.id, affiliateData);
        console.log('✅ Afiliado atualizado com sucesso');
      } else {
        const newId = `AFIL-${Date.now()}`;
        await createAffiliate({ ...affiliateData, id: newId });
        console.log('✅ Afiliado criado com sucesso');
      }
      setEditingAffiliate(null);
      setShowModal(false);
    } catch (error) {
      console.error('❌ Erro ao salvar afiliado:', error);
      alert('Erro ao salvar afiliado. Verifique o console para mais detalhes.');
    }
  };

  const getAffiliateProducts = (affiliateId: string) => {
    return products.filter(product => 
      product.afiliado_estoque?.some(ae => ae.afiliado_id === affiliateId)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header title="Afiliados" onBack={onBack} />

      <div className="container mx-auto p-6">
        {/* Indicador de carregamento */}
        {affiliatesLoading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando afiliados do banco de dados...</AlertDescription>
          </Alert>
        )}

        {/* Indicador de erro */}
        {affiliatesError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao conectar com o backend: {affiliatesError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar afiliados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              setEditingAffiliate(null);
              setShowModal(true);
            }}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            disabled={affiliatesLoading}
          >
            Adicionar Afiliado
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
            Lista de Afiliados ({affiliates.length})
          </h2>
          
          {affiliates.length === 0 && !affiliatesLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum afiliado encontrado no banco de dados.</p>
              <p className="text-sm">Adicione o primeiro afiliado clicando no botão acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Telefone</th>
                    <th className="text-left p-3">Comissão</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Produtos</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAffiliates.map((affiliate) => {
                    const affiliateProducts = getAffiliateProducts(affiliate.id);
                    return (
                      <tr key={affiliate.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{affiliate.id}</td>
                        <td className="p-3 font-semibold">{affiliate.nome_completo}</td>
                        <td className="p-3">{affiliate.email}</td>
                        <td className="p-3">{affiliate.telefone || 'N/A'}</td>
                        <td className="p-3">{affiliate.comissao}%</td>
                        <td className="p-3">
                          <Badge variant={affiliate.ativo ? "default" : "secondary"}>
                            {affiliate.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="bg-vertttraue-primary text-white px-2 py-1 rounded text-xs">
                            {affiliateProducts.length} produtos
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShowProdutos(affiliate)}
                              className="hover:bg-vertttraue-primary hover:text-white text-xs"
                            >
                              Produtos
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(affiliate)}
                              className="hover:bg-vertttraue-primary hover:text-white text-xs"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(affiliate)}
                              className="hover:bg-red-500 hover:text-white text-xs"
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AfiliadoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAffiliate(null);
        }}
        onSave={handleSave}
        afiliado={editingAffiliate}
      />

      <AfiliadoProdutosModal
        isOpen={showProdutosModal}
        onClose={() => setShowProdutosModal(false)}
        afiliado={selectedAffiliate}
        products={selectedAffiliate ? getAffiliateProducts(selectedAffiliate.id) : []}
      />
    </div>
  );
};

export default AfiliadosPage;
