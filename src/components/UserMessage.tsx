import React from 'react';
import { Copy, Pencil } from 'lucide-react';
import type { Message } from '@/types/chat';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className="flex flex-col items-end gap-2 mb-6">
      {/* 消息气泡 */}
      <div className="max-w-[70%] bg-[#4D6BFE] text-white px-4 py-3 rounded-2xl rounded-tr-md">
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex items-center gap-2 text-gray-400">
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          title="复制"
        >
          <Copy size={16} />
        </button>
        <button 
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          title="编辑"
        >
          <Pencil size={16} />
        </button>
      </div>
    </div>
  );
};

export default UserMessage;
