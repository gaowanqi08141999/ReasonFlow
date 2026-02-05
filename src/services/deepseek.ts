import type { APIMessage, StreamDelta } from '@/types/chat';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 优先使用环境变量中的 API Key，其次使用 localStorage 中的
export const getApiKey = (): string | null => {
  // 优先使用环境变量（适合 demo 展示）
  const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (envKey && envKey !== 'your_api_key_here') {
    return envKey;
  }
  // 其次使用 localStorage（用户手动设置）
  return localStorage.getItem('deepseek_api_key');
};

// 保存 API Key 到 localStorage
export const setApiKey = (key: string): void => {
  localStorage.setItem('deepseek_api_key', key);
};

// 检查是否有 API Key
export const hasApiKey = (): boolean => {
  const key = getApiKey();
  return !!key && key.length > 0;
};

// 检查是否使用环境变量中的 API Key（用于隐藏设置按钮）
export const isUsingEnvApiKey = (): boolean => {
  const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  return !!envKey && envKey !== 'your_api_key_here';
};

// 流式调用 DeepSeek API
export async function* streamChat(
  messages: APIMessage[],
  onError?: (error: Error) => void
): AsyncGenerator<StreamDelta> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    onError?.(new Error('请先设置 API Key'));
    return;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
        
        if (trimmedLine.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmedLine.slice(6));
            const delta = json.choices?.[0]?.delta;
            
            if (delta) {
              yield {
                content: delta.content || undefined,
                reasoning_content: delta.reasoning_content || undefined,
              };
            }
          } catch (e) {
            // 忽略解析错误，继续处理
            console.warn('JSON 解析错误:', e);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error as Error);
  }
}
