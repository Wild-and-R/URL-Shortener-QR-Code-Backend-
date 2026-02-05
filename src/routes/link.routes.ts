import express from 'express';
import { authenticate } from '../middleware/auth';
import { createShortLink } from '../controllers/link.controller';
import { downloadQrPng } from '../controllers/qr.controller';

const router = express.Router();

router.post('/', authenticate, createShortLink);
router.get('/:id/qr', authenticate, downloadQrPng);

export default router;
