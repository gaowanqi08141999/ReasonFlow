import React from 'react';
import logoImage from '@/assets/deepseeklogo.png';

interface DeepSeekLogoProps {
  size?: number;
  className?: string;
}

export const DeepSeekLogo: React.FC<DeepSeekLogoProps> = ({ 
  size = 32, 
  className = '' 
}) => {
  return (
    <img
      src={logoImage}
      alt="DeepSeek"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default DeepSeekLogo;
