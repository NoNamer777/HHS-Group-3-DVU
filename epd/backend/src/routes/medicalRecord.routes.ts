import { Router } from 'express';
import { medicalRecordController } from '../controllers/medicalRecord.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', medicalRecordController.getAll);
router.get('/:id', medicalRecordController.getById);
router.post('/', medicalRecordController.create);
router.put('/:id', medicalRecordController.update);
router.delete('/:id', medicalRecordController.delete);

export default router;
