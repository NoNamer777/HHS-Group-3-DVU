import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { allergyController } from '../controllers/allergy.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', allergyController.getAll);
router.get('/:id', allergyController.getById);
router.post('/', allergyController.create);
router.put('/:id', allergyController.update);
router.delete('/:id', allergyController.delete);

export default router;
