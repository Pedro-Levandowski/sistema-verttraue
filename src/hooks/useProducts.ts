
import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productsAPI } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      console.log('🔄 Buscando produtos...');
      setLoading(true);
      setError(null);
      
      const data = await productsAPI.getAll();
      console.log(`✅ ${data.length} produtos carregados`);
      
      setProducts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar produtos';
      console.error('❌ Erro ao buscar produtos:', errorMessage);
      setError(errorMessage);
      setProducts([]); // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      console.log('➕ Criando produto:', productData.nome);
      const newProduct = await productsAPI.create(productData);
      setProducts(prev => [...prev, newProduct]);
      console.log('✅ Produto criado com sucesso');
      return newProduct;
    } catch (err) {
      console.error('❌ Erro ao criar produto:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      console.log('🔄 Atualizando produto:', id);
      const updatedProduct = await productsAPI.update(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      console.log('✅ Produto atualizado com sucesso');
      return updatedProduct;
    } catch (err) {
      console.error('❌ Erro ao atualizar produto:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('🗑️ Deletando produto:', id);
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      console.log('✅ Produto deletado com sucesso');
    } catch (err) {
      console.error('❌ Erro ao deletar produto:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
