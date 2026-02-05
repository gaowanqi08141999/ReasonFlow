import { useState, useRef, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatHeader } from './components/ChatHeader';
import { DeepSeekLogo } from './components/DeepSeekLogo';
import { UserMessage } from './components/UserMessage';
import { AIMessage } from './components/AIMessage';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CommentTag } from './components/CommentTag';
import { streamChat, hasApiKey, isUsingEnvApiKey } from './services/deepseek';
import type { Message, Conversation, ThoughtComment } from './types/chat';

const App: FC = () => {
  // 对话状态
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(hasApiKey());
  
  // 评论状态
  const [comments, setComments] = useState<ThoughtComment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  
  // 智能滚动：跟踪用户是否在底部附近
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 获取当前对话
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // 检查是否在底部附近（100px 阈值）
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    setShouldAutoScroll(checkIfNearBottom());
  }, [checkIfNearBottom]);

  // 滚动到底部（仅当 shouldAutoScroll 为 true 时）
  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouldAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 发送新消息时强制滚动到底部
  const forceScrollToBottom = useCallback(() => {
    setShouldAutoScroll(true);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  // 创建新对话
  const createNewConversation = (): string => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  };

  // 更新对话中的消息
  const updateMessage = (conversationId: string, messageId: string, updates: Partial<Message>) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv;
      return {
        ...conv,
        updatedAt: new Date(),
        messages: conv.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      };
    }));
  };

  // 添加消息到对话
  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv;
      
      // 如果是第一条用户消息，更新对话标题
      const newTitle = conv.messages.length === 0 && message.role === 'user'
        ? message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
        : conv.title;
      
      return {
        ...conv,
        title: newTitle,
        updatedAt: new Date(),
        messages: [...conv.messages, message],
      };
    }));
  };

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!hasKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    // 确保有当前对话
    let convId = currentConversationId;
    if (!convId) {
      convId = createNewConversation();
    }

    // 获取当前对话的评论（闭环生成的核心）
    const currentConv = conversations.find(c => c.id === convId);
    const relevantComments = comments.filter(c => 
      currentConv?.messages.some(m => m.id === c.messageId)
    );

    // 构造增强的 Prompt（如果有评论）
    let enhancedContent = content;
    if (relevantComments.length > 0) {
      const feedbackSection = relevantComments.map((c, index) => {
        return `【反馈 ${index + 1}】
针对你的思考内容: "${c.selectedText}"
我的建议: ${c.comment}`;
      }).join('\n\n');

      enhancedContent = `${feedbackSection}

---
${content || '请根据以上反馈重新思考并给出改进后的回答。'}`;

      // 清除已使用的评论
      setComments(prev => prev.filter(c => !relevantComments.includes(c)));
    }

    // 添加用户消息（显示原始内容，增强内容只发给 API）
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || '(基于反馈重新生成)',
      timestamp: new Date(),
    };
    addMessage(convId, userMessage);
    forceScrollToBottom();

    // 创建 AI 消息占位
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      reasoning_content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    addMessage(convId, aiMessage);

    // 准备 API 消息
    const updatedConv = conversations.find(c => c.id === convId);
    const apiMessages = [
      ...(updatedConv?.messages || []).slice(0, -1).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: enhancedContent },
    ];

    // 流式获取响应
    let reasoning = '';
    let response = '';

    try {
      for await (const delta of streamChat(apiMessages, (error) => {
        console.error('API 错误:', error);
        updateMessage(convId!, aiMessageId, {
          content: `错误: ${error.message}`,
          isStreaming: false,
        });
      })) {
        if (delta.reasoning_content) {
          reasoning += delta.reasoning_content;
          updateMessage(convId!, aiMessageId, {
            reasoning_content: reasoning,
          });
        }
        
        if (delta.content) {
          response += delta.content;
          updateMessage(convId!, aiMessageId, {
            content: response,
          });
        }
      }
    } finally {
      // 标记流式结束
      updateMessage(convId!, aiMessageId, {
        isStreaming: false,
      });
    }
  };

  // 开启新对话
  const handleNewConversation = () => {
    setCurrentConversationId(null);
  };

  // 选择对话
  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  // 添加评论
  const handleAddComment = useCallback((
    messageId: string,
    paragraphId: number,
    selectedText: string,
    comment: string
  ) => {
    const newComment: ThoughtComment = {
      id: Date.now().toString(),
      messageId,
      paragraphId,
      selectedText,
      comment,
      timestamp: new Date(),
    };
    setComments(prev => [...prev, newComment]);
  }, []);

  // 点击评论标签
  const handleCommentTagClick = useCallback((commentId: string) => {
    setActiveCommentId(commentId);
    // 滚动到对应位置（可选）
  }, []);

  // 获取当前对话的评论
  const currentComments = comments.filter(c => 
    messages.some(m => m.id === c.messageId)
  );

  // 是否显示欢迎页面
  const showWelcome = !currentConversationId || messages.length === 0;

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* 左侧边栏 */}
      <Sidebar 
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />

      {/* 右侧主内容区 */}
      <main className="flex-1 flex flex-col relative bg-[#F7F7F8]">
        {/* 对话头部 */}
        {!showWelcome && (
          <ChatHeader 
            title={currentConversation?.title || '新对话'}
            onSettingsClick={() => setIsApiKeyModalOpen(true)}
            showSettings={!isUsingEnvApiKey()}
          />
        )}

        {/* 内容区域 */}
        {showWelcome ? (
          /* 欢迎页面 - 输入框在 Logo 下方 */
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              className="flex items-center gap-3 mb-6"
            >
              <DeepSeekLogo size={40} />
              <h1 className="text-2xl font-medium text-gray-900">
                今天有什么可以帮到你?
              </h1>
            </motion.div>
            
            {/* 输入框 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              className="w-full max-w-3xl"
            >
              <ChatInput onSend={handleSendMessage} />
            </motion.div>
          </div>
        ) : (
          /* 对话模式 */
          <>
            {/* 消息列表 */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto"
            >
              <div className="max-w-3xl mx-auto px-6 py-6">
                {messages.map((message) => (
                  message.role === 'user' ? (
                    <UserMessage key={message.id} message={message} />
                  ) : (
                    <AIMessage 
                      key={message.id} 
                      message={message}
                      comments={comments.filter(c => c.messageId === message.id)}
                      activeCommentId={activeCommentId}
                      onAddComment={handleAddComment}
                      onCommentClick={handleCommentTagClick}
                    />
                  )
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 输入框区域 */}
            <div className="w-full px-8 pb-4 flex flex-col items-center bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pt-4">
              {/* 评论标签 */}
              {currentComments.length > 0 && (
                <div className="w-full max-w-3xl flex flex-wrap gap-2 mb-3">
                  {currentComments.map((comment, index) => (
                    <CommentTag
                      key={comment.id}
                      comment={comment}
                      index={index}
                      onClick={() => handleCommentTagClick(comment.id)}
                    />
                  ))}
                </div>
              )}
              
              <ChatInput onSend={handleSendMessage} />
              <p className="text-xs text-gray-400 mt-3">
                内容由 AI 生成，请仔细甄别
              </p>
            </div>
          </>
        )}
      </main>

      {/* API Key 设置弹窗 */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={() => setHasKey(true)}
      />
    </div>
  );
}

export default App;
