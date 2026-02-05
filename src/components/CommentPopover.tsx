import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
  existingComment?: string;
  isViewMode?: boolean;
  onSubmit: (comment: string) => void;
  onClose: () => void;
}

export const CommentPopover: React.FC<CommentPopoverProps> = ({
  isOpen,
  position,
  selectedText,
  existingComment,
  isViewMode = false,
  onSubmit,
  onClose,
}) => {
  const [comment, setComment] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 重置输入框
  useEffect(() => {
    if (!isOpen) {
      setComment('');
    }
  }, [isOpen]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current && !isViewMode) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isViewMode]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-50 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] 
            overflow-hidden min-w-[260px] max-w-[340px] border border-gray-100"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, calc(-100% - 8px))',
          }}
        >
          {/* 选中的文本预览 */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 truncate">
              "{selectedText.slice(0, 40)}{selectedText.length > 40 ? '...' : ''}"
            </p>
          </div>

          {isViewMode && existingComment ? (
            /* 查看模式 */
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {existingComment}
              </p>
            </div>
          ) : (
            /* 编辑模式 */
            <div className="p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入评论..."
                  className="flex-1 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-lg
                    border border-gray-200 focus:border-[#4D6BFE] focus:outline-none
                    focus:ring-2 focus:ring-[#4D6BFE]/10
                    placeholder-gray-400 transition-all"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim()}
                  className={`p-2 rounded-lg transition-all duration-200
                    ${comment.trim()
                      ? 'bg-[#4D6BFE] text-white hover:bg-[#3D5BEE] shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-md text-gray-400 
              hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentPopover;
