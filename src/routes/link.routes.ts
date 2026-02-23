import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  createShortLink, 
  getLinkStats, 
  updateLink, 
  deleteLink,
  getMyLinks 
} from '../controllers/link.controller';
import { downloadQrPng } from '../controllers/qr.controller';

const router = express.Router();

router.post('/', authenticate, createShortLink);
router.get('/:id/qr', authenticate, downloadQrPng);
router.get('/:id/stats', authenticate, getLinkStats);
router.put('/:id', authenticate, updateLink);
router.delete('/:id', authenticate, deleteLink);
router.get('/', authenticate, getMyLinks);

export default router;
