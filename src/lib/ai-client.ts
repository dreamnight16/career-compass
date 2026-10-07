/**
 * 统一 AI 客户端 — 支持 DeepSeek（OpenAI 兼容）和 Anthropic。
 */

import Anthropic from '@anthropic-ai/sdk';

type Role = 'user' | 'assistant' | 'system';

interface AiMessage {
  role: Role;
  content: string;
}

interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  messages: AiMessage[];
}

interface ChatResult {
  text: string;
}

export const AI_NOT_CONFIGURED = 'AI_NOT_CONFIGURED';

export function isAiConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY);
}

function assertAiConfigured(): void {
  if (!isAiConfigured()) throw new Error(AI_NOT_CONFIGURED);
}

function buildDeepSeekMessages(opts: ChatOptions): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  for (const m of opts.messages) {
    messages.push({ role: m.role, content: m.content });
  }
  return messages;
}

/** DeepSeek 非流式 */
async function chatDeepSeek(opts: ChatOptions): Promise<ChatResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const model = opts.model || 'deepseek-chat';

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildDeepSeekMessages(opts),
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek returned no content');
  return { text };
}

/** DeepSeek 流式 — 返回 ReadableStream<Uint8Array> */
function streamDeepSeek(opts: ChatOptions): ReadableStream<Uint8Array> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const model = opts.model || 'deepseek-chat';

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: buildDeepSeekMessages(opts),
            max_tokens: opts.maxTokens ?? 2048,
            temperature: opts.temperature ?? 0.7,
            stream: true,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          controller.error(new Error(`DeepSeek API error ${response.status}: ${err}`));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error('No response body'));
          return;
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
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // skip unparseable chunks
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/** Anthropic */
let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

async function chatAnthropic(opts: ChatOptions): Promise<ChatResult> {
  const client = getAnthropic();
  const response = await client.messages.create({
    model: opts.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature,
    system: opts.systemPrompt,
    messages: opts.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  });
  const textBlock = response.content.find((b) => b.type === 'text');
  return { text: textBlock?.text ?? '' };
}

/** Anthropic 流式 */
async function* streamAnthropic(opts: ChatOptions): AsyncGenerator<string> {
  const client = getAnthropic();
  const stream = client.messages.stream({
    model: opts.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature,
    system: opts.systemPrompt,
    messages: opts.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

/** 非流式 */
export async function chat(opts: ChatOptions): Promise<ChatResult> {
  assertAiConfigured();
  if (process.env.DEEPSEEK_API_KEY) return chatDeepSeek(opts);
  return chatAnthropic(opts);
}

/** 流式 — 返回 ReadableStream */
export function chatStream(opts: ChatOptions): ReadableStream<Uint8Array> {
  assertAiConfigured();
  if (process.env.DEEPSEEK_API_KEY) return streamDeepSeek(opts);

  // Anthropic: convert async generator to ReadableStream
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamAnthropic(opts)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export function currentProvider(): 'deepseek' | 'anthropic' {
  return process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'anthropic';
}
