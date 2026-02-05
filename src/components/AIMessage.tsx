import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ThoughtBlock } from './ThoughtBlock';
import type { Message, ThoughtComment } from '@/types/chat';

interface AIMessageProps {
  message: Message;
  comments?: ThoughtComment[];
  activeCommentId?: string | null;
  onAddComment?: (messageId: string, paragraphId: number, selectedText: string, comment: string) => void;
  onCommentClick?: (commentId: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({ 
  message,
  comments = [],
  activeCommentId,
  onAddComment,
  onCommentClick,
}) => {
  // 默认展开 CoT 内容
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const thinkingStartRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasThinking = message.reasoning_content && message.reasoning_content.length > 0;
  const isThinking = message.isStreaming && hasThinking && !message.content;

  // 思考计时器 - 当开始收到 reasoning_content 时启动
  useEffect(() => {
    // 开始思考时启动计时器
    if (hasThinking && !thinkingStartRef.current) {
      thinkingStartRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (thinkingStartRef.current) {
          setThinkingSeconds(Math.floor((Date.now() - thinkingStartRef.current) / 1000));
        }
      }, 1000);
    }

    // 思考结束时（开始输出 content）停止计时器
    if (message.content && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // 记录最终时间
      if (thinkingStartRef.current) {
        setThinkingSeconds(Math.floor((Date.now() - thinkingStartRef.current) / 1000));
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasThinking, message.content]);

  return (
    <div className="flex flex-col items-start gap-4 mb-6">
      {/* CoT 思考过程 */}
      {hasThinking && (
        <div className="w-full">
          {/* 思考标题栏 */}
          <button
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-3"
          >
            <Sparkles size={16} className="text-[#4D6BFE]" />
            <span className="text-sm font-medium">
              {isThinking ? '思考中' : '已思考'}（用时 {thinkingSeconds} 秒）
            </span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${isThinkingExpanded ? '' : '-rotate-90'}`}
            />
          </button>

          {/* 思考内容 - 分段交互式显示 */}
          {isThinkingExpanded && (
            <div className="pl-2 border-l-2 border-gray-200 mb-4">
              <ThoughtBlock 
                content={message.reasoning_content || ''} 
                messageId={message.id}
                isStreaming={isThinking}
                comments={comments}
                activeCommentId={activeCommentId}
                onAddComment={(paragraphId, selectedText, comment) => {
                  onAddComment?.(message.id, paragraphId, selectedText, comment);
                }}
                onCommentClick={onCommentClick}
              />
            </div>
          )}
        </div>
      )}

      {/* 正式回答 - 支持 Markdown 渲染 */}
      {message.content && (
        <div className="w-full prose prose-gray max-w-none">
          <ReactMarkdown
            components={{
              // 自定义标题样式
              h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 text-gray-900">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-2 text-gray-900">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2 text-gray-900">{children}</h3>,
              // 段落
              p: ({ children }) => <p className="text-base text-gray-900 leading-relaxed mb-3">{children}</p>,
              // 列表
              ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-base text-gray-900 leading-relaxed">{children}</li>,
              // 粗体
              strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
              // 斜体
              em: ({ children }) => <em className="italic">{children}</em>,
              // 代码块
              code: ({ className, children }) => {
                const isInline = !className;
                if (isInline) {
                  return <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800">{children}</code>;
                }
                return (
                  <code className="block bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                    {children}
                  </code>
                );
              },
              // 引用块
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 my-3 text-gray-600 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      )}

      {/* 仅有思考但还没有回答时的加载状态 */}
      {message.isStreaming && !message.content && !hasThinking && (
        <div className="flex items-center gap-2 text-gray-400">
          <Sparkles size={16} className="text-[#4D6BFE] animate-pulse" />
          <span className="text-sm">正在思考...</span>
        </div>
      )}
    </div>
  );
};

export default AIMessage;
