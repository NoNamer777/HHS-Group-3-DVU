import { Router } from 'express';
import { authenticateAuth0 } from '../middlewares/auth0.middleware';
import { appointmentController } from '../controllers/appointment.controller';

const router = Router();
router.use(authenticateAuth0);

router.get('/', appointmentController.getAll);
router.get('/:id', appointmentController.getById);
router.post('/', async (req, res) => {
  try {
    await appointmentController.create(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await appointmentController.update(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await appointmentController.delete(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

export default router;
