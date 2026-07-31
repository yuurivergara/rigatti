import { Router } from 'express';
import multer from 'multer';
import { env } from '../../config/env.js';
import { authenticate, requireRole } from '../../middleware/authenticate.js';
import { badRequest, notFound } from '../../lib/http-error.js';
import { Image } from './image.model.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) return cb(badRequest('Formato aceito: JPEG, PNG, WebP ou AVIF'));
    cb(null, true);
  },
});

export const imageRouter = Router();

imageRouter.post('/', authenticate, requireRole('admin'), upload.single('file'), async (req, res) => {
  if (!req.file) throw badRequest('Envie um arquivo no campo "file"');

  const image = await Image.create({
    companyId: req.auth!.companyId,
    contentType: req.file.mimetype,
    size: req.file.size,
    data: req.file.buffer,
  });

  res.status(201).json({ url: `${req.protocol}://${req.get('host')}/api/images/${image._id}` });
});

imageRouter.get('/:id', async (req, res) => {
  const image = await Image.findById(String(req.params.id)).lean();
  if (!image) throw notFound('Imagem não encontrada');

  res.setHeader('Content-Type', image.contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.end(image.data);
});
