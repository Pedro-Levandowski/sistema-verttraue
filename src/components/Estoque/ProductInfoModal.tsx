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

  // Carregar estoque de afiliados quando o modal abrir
  useEffect(() => {
    const loadAffiliateStocks = async () => {
      if (!isOpen || !item || type !== 'produto') return;
      
      setLoading(true);
      try {
        const stocks = [];
        for (const affiliate of affiliates) {
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

    loadAffiliateStocks();
  }, [isOpen, item, affiliates, getAffiliateStock, type]);

  const handleManageStock = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowEstoqueModal(true);
  };

  const refreshStocks = () => {
    // Recarregar estoques após atualização
    const loadStocks = async () => {
      if (!item || type !== 'produto') return;
      
      try {
        const stocks = [];
        for (const affiliate of affiliates) {
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
      }
    };

    loadStocks();
  };

  if (!item) return null;

  const renderProductInfo = (product: Product) => (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Estoque Site</h3>
          <p className="text-lg font-bold text-blue-600">{product.estoque_site}</p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Estoque Físico</h3>
          <p className="text-lg font-bold text-green-600">{product.estoque_fisico}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Preço de Venda</h3>
          <p className="text-lg font-bold text-vertttraue-primary">
            R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Preço de Compra</h3>
          <p className="text-lg font-bold text-gray-700">
            R$ {product.preco_compra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-3 text-vertttraue-primary">Estoque com Afiliados</h3>
        
        {loading ? (
          <Alert>
            <AlertDescription>Carregando estoques dos afiliados...</AlertDescription>
          </Alert>
        ) : affiliateStocks.length > 0 ? (
          <div className="space-y-2">
            {affiliateStocks.map((stock) => (
              <div key={`${stock.afiliado_id}-${stock.produto_id}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{stock.afiliado_nome}</span>
                  <Badge variant="secondary" className="ml-2">
                    {stock.quantidade} unidades
                  </Badge>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleManageStock(affiliates.find(a => a.id === stock.afiliado_id)!)}
                  className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
                >
                  Gerenciar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>Nenhum afiliado possui este produto em estoque.</AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <h4 className="font-medium mb-2">Gerenciar Estoque por Afiliado:</h4>
          <div className="flex flex-wrap gap-2">
            {affiliates.filter(a => a.ativo).map(affiliate => (
              <Button
                key={affiliate.id}
                size="sm"
                variant="outline"
                onClick={() => handleManageStock(affiliate)}
                className="hover:bg-vertttraue-primary hover:text-white"
              >
                {affiliate.nome_completo}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderKitInfo = (kit: Kit) => (
    <>
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-gray-600">Preço do Kit</h3>
        <p className="text-lg font-bold text-vertttraue-primary">
          R$ {kit.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm text-gray-600">Produtos do Kit</h3>
        {kit.produtos && kit.produtos.length > 0 ? (
          <div className="space-y-2 mt-2">
            {kit.produtos.map((produto, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{produto.produto_nome || 'Produto não encontrado'}</span>
                <Badge variant="secondary">{produto.quantidade}x</Badge>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>Nenhum produto vinculado a este kit.</AlertDescription>
          </Alert>
        )}
      </div>

      <Alert>
        <AlertDescription>
          Kits não possuem estoque próprio. O estoque é controlado pelos produtos individuais.
        </AlertDescription>
      </Alert>
    </>
  );

  const renderConjuntoInfo = (conjunto: Conjunto) => (
    <>
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-gray-600">Preço do Conjunto</h3>
        <p className="text-lg font-bold text-vertttraue-primary">
          R$ {conjunto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm text-gray-600">Produtos do Conjunto</h3>
        {conjunto.produtos && conjunto.produtos.length > 0 ? (
          <div className="space-y-2 mt-2">
            {conjunto.produtos.map((produto, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{produto.produto_nome || 'Produto não encontrado'}</span>
                <Badge variant="secondary">{produto.quantidade}x</Badge>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>Nenhum produto vinculado a este conjunto.</AlertDescription>
          </Alert>
        )}
      </div>

      <Alert>
        <AlertDescription>
          Conjuntos não possuem estoque próprio. O estoque é controlado pelos produtos individuais.
        </AlertDescription>
      </Alert>
    </>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant={type === 'produto' ? 'default' : type === 'kit' ? 'secondary' : 'outline'}>
                {type.toUpperCase()}
              </Badge>
              {item.nome}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">ID</h3>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{item.id}</p>
            </div>

            {item.descricao && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Descrição</h3>
                <p className="text-sm text-gray-700">{item.descricao}</p>
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
