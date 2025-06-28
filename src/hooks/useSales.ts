
import { useState, useEffect } from 'react';
import { Sale } from '../types';
import { salesAPI } from '../services/api';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getAll();
      setSales(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
      console.error('Erro ao buscar vendas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: any) => {
    try {
      const newSale = await salesAPI.create(saleData);
      setSales(prev => [...prev, newSale]);
      return newSale;
    } catch (err) {
      throw err;
    }
  };

  const updateSale = async (id: string, saleData: any) => {
    try {
      const updatedSale = await salesAPI.update(id, saleData);
      setSales(prev => prev.map(s => s.id === id ? updatedSale : s));
      return updatedSale;
    } catch (err) {
      throw err;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await salesAPI.delete(id);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (err) {
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
