import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ChatHistoryItemProps {
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({ 
  title, 
  isActive = false,
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        text-left text-sm
        transition-all duration-150 ease-out
        group relative
        ${isActive 
          ? 'bg-[#4D6BFE]/10 text-[#4D6BFE]' 
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <span className="truncate flex-1">{title}</span>
      {(isHovered || isActive) && (
        <span 
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200 text-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: 显示更多选项菜单
          }}
        >
          <MoreHorizontal size={14} />
        </span>
      )}
    </button>
  );
};

export default ChatHistoryItem;
