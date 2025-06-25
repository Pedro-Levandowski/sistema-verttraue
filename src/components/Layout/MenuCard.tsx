
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MenuCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, icon: Icon, color, onClick }) => {
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-8 text-center">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-vertttraue-primary">{title}</h2>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
