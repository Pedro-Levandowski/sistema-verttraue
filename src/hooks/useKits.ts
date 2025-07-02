
import { useState, useEffect } from 'react';
import { Kit } from '../types';
import { kitsAPI } from '../services/api';

export const useKits = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKits = async () => {
    try {
      setLoading(true);
      const data = await kitsAPI.getAll();
      setKits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar kits');
      console.error('Erro ao buscar kits:', err);
    } finally {
      setLoading(false);
    }
  };

  const createKit = async (kitData: Omit<Kit, 'id'>) => {
    try {
      const newKit = await kitsAPI.create(kitData);
      setKits(prev => [...prev, newKit]);
      return newKit;
    } catch (err) {
      throw err;
    }
  };

  const updateKit = async (id: string, kitData: Partial<Kit>) => {
    try {
      const updatedKit = await kitsAPI.update(id, kitData);
      setKits(prev => prev.map(k => k.id === id ? updatedKit : k));
      return updatedKit;
    } catch (err) {
      throw err;
    }
  };

  const deleteKit = async (id: string) => {
    try {
      await kitsAPI.delete(id);
      setKits(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchKits();
  }, []);

  return {
    kits,
    loading,
    error,
    fetchKits,
    createKit,
    updateKit,
    deleteKit,
  };
};
