import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ToggleButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  activeColor?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ 
  icon: Icon, 
  label, 
  isActive = false,
  onClick,
  activeColor = '#4D6BFE'
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-sm font-medium
        transition-all duration-200 ease-out
        border
        ${isActive 
          ? 'border-transparent' 
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        }
      `}
      style={isActive ? {
        backgroundColor: `${activeColor}15`,
        borderColor: `${activeColor}30`,
        color: activeColor
      } : undefined}
    >
      <Icon 
        size={14} 
        style={isActive ? { color: activeColor } : undefined}
        className={!isActive ? 'text-gray-500' : ''}
      />
      <span>{label}</span>
    </button>
  );
};

export default ToggleButton;
