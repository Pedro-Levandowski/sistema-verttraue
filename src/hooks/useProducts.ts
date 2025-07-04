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
        // Normalizar dados dos produtos com mais robustez
        const normalizedProducts = data.map(product => {
          // Garantir que todos os campos obrigatórios existam
          const normalizedProduct: Product = {
            id: product.id || `temp-${Date.now()}-${Math.random()}`,
            nome: product.nome || 'Produto sem nome',
            descricao: product.descricao || '',
            estoque_fisico: Number(product.estoque_fisico) || 0,
            estoque_site: Number(product.estoque_site) || 0,
            preco: Number(product.preco) || 0,
            preco_compra: Number(product.preco_compra) || 0,
            fornecedor: product.fornecedor || null,
            afiliado_estoque: Array.isArray(product.afiliado_estoque) ? product.afiliado_estoque : [],
            fotos: Array.isArray(product.fotos) ? product.fotos : []
          };
          
          console.log('🔧 [useProducts] Produto normalizado:', normalizedProduct);
          return normalizedProduct;
        });
        
        setProducts(normalizedProducts);
        console.log(`✅ [useProducts] ${normalizedProducts.length} produtos carregados e normalizados`);
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

  const createProduct = async (productData: Omit<Product, 'fornecedor' | 'afiliado_estoque' | 'fotos'> & { fornecedor_id?: string }) => {
    console.log('➕ [useProducts] Criando produto:', productData);
    try {
      setLoading(true);
      setError(null);
      
      // USAR O ID FORNECIDO PELO USUÁRIO - NÃO GERAR AUTOMATICAMENTE
      const backendData = {
        id: productData.id, // Usar o ID exato fornecido pelo usuário
        nome: productData.nome,
        descricao: productData.descricao || '',
        estoque_fisico: Number(productData.estoque_fisico) || 0,
        estoque_site: Number(productData.estoque_site) || 0,
        preco: Number(productData.preco) || 0,
        preco_compra: Number(productData.preco_compra) || 0,
        fornecedor_id: productData.fornecedor_id || null
      };
      
      console.log('📤 [useProducts] Enviando para backend:', backendData);
      const newProduct = await productsAPI.create(backendData);
      
      // Normalizar produto retornado
      const normalizedProduct: Product = {
        id: newProduct.id,
        nome: newProduct.nome || 'Produto sem nome',
        descricao: newProduct.descricao || '',
        estoque_fisico: Number(newProduct.estoque_fisico) || 0,
        estoque_site: Number(newProduct.estoque_site) || 0,
        preco: Number(newProduct.preco) || 0,
        preco_compra: Number(newProduct.preco_compra) || 0,
        fornecedor: newProduct.fornecedor || null,
        afiliado_estoque: [],
        fotos: []
      };
      
      setProducts(prev => [...prev, normalizedProduct]);
      console.log('✅ [useProducts] Produto criado com sucesso');
      return normalizedProduct;
    } catch (err) {
      console.error('❌ [useProducts] Erro ao criar produto:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar produto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product> & { fornecedor_id?: string }) => {
    console.log('🔄 [useProducts] Atualizando produto:', id, productData);
    try {
      setLoading(true);
      setError(null);
      
      // Preparar dados para envio ao backend
      const backendData = {
        nome: productData.nome,
        descricao: productData.descricao,
        estoque_fisico: productData.estoque_fisico,
        estoque_site: productData.estoque_site,
        preco: productData.preco,
        preco_compra: productData.preco_compra,
        fornecedor_id: productData.fornecedor_id || null
      };
      
      console.log('📤 [useProducts] Enviando atualização para backend:', backendData);
      const updatedProduct = await productsAPI.update(id, backendData);
      
      // Normalizar produto atualizado
      const normalizedProduct: Product = {
        id: updatedProduct.id || id,
        nome: updatedProduct.nome || 'Produto sem nome',
        descricao: updatedProduct.descricao || '',
        estoque_fisico: Number(updatedProduct.estoque_fisico) || 0,
        estoque_site: Number(updatedProduct.estoque_site) || 0,
        preco: Number(updatedProduct.preco) || 0,
        preco_compra: Number(updatedProduct.preco_compra) || 0,
        fornecedor: updatedProduct.fornecedor || null,
        afiliado_estoque: Array.isArray(updatedProduct.afiliado_estoque) ? updatedProduct.afiliado_estoque : [],
        fotos: Array.isArray(updatedProduct.fotos) ? updatedProduct.fotos : []
      };
      
      setProducts(prev => prev.map(p => p.id === id ? normalizedProduct : p));
      console.log('✅ [useProducts] Produto atualizado com sucesso');
      return normalizedProduct;
    } catch (err) {
      console.error('❌ [useProducts] Erro ao atualizar produto:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    console.log('🗑️ [useProducts] Deletando produto:', id);
    try {
      setLoading(true);
      setError(null);
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      console.log('✅ [useProducts] Produto deletado com sucesso');
    } catch (err) {
      console.error('❌ [useProducts] Erro ao deletar produto:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar produto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 [useProducts] Inicializando hook...');
    fetchProducts();
  }, []);

  // SEMPRE retornar um objeto válido - NUNCA undefined
  return {
    products: Array.isArray(products) ? products : [],
    loading: Boolean(loading),
    error: error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
