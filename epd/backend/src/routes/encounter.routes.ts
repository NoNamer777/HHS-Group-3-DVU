import { Router } from 'express';
import { encounterController } from '../controllers/encounter.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/encounters:
 *   get:
 *     tags: [Encounters]
 *     summary: Get all encounters
 *     description: Retrieve a paginated list of patient encounters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Filter by patient ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PLANNED, IN_PROGRESS, FINISHED, CANCELLED]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INPATIENT, OUTPATIENT, EMERGENCY]
 *     responses:
 *       200:
 *         description: List of encounters
 *       500:
 *         description: Server error
 */
router.get('/', encounterController.getAll);

/**
 * @swagger
 * /api/encounters/{id}:
 *   get:
 *     tags: [Encounters]
 *     summary: Get encounter by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encounter details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Encounter'
 *       404:
 *         description: Encounter not found
 *       500:
 *         description: Server error
 */
router.get('/:id', encounterController.getById);

/**
 * @swagger
 * /api/encounters:
 *   post:
 *     tags: [Encounters]
 *     summary: Create a new encounter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - status
 *               - start
 *               - patientId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INPATIENT, OUTPATIENT, EMERGENCY]
 *               status:
 *                 type: string
 *                 enum: [PLANNED, IN_PROGRESS, FINISHED, CANCELLED]
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *               patientId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Encounter created
 *       500:
 *         description: Server error
 */
router.post('/', encounterController.create);

/**
 * @swagger
 * /api/encounters/{id}:
 *   put:
 *     tags: [Encounters]
 *     summary: Update encounter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Encounter'
 *     responses:
 *       200:
 *         description: Encounter updated
 *       500:
 *         description: Server error
 */
router.put('/:id', encounterController.update);

/**
 * @swagger
 * /api/encounters/{id}:
 *   delete:
 *     tags: [Encounters]
 *     summary: Delete encounter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encounter deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', encounterController.delete);

export default router;
