
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Edit, Save, Cancel } from 'lucide-react';
import { Product, Affiliate } from '../../types';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  affiliates: Affiliate[];
  onUpdateProduct?: (product: Product) => void;
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  product,
  affiliates,
  onUpdateProduct
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);

  if (!product) return null;

  const handleEdit = () => {
    setEditedProduct({ ...product });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedProduct && onUpdateProduct) {
      const updatedProduct = {
        ...editedProduct,
        fotos: [...(editedProduct.fotos || []), ...newPhotos]
      };
      onUpdateProduct(updatedProduct);
      setNewPhotos([]);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProduct(null);
    setNewPhotos([]);
    setIsEditing(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setNewPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number, isNew: boolean = false) => {
    if (isNew) {
      setNewPhotos(prev => prev.filter((_, i) => i !== index));
    } else if (editedProduct) {
      setEditedProduct({
        ...editedProduct,
        fotos: editedProduct.fotos?.filter((_, i) => i !== index) || []
      });
    }
  };

  const getAffiliateInfo = (afiliadoId: string) => {
    return affiliates.find(a => a.id === afiliadoId);
  };

  const currentProduct = isEditing ? editedProduct : product;
  if (!currentProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold text-vertttraue-primary">
            {isEditing ? 'Editar Produto' : 'Informações do Produto'}
          </DialogTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <Cancel className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-vertttraue-primary">Dados Básicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="id">ID do Produto</Label>
                    <Input
                      id="id"
                      value={currentProduct.id}
                      disabled
                      className="font-mono bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={currentProduct.fornecedor.nome}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nome">Nome do Produto</Label>
                  {isEditing ? (
                    <Input
                      id="nome"
                      value={currentProduct.nome}
                      onChange={(e) => setEditedProduct({
                        ...currentProduct,
                        nome: e.target.value
                      })}
                    />
                  ) : (
                    <Input value={currentProduct.nome} disabled className="bg-gray-50" />
                  )}
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  {isEditing ? (
                    <Textarea
                      id="descricao"
                      value={currentProduct.descricao}
                      onChange={(e) => setEditedProduct({
                        ...currentProduct,
                        descricao: e.target.value
                      })}
                      rows={3}
                    />
                  ) : (
                    <Textarea value={currentProduct.descricao} disabled className="bg-gray-50" rows={3} />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preco">Preço de Venda</Label>
                    {isEditing ? (
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={currentProduct.preco}
                        onChange={(e) => setEditedProduct({
                          ...currentProduct,
                          preco: parseFloat(e.target.value) || 0
                        })}
                      />
                    ) : (
                      <Input 
                        value={`R$ ${currentProduct.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        disabled 
                        className="bg-gray-50" 
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="preco_compra">Preço de Compra</Label>
                    {isEditing ? (
                      <Input
                        id="preco_compra"
                        type="number"
                        step="0.01"
                        value={currentProduct.preco_compra}
                        onChange={(e) => setEditedProduct({
                          ...currentProduct,
                          preco_compra: parseFloat(e.target.value) || 0
                        })}
                      />
                    ) : (
                      <Input 
                        value={`R$ ${currentProduct.preco_compra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        disabled 
                        className="bg-gray-50" 
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-vertttraue-primary">Controle de Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentProduct.estoque_fisico + currentProduct.estoque_site}
                    </div>
                    <div className="text-sm text-gray-600">Estoque Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={currentProduct.estoque_fisico}
                          onChange={(e) => setEditedProduct({
                            ...currentProduct,
                            estoque_fisico: parseInt(e.target.value) || 0
                          })}
                          className="text-center border-0 bg-transparent text-2xl font-bold"
                        />
                      ) : (
                        currentProduct.estoque_fisico
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Estoque Físico</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={currentProduct.estoque_site}
                          onChange={(e) => setEditedProduct({
                            ...currentProduct,
                            estoque_site: parseInt(e.target.value) || 0
                          })}
                          className="text-center border-0 bg-transparent text-2xl font-bold"
                        />
                      ) : (
                        currentProduct.estoque_site
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Estoque Site</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-vertttraue-primary">Fotos do Produto</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="mb-4">
                    <Label htmlFor="photo-upload">Adicionar Novas Fotos</Label>
                    <div className="mt-2">
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Fotos
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Fotos existentes */}
                  {currentProduct.fotos?.map((foto, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={foto} 
                        alt={`Foto ${index + 1}`} 
                        className="w-full h-32 object-cover rounded border hover:shadow-lg transition-shadow"
                      />
                      {isEditing && (
                        <Button
                          onClick={() => removePhoto(index, false)}
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Novas fotos */}
                  {newPhotos.map((foto, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img 
                        src={foto} 
                        alt={`Nova foto ${index + 1}`} 
                        className="w-full h-32 object-cover rounded border border-blue-300 hover:shadow-lg transition-shadow"
                      />
                      <Badge className="absolute top-1 left-1 bg-blue-500">Nova</Badge>
                      <Button
                        onClick={() => removePhoto(index, true)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  {(!currentProduct.fotos || currentProduct.fotos.length === 0) && newPhotos.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Nenhuma foto adicionada ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-vertttraue-primary">Estoque com Afiliados</CardTitle>
              </CardHeader>
              <CardContent>
                {currentProduct.afiliado_estoque && currentProduct.afiliado_estoque.length > 0 ? (
                  <div className="space-y-3">
                    {currentProduct.afiliado_estoque.map((ae, index) => {
                      const affiliate = getAffiliateInfo(ae.afiliado_id);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">
                              {affiliate ? affiliate.nome_completo : `Afiliado ${ae.afiliado_id}`}
                            </div>
                            {affiliate && (
                              <div className="text-sm text-gray-600">
                                {affiliate.email} • Tel: {affiliate.telefone}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className="bg-vertttraue-primary">
                              {ae.quantidade} unidades
                            </Badge>
                            {affiliate && (
                              <div className="text-xs text-gray-500 mt-1">
                                Comissão: {affiliate.comissao}%
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum estoque com afiliados
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInfoModal;
