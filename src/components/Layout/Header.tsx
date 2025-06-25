
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack: () => void;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, actions }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="hover:bg-vertttraue-primary hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-vertttraue-primary">{title}</h1>
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
};

export default Header;
