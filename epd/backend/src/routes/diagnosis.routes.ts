import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { diagnosisController } from '../controllers/diagnosis.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', diagnosisController.getAll);
router.get('/:id', diagnosisController.getById);
router.post('/', diagnosisController.create);
router.put('/:id', diagnosisController.update);
router.delete('/:id', diagnosisController.delete);

export default router;
