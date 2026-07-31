import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../lib/http-error.js';
import { env } from '../config/env.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: `Rota ${req.method} ${req.path} não existe` } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: 'validation_error',
        message: 'Dados inválidos',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: { code: 'bad_request', message: 'Identificador inválido' } });
  }

  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ error: { code: 'conflict', message: 'Registro duplicado' } });
  }

  console.error('[unhandled]', err);
  res.status(500).json({
    error: {
      code: 'internal_error',
      message: 'Erro interno',
      ...(env.NODE_ENV !== 'production' && { debug: String(err) }),
    },
  });
};
