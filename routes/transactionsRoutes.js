
import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { get_user_transactions } from '../controllers/walletService.js';

const router = Router();

router.get('/get_transactions', authenticate, get_user_transactions);


export default router;
