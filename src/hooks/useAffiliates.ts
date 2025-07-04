import { useState, useEffect } from 'react';
import { Affiliate } from '../types';
import { affiliatesAPI } from '../services/api';

export const useAffiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const data = await affiliatesAPI.getAll();
      setAffiliates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar afiliados');
      console.error('Erro ao buscar afiliados:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAffiliate = async (affiliateData: Affiliate) => {
    console.log('➕ [useAffiliates] Criando afiliado:', affiliateData);
    try {
      // USAR O ID FORNECIDO PELO USUÁRIO - NÃO GERAR AUTOMATICAMENTE
      const backendData = {
        id: affiliateData.id, // Usar o ID exato fornecido pelo usuário
        nome_completo: affiliateData.nome_completo,
        email: affiliateData.email,
        telefone: affiliateData.telefone || '',
        comissao: affiliateData.comissao || 0,
        chave_pix: affiliateData.chave_pix || '',
        tipo_chave_pix: affiliateData.tipo_chave_pix || 'aleatoria',
        ativo: affiliateData.ativo !== false
      };
      
      console.log('📤 [useAffiliates] Enviando para backend:', backendData);
      const newAffiliate = await affiliatesAPI.create(backendData);
      setAffiliates(prev => [...prev, newAffiliate]);
      console.log('✅ [useAffiliates] Afiliado criado com sucesso');
      return newAffiliate;
    } catch (err) {
      console.error('❌ [useAffiliates] Erro ao criar afiliado:', err);
      throw err;
    }
  };

  const updateAffiliate = async (id: string, affiliateData: Partial<Affiliate>) => {
    try {
      const updatedAffiliate = await affiliatesAPI.update(id, affiliateData);
      setAffiliates(prev => prev.map(a => a.id === id ? updatedAffiliate : a));
      return updatedAffiliate;
    } catch (err) {
      throw err;
    }
  };

  const deleteAffiliate = async (id: string) => {
    try {
      await affiliatesAPI.delete(id);
      setAffiliates(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  return {
    affiliates,
    loading,
    error,
    fetchAffiliates,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
  };
};
