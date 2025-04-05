
import { Router } from 'express';
import { register, login, get_my_profile } from '../controllers/userController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.patch('/update_profile', authenticate, register);
router.get('/get_profile', authenticate,  get_my_profile);

export default router;
