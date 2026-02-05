import React from 'react';
import { Send, Key } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  onSettingsClick?: () => void;
  showSettings?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, 
  onSettingsClick,
  showSettings = true 
}) => {
  return (
    <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      {/* 左侧占位 */}
      <div className="w-10" />
      
      {/* 中间标题 */}
      <h1 className="text-base font-medium text-gray-900">{title}</h1>
      
      {/* 右侧按钮 */}
      <div className="flex items-center gap-2">
        {showSettings && (
          <button 
            onClick={onSettingsClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            title="设置 API Key"
          >
            <Key size={18} />
          </button>
        )}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
