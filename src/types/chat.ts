// 消息角色
export type MessageRole = 'user' | 'assistant';

// CoT 评论
export interface ThoughtComment {
  id: string;
  messageId: string;        // 所属消息 ID
  paragraphId: number;      // 段落 ID（第几步）
  selectedText: string;     // 被框选的文本
  comment: string;          // 用户评论
  timestamp: Date;
}

// 单条消息
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  reasoning_content?: string; // CoT 思考过程
  timestamp: Date;
  isStreaming?: boolean;
}

// 对话
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// API 请求消息格式
export interface APIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 流式响应的 delta
export interface StreamDelta {
  content?: string;
  reasoning_content?: string;
}
