import { Router } from 'express';
import { authenticateAuth0 } from '../middlewares/auth0.middleware';
import { diagnosisController } from '../controllers/diagnosis.controller';

const router = Router();

// All routes require Auth0 M2M authentication
router.use(authenticateAuth0);

router.get('/', diagnosisController.getAll);
router.get('/:id', diagnosisController.getById);
router.post('/', diagnosisController.create);
router.put('/:id', diagnosisController.update);
router.delete('/:id', diagnosisController.delete);

export default router;
