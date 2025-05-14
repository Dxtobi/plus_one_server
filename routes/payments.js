// 


import { Router } from 'express';

import { payment_create_payment, payment_webhook } from '../controllers/paymentController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.post('/web/hook',  payment_webhook);
router.post('/init', authenticate, payment_create_payment);



export default router;
