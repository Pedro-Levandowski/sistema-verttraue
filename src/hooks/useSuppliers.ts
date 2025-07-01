
import { useState, useEffect } from 'react';
import { Supplier, Product } from '../types';
import { suppliersAPI, productsAPI } from '../services/api';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersAPI.getAll();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fornecedores');
      console.error('Erro ao buscar fornecedores:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      const newSupplier = await suppliersAPI.create(supplierData);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      throw err;
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      const updatedSupplier = await suppliersAPI.update(id, supplierData);
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      return updatedSupplier;
    } catch (err) {
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await suppliersAPI.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const fetchSupplierProducts = async (supplierId: string): Promise<Product[]> => {
    try {
      const products = await productsAPI.getAll();
      return products.filter(p => p.fornecedor?.id === supplierId);
    } catch (err) {
      console.error('Erro ao buscar produtos do fornecedor:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSupplierProducts,
  };
};
