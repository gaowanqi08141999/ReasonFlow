import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ThoughtComment } from '@/types/chat';

interface CommentTagProps {
  comment: ThoughtComment;
  index: number;
  onClick: () => void;
}

export const CommentTag: React.FC<CommentTagProps> = ({ comment, index, onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-[#4D6BFE]/10 border border-[#4D6BFE]/30
        text-[#4D6BFE] text-sm font-medium
        hover:bg-[#4D6BFE]/20 hover:border-[#4D6BFE]/50
        transition-all duration-200 cursor-pointer"
    >
      <MessageSquare size={14} />
      <span>对第 {comment.paragraphId + 1} 步的建议</span>
    </motion.button>
  );
};

export default CommentTag;
