import { Router } from 'express';
import { authenticateAuth0 } from '../middlewares/auth0.middleware';
import { medicationController } from '../controllers/medication.controller';

const router = Router();

// All routes require Auth0 M2M authentication
router.use(authenticateAuth0);

router.get('/', medicationController.getAll);
router.get('/:id', medicationController.getById);
router.post('/', medicationController.create);
router.put('/:id', medicationController.update);
router.delete('/:id', medicationController.delete);

export default router;
