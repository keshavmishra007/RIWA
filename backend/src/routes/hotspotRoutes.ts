import { Router } from 'express';
import { getHotspots } from '../controllers/hotspotController.js';

const router = Router();

router.get('/', getHotspots);

export default router;
