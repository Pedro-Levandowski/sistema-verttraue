
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, actions }) => {
  return (
    <header className="bg-vertttraue-primary text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-vertttraue-primary-light"
            >
              ← Voltar
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {actions}
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-vertttraue-primary"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
