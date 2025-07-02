
import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productsAPI } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    console.log('🔄 [useProducts] Iniciando busca de produtos...');
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useProducts] Fazendo chamada para API...');
      const data = await productsAPI.getAll();
      console.log('✅ [useProducts] Dados recebidos:', data);
      
      if (Array.isArray(data)) {
        setProducts(data);
        console.log(`✅ [useProducts] ${data.length} produtos carregados com sucesso`);
      } else {
        console.warn('⚠️ [useProducts] Dados não são um array, usando array vazio');
        setProducts([]);
      }
    } catch (err) {
      console.error('❌ [useProducts] Erro capturado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar produtos';
      console.error('❌ [useProducts] Mensagem de erro:', errorMessage);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
      console.log('🏁 [useProducts] Busca finalizada');
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    console.log('➕ [useProducts] Criando produto:', productData.nome);
    try {
      const newProduct = await productsAPI.create(productData);
      setProducts(prev => [...prev, newProduct]);
      console.log('✅ [useProducts] Produto criado com sucesso');
      return newProduct;
    } catch (err) {
      console.error('❌ [useProducts] Erro ao criar produto:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    console.log('🔄 [useProducts] Atualizando produto:', id);
    try {
      const updatedProduct = await productsAPI.update(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      console.log('✅ [useProducts] Produto atualizado com sucesso');
      return updatedProduct;
    } catch (err) {
      console.error('❌ [useProducts] Erro ao atualizar produto:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    console.log('🗑️ [useProducts] Deletando produto:', id);
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      console.log('✅ [useProducts] Produto deletado com sucesso');
    } catch (err) {
      console.error('❌ [useProducts] Erro ao deletar produto:', err);
      throw err;
    }
  };

  useEffect(() => {
    console.log('🚀 [useProducts] Inicializando hook...');
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
