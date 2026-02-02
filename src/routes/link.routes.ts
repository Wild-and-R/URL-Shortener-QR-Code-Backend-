import express from 'express';
import { authenticate } from '../middleware/auth';
import { createShortLink } from '../controllers/link.controller';

const router = express.Router();

router.post('/', authenticate, createShortLink);

export default router;
