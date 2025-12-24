import { Router } from 'express';
import { authenticateAuth0 } from '../middlewares/auth0.middleware';
import { allergyController } from '../controllers/allergy.controller';

const router = Router();

// All routes require Auth0 M2M authentication
router.use(authenticateAuth0);

router.get('/', allergyController.getAll);
router.get('/:id', allergyController.getById);
router.post('/', allergyController.create);
router.put('/:id', allergyController.update);
router.delete('/:id', allergyController.delete);

export default router;
