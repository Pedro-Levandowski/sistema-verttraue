
import { useState, useEffect } from 'react';
import { Conjunto } from '../types';
import { conjuntosAPI } from '../services/api';

export const useConjuntos = () => {
  const [conjuntos, setConjuntos] = useState<Conjunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConjuntos = async () => {
    try {
      setLoading(true);
      const data = await conjuntosAPI.getAll();
      setConjuntos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conjuntos');
      console.error('Erro ao buscar conjuntos:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConjunto = async (conjuntoData: Omit<Conjunto, 'id'>) => {
    try {
      const newConjunto = await conjuntosAPI.create(conjuntoData);
      setConjuntos(prev => [...prev, newConjunto]);
      return newConjunto;
    } catch (err) {
      throw err;
    }
  };

  const updateConjunto = async (id: string, conjuntoData: Partial<Conjunto>) => {
    try {
      const updatedConjunto = await conjuntosAPI.update(id, conjuntoData);
      setConjuntos(prev => prev.map(c => c.id === id ? updatedConjunto : c));
      return updatedConjunto;
    } catch (err) {
      throw err;
    }
  };

  const deleteConjunto = async (id: string) => {
    try {
      await conjuntosAPI.delete(id);
      setConjuntos(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchConjuntos();
  }, []);

  return {
    conjuntos,
    loading,
    error,
    fetchConjuntos,
    createConjunto,
    updateConjunto,
    deleteConjunto,
  };
};
