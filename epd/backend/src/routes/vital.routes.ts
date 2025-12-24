import { Router } from 'express';
import { authenticateAuth0 } from '../middlewares/auth0.middleware';
import { vitalController } from '../controllers/vital.controller';

const router = Router();

// All routes require Auth0 M2M authentication
router.use(authenticateAuth0);

router.get('/', vitalController.getAll);
router.get('/:id', vitalController.getById);
router.post('/', vitalController.create);
router.put('/:id', vitalController.update);
router.delete('/:id', vitalController.delete);

export default router;
