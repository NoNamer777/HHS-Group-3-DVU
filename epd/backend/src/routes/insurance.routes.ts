import { Router } from 'express';
import { authenticateAuth0 } from '../middlewares/auth0.middleware';
import { insuranceController } from '../controllers/insurance.controller';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(authenticateAuth0);

// Insurer endpoints (keep as-is, simple lookup tables)
router.get('/insurers', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [insurers, total] = await Promise.all([
      prisma.insurer.findMany({
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.insurer.count(),
    ]);

    res.json({
      insurers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching insurers' });
  }
});

router.get('/insurers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid insurer ID' });
    }

    const insurer = await prisma.insurer.findUnique({
      where: { id },
    });

    if (!insurer) {
      return res.status(404).json({ error: 'Insurer not found' });
    }

    res.json(insurer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching insurer' });
  }
});

router.post('/insurers', async (req, res) => {
  try {
    const { name, code, phone, email, website, address } = req.body;
    const insurer = await prisma.insurer.create({
      data: { name, code, phone, email, website, address },
    });
    res.status(201).json(insurer);
  } catch (error) {
    console.error('Create insurer error:', error);
    res.status(500).json({ error: 'Error creating insurer' });
  }
});

router.put('/insurers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid insurer ID' });
    }

    const { name, code, phone, email, website, address } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (code !== undefined) data.code = code;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (website !== undefined) data.website = website;
    if (address !== undefined) data.address = address;

    const insurer = await prisma.insurer.update({
      where: { id },
      data,
    });

    res.json(insurer);
  } catch (error) {
    res.status(500).json({ error: 'Error updating insurer' });
  }
});

// Insurance policy endpoints (use controller)
router.get('/policies', insuranceController.getAll);
router.get('/policies/:id', insuranceController.getById);
router.post('/policies', async (req, res) => {
  try {
    await insuranceController.create(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error creating insurance policy' });
  }
});

router.put('/policies/:id', async (req, res) => {
  try {
    await insuranceController.update(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error updating insurance policy' });
  }
});

router.delete('/policies/:id', async (req, res) => {
  try {
    await insuranceController.delete(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting insurance policy' });
  }
});

export default router;
