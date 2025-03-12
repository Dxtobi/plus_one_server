
// routes/gigRoutes.js
import { Router } from 'express';
import { createGig, completeGig } from '../controllers/gigController';
import authenticate from '../middleware/authenticate';

const router = Router();

router.post('/', authenticate, createGig);
router.post('/:id/complete', authenticate, completeGig);

export default router;

