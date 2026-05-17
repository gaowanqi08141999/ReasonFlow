# ReasonFlow

> Interactive Chain-of-Thought (CoT) feedback system - annotate AI reasoning, refine AI thinking.

一个基于 DeepSeek 的交互式 CoT 反馈系统。用户可以实时标注 AI 的推理过程，并触发上下文感知的重新生成，实现对 AI 思维的精准控制。

## Features

- **流式响应** - 实时展示 AI 思考过程（CoT）和最终回答
- **CoT 交互反馈**：
  - 悬停高亮思考段落
  - 框选文字添加精准评论
  - 评论标签可视化
  - 基于反馈的闭环生成
- **智能滚动** - 查看历史时不会被强制滚动
- **对话管理** - 多轮对话和历史记录

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- DeepSeek API (deepseek-reasoner)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API Key

Create `.env` file (copy from `.env.example`):

```bash
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

> Get API Key: https://platform.deepseek.com/

### 3. Start dev server

```bash
npm run dev
```

## How It Works

### CoT Interactive Feedback

1. Send a question, AI displays thinking process (gray text)
2. Hover on thinking paragraphs to highlight
3. Select text and right-click to add comments
4. Comments appear as tags at the bottom
5. Send again - AI regenerates based on your feedback

## Project Structure

```
src/
├── components/           # UI Components
│   ├── AIMessage.tsx     # AI message display
│   ├── ChatInput.tsx     # Chat input box
│   ├── ThoughtBlock.tsx  # CoT interaction
│   ├── CommentPopover.tsx # Comment popover
│   └── ...
├── services/
│   └── deepseek.ts       # DeepSeek API service
├── types/
│   └── chat.ts           # TypeScript types
└── App.tsx               # Main app
```

## License

MIT
