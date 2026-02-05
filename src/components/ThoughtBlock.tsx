import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CommentPopover } from './CommentPopover';
import type { ThoughtComment } from '@/types/chat';

interface ThoughtBlockProps {
  content: string;
  messageId: string;
  isStreaming?: boolean;
  comments?: ThoughtComment[];
  activeCommentId?: string | null;
  onAddComment?: (paragraphId: number, selectedText: string, comment: string) => void;
  onCommentClick?: (commentId: string) => void;
}

interface ThoughtParagraph {
  id: number;
  text: string;
}

interface PopoverState {
  isOpen: boolean;
  mode: 'edit' | 'view';
  paragraphId: number;
  text: string;
  position: { x: number; y: number };
  commentId?: string;  // 查看模式时的评论 ID
}

export const ThoughtBlock: React.FC<ThoughtBlockProps> = ({ 
  content, 
  messageId,
  isStreaming,
  comments = [],
  activeCommentId,
  onAddComment,
  onCommentClick,
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 将内容按段落分割
  const paragraphs: ThoughtParagraph[] = useMemo(() => {
    if (!content) return [];
    const lines = content.split(/\n+/).filter(line => line.trim());
    return lines.map((text, index) => ({
      id: index,
      text: text.trim(),
    }));
  }, [content]);

  // 获取段落的评论
  const getCommentsForParagraph = (paragraphId: number) => {
    return comments.filter(c => c.paragraphId === paragraphId);
  };

  // 外部触发的回溯 - 当 activeCommentId 变化时滚动到对应位置
  useEffect(() => {
    if (activeCommentId) {
      const element = document.getElementById(`comment-underline-${activeCommentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 显示查看弹窗
        const comment = comments.find(c => c.id === activeCommentId);
        if (comment) {
          const rect = element.getBoundingClientRect();
          setPopover({
            isOpen: true,
            mode: 'view',
            paragraphId: comment.paragraphId,
            text: comment.selectedText,
            position: {
              x: rect.left + rect.width / 2,
              y: rect.top,
            },
            commentId: comment.id,
          });
        }
      }
    }
  }, [activeCommentId, comments]);

  // 处理右键菜单 - 新建评论
  const handleContextMenu = useCallback((e: React.MouseEvent, paragraphId: number) => {
    const selectedText = window.getSelection()?.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      e.preventDefault();
      
      // 获取选区位置
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setPopover({
          isOpen: true,
          mode: 'edit',  // 新建评论模式
          paragraphId,
          text: selectedText,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top,
          },
        });
      }
    }
  }, []);

  // 提交评论
  const handleSubmitComment = useCallback((comment: string) => {
    if (popover && popover.mode === 'edit' && onAddComment) {
      onAddComment(popover.paragraphId, popover.text, comment);
      setPopover(null);
      // 清除选区
      window.getSelection()?.removeAllRanges();
    }
  }, [popover, onAddComment]);

  // 关闭弹窗
  const handleClosePopover = useCallback(() => {
    setPopover(null);
    onCommentClick?.('');  // 清除激活状态
  }, [onCommentClick]);

  // 点击已有评论的划线 - 查看模式
  const handleUnderlineClick = useCallback((comment: ThoughtComment, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopover({
      isOpen: true,
      mode: 'view',  // 查看评论模式
      paragraphId: comment.paragraphId,
      text: comment.selectedText,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
      commentId: comment.id,
    });
    onCommentClick?.(comment.id);
  }, [onCommentClick]);

  // 渲染带有划线的文本
  const renderTextWithUnderlines = (paragraphId: number, text: string) => {
    const paragraphComments = getCommentsForParagraph(paragraphId);
    
    if (paragraphComments.length === 0) {
      return <span>{text}</span>;
    }

    // 简单实现：如果有评论，查找并高亮
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    paragraphComments.forEach((comment, idx) => {
      const startIndex = text.indexOf(comment.selectedText, lastIndex);
      if (startIndex !== -1) {
        // 添加前面的普通文本
        if (startIndex > lastIndex) {
          elements.push(
            <span key={`text-${idx}-before`}>
              {text.slice(lastIndex, startIndex)}
            </span>
          );
        }
        
        // 添加带划线的文本
        const isActive = activeCommentId === comment.id;
        elements.push(
          <span
            key={`underline-${comment.id}`}
            id={`comment-underline-${comment.id}`}
            onClick={(e) => handleUnderlineClick(comment, e)}
            className={`
              relative cursor-pointer transition-colors duration-200
              ${isActive ? 'bg-[#4D6BFE]/20' : 'hover:bg-[#4D6BFE]/10'}
            `}
          >
            {comment.selectedText}
            {/* 划线 */}
            <span 
              className="absolute bottom-0 left-0 h-[2px] bg-[#4D6BFE] rounded-full"
              style={{
                animation: 'underlineExpand 0.4s ease-out forwards',
                width: '100%',
              }}
            />
          </span>
        );
        
        lastIndex = startIndex + comment.selectedText.length;
      }
    });

    // 添加剩余文本
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.slice(lastIndex)}</span>
      );
    }

    return <>{elements}</>;
  };

  // 获取当前查看的评论内容
  const viewingComment = popover?.mode === 'view' && popover.commentId
    ? comments.find(c => c.id === popover.commentId)
    : null;

  return (
    <div ref={containerRef} className="space-y-1 relative">
      {/* 划线动画样式 */}
      <style>{`
        @keyframes underlineExpand {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }
      `}</style>

      {paragraphs.map((paragraph) => (
        <div
          key={paragraph.id}
          id={`paragraph-${messageId}-${paragraph.id}`}
          onMouseEnter={() => setHoveredId(paragraph.id)}
          onMouseLeave={() => setHoveredId(null)}
          onContextMenu={(e) => handleContextMenu(e, paragraph.id)}
          className={`
            px-3 py-2 rounded-lg
            transition-all duration-200 ease-out
            cursor-text select-text
            ${hoveredId === paragraph.id
              ? 'bg-[#4D6BFE]/8 shadow-[0_2px_8px_rgba(77,107,254,0.15)]'
              : 'bg-transparent'
            }
          `}
          style={{
            borderRadius: hoveredId === paragraph.id ? '8px' : '4px',
          }}
        >
          <p className="text-sm text-gray-500 leading-relaxed">
            {renderTextWithUnderlines(paragraph.id, paragraph.text)}
          </p>
        </div>
      ))}
      
      {/* 流式加载动画 */}
      {isStreaming && (
        <div className="flex items-center gap-1 px-3 py-2">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
      )}

      {/* 评论弹窗 */}
      {popover && (
        <CommentPopover
          isOpen={popover.isOpen}
          position={popover.position}
          selectedText={popover.text}
          existingComment={viewingComment?.comment}
          isViewMode={popover.mode === 'view'}
          onSubmit={handleSubmitComment}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
};

export default ThoughtBlock;
