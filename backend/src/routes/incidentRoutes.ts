import { Router } from 'express';
import {
  assignIncidentDepartment,
  getIncidentById,
  getIncidents,
  updateIncidentStatus,
} from '../controllers/incidentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.patch('/:id/status', requireAuth, requireRole(['AUTHORITY', 'ADMIN']), updateIncidentStatus);
router.patch('/:id/assign', requireAuth, requireRole(['AUTHORITY', 'ADMIN']), assignIncidentDepartment);

export default router;
