
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductActionsProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({ 
  product, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const handleView = () => {
    console.log('👁️ [ProductActions] Visualizando produto:', product.id);
    try {
      onView(product);
    } catch (error) {
      console.error('❌ [ProductActions] Erro ao visualizar:', error);
    }
  };

  const handleEdit = () => {
    console.log('✏️ [ProductActions] Editando produto:', product.id);
    try {
      onEdit(product);
    } catch (error) {
      console.error('❌ [ProductActions] Erro ao editar:', error);
    }
  };

  const handleDelete = () => {
    console.log('🗑️ [ProductActions] Solicitando exclusão:', product.id);
    try {
      onDelete(product);
    } catch (error) {
      console.error('❌ [ProductActions] Erro ao deletar:', error);
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={handleView}
        className="hover:bg-blue-50 hover:border-blue-300 text-xs"
        title="Ver detalhes"
      >
        <Eye className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleEdit}
        className="hover:bg-blue-600 hover:text-white text-xs"
        title="Editar produto"
      >
        <Edit className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDelete}
        className="hover:bg-red-500 hover:text-white text-xs"
        title="Excluir produto"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default ProductActions;
