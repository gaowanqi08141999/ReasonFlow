import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Paperclip, ArrowUp, Square } from 'lucide-react';
import { ToggleButton } from './ToggleButton';

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [isDeepThinkActive, setIsDeepThinkActive] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSend?.(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="w-full max-w-3xl"
    >
      <div
        className={`
          relative bg-white rounded-2xl border
          transition-all duration-200 ease-out
          shadow-[0_2px_12px_rgba(0,0,0,0.08)]
          ${isFocused 
            ? 'border-[#4D6BFE] shadow-[0_0_0_2px_rgba(77,107,254,0.15)]' 
            : 'border-gray-200'
          }
        `}
      >
        {/* 输入框 */}
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="给 DeepSeek 发送消息"
          className="
            w-full min-h-[56px] max-h-[200px] px-4 pt-4 pb-14
            bg-transparent border-none outline-none resize-none
            text-gray-800 placeholder-gray-400
            text-base leading-relaxed
          "
          rows={1}
        />

        {/* 底部工具栏 */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {/* 左侧标签按钮 */}
          <div className="flex items-center gap-2">
            <ToggleButton
              icon={Sparkles}
              label="深度思考"
              isActive={isDeepThinkActive}
              onClick={() => setIsDeepThinkActive(!isDeepThinkActive)}
              activeColor="#4D6BFE"
            />
            <ToggleButton
              icon={Globe}
              label="联网搜索"
              isActive={isSearchActive}
              onClick={() => setIsSearchActive(!isSearchActive)}
              activeColor="#4D6BFE"
            />
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 附件按钮 */}
            <button
              className="
                p-2 rounded-lg text-gray-400
                transition-all duration-200 ease-out
                hover:bg-gray-100 hover:text-gray-600
              "
              title="添加附件"
            >
              <Paperclip size={20} />
            </button>

            {/* 发送按钮 */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || disabled}
              className={`
                p-2.5 rounded-full
                transition-all duration-200 ease-out
                ${inputValue.trim() && !disabled
                  ? 'bg-[#4D6BFE] text-white shadow-[0_2px_8px_rgba(77,107,254,0.4)] hover:bg-[#3D5BEE] hover:scale-105'
                  : 'bg-[#4D6BFE]/60 text-white cursor-not-allowed'
                }
              `}
              title={disabled ? '正在回复中...' : '发送消息'}
            >
              {disabled ? <Square size={18} strokeWidth={2.5} /> : <ArrowUp size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInput;
