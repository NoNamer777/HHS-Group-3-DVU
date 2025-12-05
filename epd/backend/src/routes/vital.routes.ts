import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { vitalController } from '../controllers/vital.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', vitalController.getAll);
router.get('/:id', vitalController.getById);
router.post('/', vitalController.create);
router.put('/:id', vitalController.update);
router.delete('/:id', vitalController.delete);

export default router;
