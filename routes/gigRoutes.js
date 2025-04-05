

import { Router } from 'express';
import { createGig, completeGig, getGigs } from '../controllers/gigController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, getGigs);

router.post('/', authenticate, createGig);
router.put('/:id/complete', authenticate, completeGig);

export default router;

