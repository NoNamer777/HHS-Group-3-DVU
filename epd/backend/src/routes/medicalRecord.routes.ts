import { Router } from 'express';
import { medicalRecordController } from '../controllers/medicalRecord.controller';
import { authenticateAuth0 } from '../middlewares/auth0.middleware';

const router = Router();

// All routes require Auth0 M2M authentication
router.use(authenticateAuth0);

router.get('/', medicalRecordController.getAll);
router.get('/:id', medicalRecordController.getById);
router.post('/', medicalRecordController.create);
router.put('/:id', medicalRecordController.update);
router.delete('/:id', medicalRecordController.delete);

export default router;
