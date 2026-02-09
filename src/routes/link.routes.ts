import express from 'express';
import { authenticate } from '../middleware/auth';
import { createShortLink, getLinkStats } from '../controllers/link.controller';
import { downloadQrPng } from '../controllers/qr.controller';

const router = express.Router();

router.post('/', authenticate, createShortLink);
router.get('/:id/qr', authenticate, downloadQrPng);
router.get('/:id/stats', authenticate, getLinkStats);

export default router;
