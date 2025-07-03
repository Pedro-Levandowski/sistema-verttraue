
import { useState } from 'react';
import { estoqueAPI } from '../services/api';

export const useEstoque = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAffiliateStock = async (data: {
    produto_id: string;
    afiliado_id: string;
    quantidade: number;
  }) => {
    console.log('📦 [useEstoque] Atualizando estoque do afiliado:', data);
    try {
      setLoading(true);
      setError(null);
      
      const result = await estoqueAPI.updateAffiliateStock(data);
      console.log('✅ [useEstoque] Estoque atualizado com sucesso');
      return result;
    } catch (err) {
      console.error('❌ [useEstoque] Erro ao atualizar estoque:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar estoque do afiliado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAffiliateStock = async (afiliadoId: string) => {
    console.log('📦 [useEstoque] Buscando estoque do afiliado:', afiliadoId);
    try {
      setLoading(true);
      setError(null);
      
      const result = await estoqueAPI.getAffiliateStock(afiliadoId);
      console.log('✅ [useEstoque] Estoque do afiliado carregado');
      return result;
    } catch (err) {
      console.error('❌ [useEstoque] Erro ao buscar estoque:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estoque do afiliado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateAffiliateStock,
    getAffiliateStock,
  };
};
