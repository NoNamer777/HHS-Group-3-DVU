import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { labResultController } from '../controllers/labResult.controller';

const router = Router();
router.use(authenticateToken);

router.get('/', labResultController.getAll);
router.get('/:id', labResultController.getById);
router.post('/', async (req, res) => {
  try {
    await labResultController.create(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error creating lab result' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await labResultController.update(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error updating lab result' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await labResultController.delete(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting lab result' });
  }
});

export default router;
