import React, { useState } from 'react';
import { X, Key } from 'lucide-react';
import { setApiKey, getApiKey } from '@/services/deepseek';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState(getApiKey() || '');

  if (!isOpen) return null;

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={20} className="text-[#4D6BFE]" />
            <h2 className="text-lg font-semibold text-gray-900">设置 API Key</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 说明 */}
        <p className="text-sm text-gray-500 mb-4">
          请输入你的 DeepSeek API Key 以启用对话功能。
          你可以在 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-[#4D6BFE] hover:underline">DeepSeek 平台</a> 获取 API Key。
        </p>

        {/* 输入框 */}
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
            focus:outline-none focus:border-[#4D6BFE] focus:ring-2 focus:ring-[#4D6BFE]/10
            transition-all"
        />

        {/* 按钮 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 px-4 py-2.5 bg-[#4D6BFE] rounded-xl text-sm font-medium
              text-white hover:bg-[#3D5BEE] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
