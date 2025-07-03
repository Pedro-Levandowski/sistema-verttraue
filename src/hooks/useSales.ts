
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
        // Normalizar dados das vendas
        const normalizedSales = data.map(sale => ({
          ...sale,
          id: sale.id || `temp-${Date.now()}-${Math.random()}`,
          data_venda: sale.data_venda || sale.data || new Date().toISOString(),
          valor_total: Number(sale.valor_total || sale.total || 0),
          produtos: Array.isArray(sale.produtos) ? sale.produtos : 
                   Array.isArray(sale.itens) ? sale.itens : [],
          tipo: sale.tipo || 'fisica'
        }));
        
        setSales(normalizedSales);
        console.log(`✅ [useSales] ${normalizedSales.length} vendas carregadas e normalizadas`);
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
      setError(null);
      const newSale = await salesAPI.create(saleData);
      
      // Normalizar nova venda
      const normalizedSale = {
        ...newSale,
        id: newSale.id || `temp-${Date.now()}-${Math.random()}`,
        data_venda: newSale.data_venda || newSale.data || new Date().toISOString(),
        valor_total: Number(newSale.valor_total || newSale.total || 0),
        produtos: Array.isArray(newSale.produtos) ? newSale.produtos : 
                 Array.isArray(newSale.itens) ? newSale.itens : [],
        tipo: newSale.tipo || 'fisica'
      };
      
      setSales(prev => [...prev, normalizedSale]);
      console.log('✅ [useSales] Venda criada com sucesso');
      return normalizedSale;
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
      setError(null);
      const updatedSale = await salesAPI.update(id, saleData);
      
      // Normalizar venda atualizada
      const normalizedSale = {
        ...updatedSale,
        id: updatedSale.id || id,
        data_venda: updatedSale.data_venda || updatedSale.data || new Date().toISOString(),
        valor_total: Number(updatedSale.valor_total || updatedSale.total || 0),
        produtos: Array.isArray(updatedSale.produtos) ? updatedSale.produtos : 
                 Array.isArray(updatedSale.itens) ? updatedSale.itens : [],
        tipo: updatedSale.tipo || 'fisica'
      };
      
      setSales(prev => prev.map(s => s.id === id ? normalizedSale : s));
      console.log('✅ [useSales] Venda atualizada com sucesso');
      return normalizedSale;
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
      setError(null);
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

  // SEMPRE retornar um objeto válido
  return {
    sales: Array.isArray(sales) ? sales : [],
    loading: Boolean(loading),
    error: error,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
  };
};
