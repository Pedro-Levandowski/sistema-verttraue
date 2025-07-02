
import { useState, useEffect } from 'react';
import { Sale } from '../types';
import { salesAPI } from '../services/api';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    console.log('🔄 [useSales] Iniciando busca de vendas...');
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useSales] Fazendo chamada para API...');
      const data = await salesAPI.getAll();
      console.log('✅ [useSales] Dados recebidos da API:', data);
      
      if (Array.isArray(data)) {
        setSales(data);
        console.log(`✅ [useSales] ${data.length} vendas carregadas com sucesso`);
      } else {
        console.warn('⚠️ [useSales] Dados não são um array, usando array vazio');
        setSales([]);
      }
    } catch (err) {
      console.error('❌ [useSales] Erro capturado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar vendas';
      console.error('❌ [useSales] Mensagem de erro processada:', errorMessage);
      setError(errorMessage);
      setSales([]);
    } finally {
      setLoading(false);
      console.log('🏁 [useSales] Busca de vendas finalizada');
    }
  };

  const createSale = async (saleData: any) => {
    console.log('➕ [useSales] Criando venda:', saleData);
    try {
      setLoading(true);
      const newSale = await salesAPI.create(saleData);
      setSales(prev => [...prev, newSale]);
      console.log('✅ [useSales] Venda criada com sucesso');
      return newSale;
    } catch (err) {
      console.error('❌ [useSales] Erro ao criar venda:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar venda';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSale = async (id: string, saleData: any) => {
    console.log('🔄 [useSales] Atualizando venda:', id);
    try {
      setLoading(true);
      const updatedSale = await salesAPI.update(id, saleData);
      setSales(prev => prev.map(s => s.id === id ? updatedSale : s));
      console.log('✅ [useSales] Venda atualizada com sucesso');
      return updatedSale;
    } catch (err) {
      console.error('❌ [useSales] Erro ao atualizar venda:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar venda';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (id: string) => {
    console.log('🗑️ [useSales] Deletando venda:', id);
    try {
      setLoading(true);
      await salesAPI.delete(id);
      setSales(prev => prev.filter(s => s.id !== id));
      console.log('✅ [useSales] Venda deletada com sucesso');
    } catch (err) {
      console.error('❌ [useSales] Erro ao deletar venda:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar venda';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 [useSales] Inicializando hook de vendas...');
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
  };
};
