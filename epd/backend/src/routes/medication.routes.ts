import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { medicationController } from '../controllers/medication.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', medicationController.getAll);
router.get('/:id', medicationController.getById);
router.post('/', medicationController.create);
router.put('/:id', medicationController.update);
router.delete('/:id', medicationController.delete);

export default router;
