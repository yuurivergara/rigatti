import { Router, type Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { z } from 'zod';
import type Anthropic from '@anthropic-ai/sdk';
import { authenticate } from '../../middleware/authenticate.js';
import { Message } from './message.model.js';
import { runAgent } from './agent.js';

const HISTORY_LIMIT = 30;

const sendMessageSchema = z.object({
  message: z.string().trim().min(1, 'Escreva uma mensagem').max(4000),
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: (req) => req.auth?.sub ?? ipKeyGenerator(req.ip ?? 'anon'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Muitas mensagens. Aguarde um instante.' } },
});

const sse = (res: Response, event: unknown) => res.write(`data: ${JSON.stringify(event)}\n\n`);

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get('/history', async (req, res) => {
  const messages = await Message.find({ userId: req.auth!.sub })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .lean();

  res.json(
    messages.reverse().map((m) => ({
      id: String(m._id),
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  );
});

chatRouter.delete('/history', async (req, res) => {
  await Message.deleteMany({ userId: req.auth!.sub });
  res.status(204).end();
});

chatRouter.post('/', chatLimiter, async (req, res) => {
  const { message } = sendMessageSchema.parse(req.body);
  const userId = req.auth!.sub;

  const previous = await Message.find({ userId }).sort({ createdAt: -1 }).limit(HISTORY_LIMIT).lean();

  const history: Anthropic.MessageParam[] = previous
    .reverse()
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  history.push({ role: 'user', content: message });

  await Message.create({ userId, role: 'user', content: message });

  res.status(200).set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  // Cliente desconectou: aborta a chamada ao modelo em vez de seguir gerando
  // tokens que ninguém vai ler. O sinal é o `close` da resposta, não o do
  // request, que pode fechar assim que o corpo termina de ser lido.
  const controller = new AbortController();
  res.on('close', () => controller.abort());

  let answer = '';

  try {
    for await (const event of runAgent(history, controller.signal)) {
      if (event.type === 'done') answer = event.text;
      sse(res, event);
    }

    if (answer.trim()) {
      await Message.create({ userId, role: 'assistant', content: answer });
    }
  } catch (err) {
    if (controller.signal.aborted) return;
    console.error('[chat]', err);
    sse(res, { type: 'error', message: 'O assistente falhou ao responder. Tente novamente.' });
  } finally {
    res.end();
  }
});
