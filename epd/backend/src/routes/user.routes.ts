import { Router } from 'express';
import { userService } from '../services/user.service';
import { authenticateAuth0, requireAnyPermission } from '../middlewares/auth0.middleware';

const router = Router();

// All routes require Auth0 M2M authentication
router.use(authenticateAuth0);

router.get('/', requireAnyPermission('read:users', 'admin:all'), async (req, res) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await userService.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

export default router;
