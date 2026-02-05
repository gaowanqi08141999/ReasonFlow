import React from 'react';
import { Plus, MoreHorizontal, RotateCcw, Square } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeepSeekLogo } from './DeepSeekLogo';
import { ChatHistoryItem } from './ChatHistoryItem';
import type { Conversation } from '@/types/chat';

interface SidebarProps {
  conversations?: Conversation[];
  currentConversationId?: string | null;
  onNewConversation?: () => void;
  onSelectConversation?: (id: string) => void;
}

// 按日期分组对话
const groupConversationsByDate = (conversations: Conversation[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '7天内', items: [] },
    { label: '更早', items: [] },
  ];

  conversations.forEach(conv => {
    const convDate = new Date(conv.updatedAt);
    if (convDate >= today) {
      groups[0].items.push(conv);
    } else if (convDate >= yesterday) {
      groups[1].items.push(conv);
    } else if (convDate >= weekAgo) {
      groups[2].items.push(conv);
    } else {
      groups[3].items.push(conv);
    }
  });

  return groups.filter(g => g.items.length > 0);
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  conversations = [],
  currentConversationId,
  onNewConversation,
  onSelectConversation,
}) => {
  const groupedConversations = groupConversationsByDate(conversations);
  const hasConversations = conversations.length > 0;

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo区域 */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DeepSeekLogo size={28} />
          <span className="text-xl font-semibold text-[#4D6BFE]">deepseek</span>
        </div>
        {/* 右侧折叠按钮 */}
        <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Square size={16} />
        </button>
      </div>

      {/* 新对话按钮 */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewConversation}
          className="
            w-full flex items-center justify-center gap-2 
            px-4 py-2.5 rounded-xl
            border border-gray-200 bg-white
            text-sm font-medium text-gray-700
            transition-all duration-200 ease-out
            hover:bg-gray-50 hover:border-gray-300
          "
        >
          <Plus size={16} strokeWidth={2} />
          <span>开启新对话</span>
        </button>
      </div>

      {/* 对话历史列表 */}
      {hasConversations ? (
        <ScrollArea className="flex-1 px-3">
          <div className="py-2 space-y-4">
            {groupedConversations.map((group) => (
              <div key={group.label}>
                {/* 分组标题 */}
                <div className="px-3 py-1.5 text-xs font-medium text-gray-400">
                  {group.label}
                </div>
                {/* 对话列表 */}
                <div className="space-y-0.5">
                  {group.items.map((conv) => (
                    <ChatHistoryItem
                      key={conv.id}
                      title={conv.title}
                      isActive={currentConversationId === conv.id}
                      onClick={() => onSelectConversation?.(conv.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        /* 空状态 - 暂无历史对话 */
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <RotateCcw size={24} className="mb-2" />
          <span className="text-sm">暂无历史对话</span>
        </div>
      )}

      {/* 底部用户信息 */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=wanqi" />
            <AvatarFallback>W</AvatarFallback>
          </Avatar>
          <span className="flex-1 text-sm font-medium text-gray-700 truncate">
            wanqi gao
          </span>
          <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
