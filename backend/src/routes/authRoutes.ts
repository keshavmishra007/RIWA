import { Router } from 'express';
import { demoLogin, getMe, login, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/demo-login', demoLogin);
router.get('/me', requireAuth, getMe);

export default router;
