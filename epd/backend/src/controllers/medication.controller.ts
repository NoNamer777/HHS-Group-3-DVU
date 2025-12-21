import { Response } from 'express';
import { AuthRequest } from '../types';
import { medicationService } from '../services/medication.service';
import { validateIdParam } from '../utils/validation';

export const medicationController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const encounterId = req.query.encounterId ? parseInt(req.query.encounterId as string) : undefined;
      const status = req.query.status as string | undefined;

      const { medications, total } = await medicationService.findAll({
        ...(patientId && { patientId }),
        ...(encounterId && { encounterId }),
        ...(status && { status }),
        skip,
        take: limit
      });

      res.json({
        medications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get medications error:', error);
      res.status(500).json({ error: 'Error fetching medications' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const medication = await medicationService.findById(id);

      if (!medication) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      res.json(medication);
    } catch (error) {
      console.error('Get medication error:', error);
      res.status(500).json({ error: 'Error fetching medication' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, encounterId, medicationName, dose, route, frequency, startDate, endDate, status } = req.body;

      const data: any = {
        medicationName,
        dose,
        startDate: new Date(startDate).toISOString(),
        patient: {
          connect: { id: patientId }
        }
      };

      if (route) data.route = route;
      if (frequency) data.frequency = frequency;
      if (endDate) data.endDate = new Date(endDate).toISOString();
      if (status) data.status = status;
      if (encounterId) {
        data.encounter = {
          connect: { id: encounterId }
        };
      }

      // Link to current user as prescriber if available
      if (req.user) {
        data.prescriber = {
          connect: { id: req.user.id }
        };
      }

      const medication = await medicationService.create(data);
      res.status(201).json(medication);
    } catch (error) {
      console.error('Create medication error:', error);
      res.status(500).json({ error: 'Error creating medication' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const validationError = validateIdParam(req.params.id!, 'medication');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }
      
      const id = parseInt(req.params.id!);

      const { patientId, encounterId, prescriberId, startDate, endDate, ...rest } = req.body;
      const data: any = { ...rest };
      
      // Convert date fields if present
      if (startDate) data.startDate = new Date(startDate).toISOString();
      if (endDate) data.endDate = new Date(endDate).toISOString();
      
      // Handle relational fields
      if (patientId !== undefined) data.patient = { connect: { id: patientId } };
      if (encounterId !== undefined) data.encounter = { connect: { id: encounterId } };
      if (prescriberId !== undefined) data.prescriber = { connect: { id: prescriberId } };

      const medication = await medicationService.update(id, data);
      res.json(medication);
    } catch (error) {
      console.error('Update medication error:', error);
      res.status(500).json({ error: 'Error updating medication' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const validationError = validateIdParam(req.params.id!, 'medication');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }
      
      const id = parseInt(req.params.id!);

      await medicationService.delete(id);
      res.json({ message: 'Medication deleted' });
    } catch (error) {
      console.error('Delete medication error:', error);
      res.status(500).json({ error: 'Error deleting medication' });
    }
  }
};
