
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Product, Kit, Conjunto, Affiliate } from '../../types';
import { useAffiliates } from '../../hooks/useAffiliates';
import { useEstoque } from '../../hooks/useEstoque';
import AfiliadoEstoqueModal from './AfiliadoEstoqueModal';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Product | Kit | Conjunto | null;
  type: 'produto' | 'kit' | 'conjunto';
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ isOpen, onClose, item, type }) => {
  const { affiliates } = useAffiliates();
  const { getAffiliateStock, updateAffiliateStock } = useEstoque();
  const [showEstoqueModal, setShowEstoqueModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [affiliateStocks, setAffiliateStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce para evitar muitas requisições
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Carregar estoque de afiliados quando o modal abrir (com debounce)
  useEffect(() => {
    if (!isOpen || !item || type !== 'produto') return;
    
    // Limpar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Definir novo timer
    const timer = setTimeout(() => {
      loadAffiliateStocks();
    }, 300); // 300ms de debounce

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, item, affiliates, type]);

  const loadAffiliateStocks = async () => {
    if (!item || type !== 'produto') return;
    
    setLoading(true);
    try {
      const stocks = [];
      
      // Limitar a 5 afiliados por vez para evitar muitas requisições
      const activeAffiliates = affiliates.filter(a => a.ativo).slice(0, 10);
      
      for (const affiliate of activeAffiliates) {
        try {
          const stock = await getAffiliateStock(affiliate.id);
          const itemStock = stock.find((s: any) => s.produto_id === item.id);
          if (itemStock) {
            stocks.push({
              ...itemStock,
              afiliado_nome: affiliate.nome_completo
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar estoque do afiliado ${affiliate.id}:`, error);
        }
      }
      setAffiliateStocks(stocks);
    } catch (error) {
      console.error('Erro ao carregar estoques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageStock = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowEstoqueModal(true);
  };

  const refreshStocks = () => {
    // Recarregar estoques após atualização (com debounce)
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      loadAffiliateStocks();
    }, 500);

    setDebounceTimer(timer);
  };

  if (!item) return null;

  const renderProductInfo = (product: Product) => (
    <>
      <div className="bg-gradient-to-r from-vertttraue-primary/10 to-vertttraue-secondary/10 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{product.estoque_site}</div>
            <div className="text-sm font-medium text-gray-600">Estoque Site</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{product.estoque_fisico}</div>
            <div className="text-sm font-medium text-gray-600">Estoque Físico</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm text-gray-600 mb-2">💰 Preço de Venda</h3>
          <p className="text-xl font-bold text-vertttraue-primary">
            R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm text-gray-600 mb-2">🛒 Preço de Compra</h3>
          <p className="text-xl font-bold text-gray-700">
            R$ {product.preco_compra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4 text-vertttraue-primary flex items-center gap-2">
          👥 Estoque com Afiliados
        </h3>
        
        {loading ? (
          <Alert>
            <AlertDescription>⏳ Carregando estoques dos afiliados...</AlertDescription>
          </Alert>
        ) : affiliateStocks.length > 0 ? (
          <div className="space-y-3">
            {affiliateStocks.map((stock) => (
              <div key={`${stock.afiliado_id}-${stock.produto_id}`} 
                   className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-vertttraue-primary rounded-full flex items-center justify-center text-white font-bold">
                    {stock.afiliado_nome.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{stock.afiliado_nome}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-vertttraue-primary/10 text-vertttraue-primary">
                        📦 {stock.quantidade} unidades
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleManageStock(affiliates.find(a => a.id === stock.afiliado_id)!)}
                  className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
                >
                  ⚙️ Gerenciar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>📋 Nenhum afiliado possui este produto em estoque.</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-3 text-gray-800">🎯 Gerenciar Estoque por Afiliado:</h4>
          <div className="flex flex-wrap gap-2">
            {affiliates.filter(a => a.ativo).slice(0, 8).map(affiliate => (
              <Button
                key={affiliate.id}
                size="sm"
                variant="outline"
                onClick={() => handleManageStock(affiliate)}
                className="hover:bg-vertttraue-primary hover:text-white transition-all"
              >
                {affiliate.nome_completo}
              </Button>
            ))}
          </div>
          {affiliates.filter(a => a.ativo).length > 8 && (
            <p className="text-sm text-gray-500 mt-2">
              E mais {affiliates.filter(a => a.ativo).length - 8} afiliados...
            </p>
          )}
        </div>
      </div>
    </>
  );

  const renderKitInfo = (kit: Kit) => (
    <>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-2">💰 Preço do Kit</h3>
        <p className="text-2xl font-bold text-vertttraue-primary">
          R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-3">📦 Produtos do Kit</h3>
        {kit.produtos && kit.produtos.length > 0 ? (
          <div className="space-y-2">
            {kit.produtos.map((produto, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                <span className="font-medium">{produto.produto_nome || 'Produto não encontrado'}</span>
                <Badge variant="secondary" className="bg-vertttraue-primary/10 text-vertttraue-primary">
                  {produto.quantidade}x
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>⚠️ Nenhum produto vinculado a este kit.</AlertDescription>
          </Alert>
        )}
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          ℹ️ Kits não possuem estoque próprio. O estoque é controlado pelos produtos individuais.
        </AlertDescription>
      </Alert>
    </>
  );

  const renderConjuntoInfo = (conjunto: Conjunto) => (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-2">💰 Preço do Conjunto</h3>
        <p className="text-2xl font-bold text-vertttraue-primary">
          R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-3">📦 Produtos do Conjunto</h3>
        {conjunto.produtos && conjunto.produtos.length > 0 ? (
          <div className="space-y-2">
            {conjunto.produtos.map((produto, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                <span className="font-medium">{produto.produto_nome || 'Produto não encontrado'}</span>
                <Badge variant="secondary" className="bg-vertttraue-primary/10 text-vertttraue-primary">
                  {produto.quantidade}x
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>⚠️ Nenhum produto vinculado a este conjunto.</AlertDescription>
          </Alert>
        )}
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          ℹ️ Conjuntos não possuem estoque próprio. O estoque é controlado pelos produtos individuais.
        </AlertDescription>
      </Alert>
    </>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Badge variant={type === 'produto' ? 'default' : type === 'kit' ? 'secondary' : 'outline'}
                     className="text-xs">
                {type.toUpperCase()}
              </Badge>
              <span className="text-xl">{item.nome}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-600 mb-1">🔢 ID</h3>
              <p className="font-mono text-sm bg-white p-2 rounded border">{item.id}</p>
            </div>

            {item.descricao && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">📝 Descrição</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{item.descricao}</p>
              </div>
            )}

            {type === 'produto' && renderProductInfo(item as Product)}
            {type === 'kit' && renderKitInfo(item as Kit)}
            {type === 'conjunto' && renderConjuntoInfo(item as Conjunto)}
          </div>
        </DialogContent>
      </Dialog>

      {selectedAffiliate && (
        <AfiliadoEstoqueModal
          isOpen={showEstoqueModal}
          onClose={() => {
            setShowEstoqueModal(false);
            setSelectedAffiliate(null);
          }}
          onUpdateStock={async (affiliateId: string, quantity: number) => {
            try {
              await updateAffiliateStock({
                produto_id: (item as Product).id,
                afiliado_id: affiliateId,
                quantidade: quantity
              });
              refreshStocks();
            } catch (error) {
              console.error('Erro ao atualizar estoque:', error);
            }
          }}
          product={type === 'produto' ? (item as Product) : null}
          affiliates={affiliates}
        />
      )}
    </>
  );
};

export default ProductInfoModal;
