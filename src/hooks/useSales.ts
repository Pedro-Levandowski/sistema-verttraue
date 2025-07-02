
import { useState, useEffect } from 'react';
import { Sale } from '../types';
import { salesAPI } from '../services/api';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      console.log('🔄 Buscando vendas...');
      setLoading(true);
      setError(null);
      
      const data = await salesAPI.getAll();
      console.log(`✅ ${data.length} vendas carregadas`);
      
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar vendas';
      console.error('❌ Erro ao buscar vendas:', errorMessage);
      setError(errorMessage);
      setSales([]); // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: any) => {
    try {
      console.log('➕ Criando venda:', saleData);
      const newSale = await salesAPI.create(saleData);
      setSales(prev => [...prev, newSale]);
      console.log('✅ Venda criada com sucesso');
      return newSale;
    } catch (err) {
      console.error('❌ Erro ao criar venda:', err);
      throw err;
    }
  };

  const updateSale = async (id: string, saleData: any) => {
    try {
      console.log('🔄 Atualizando venda:', id);
      const updatedSale = await salesAPI.update(id, saleData);
      setSales(prev => prev.map(s => s.id === id ? updatedSale : s));
      console.log('✅ Venda atualizada com sucesso');
      return updatedSale;
    } catch (err) {
      console.error('❌ Erro ao atualizar venda:', err);
      throw err;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      console.log('🗑️ Deletando venda:', id);
      await salesAPI.delete(id);
      setSales(prev => prev.filter(s => s.id !== id));
      console.log('✅ Venda deletada com sucesso');
    } catch (err) {
      console.error('❌ Erro ao deletar venda:', err);
      throw err;
    }
  };

  useEffect(() => {
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
