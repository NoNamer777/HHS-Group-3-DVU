import { Response } from 'express';
import { AuthRequest } from '../types';
import { allergyService } from '../services/allergy.service';
import { validateIdParam } from '../utils/validation';

export const allergyController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;

      const { allergies, total } = await allergyService.findAll({
        ...(patientId && { patientId }),
        skip,
        take: limit
      });

      res.json({
        allergies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get allergies error:', error);
      res.status(500).json({ error: 'Error fetching allergies' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const allergy = await allergyService.findById(id);

      if (!allergy) {
        return res.status(404).json({ error: 'Allergy not found' });
      }

      res.json(allergy);
    } catch (error) {
      console.error('Get allergy error:', error);
      res.status(500).json({ error: 'Error fetching allergy' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, substance, reaction, severity, notedAt } = req.body;

      const data: any = {
        substance,
        patient: {
          connect: { id: patientId }
        }
      };

      if (reaction) data.reaction = reaction;
      if (severity) data.severity = severity;
      if (notedAt) data.notedAt = new Date(notedAt).toISOString();

      const allergy = await allergyService.create(data);
      res.status(201).json(allergy);
    } catch (error) {
      console.error('Create allergy error:', error);
      res.status(500).json({ error: 'Error creating allergy' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      const validationError = validateIdParam(req.params.id!, 'allergy');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }

      const { patientId, notedAt, ...rest } = req.body;
      const data: any = { ...rest };
      
      if (notedAt) data.notedAt = new Date(notedAt).toISOString();
      if (patientId !== undefined) data.patient = { connect: { id: patientId } };

      const allergy = await allergyService.update(id, data);
      res.json(allergy);
    } catch (error) {
      console.error('Update allergy error:', error);
      res.status(500).json({ error: 'Error updating allergy' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      const validationError = validateIdParam(req.params.id!, 'allergy');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }

      await allergyService.delete(id);
      res.json({ message: 'Allergy deleted' });
    } catch (error) {
      console.error('Delete allergy error:', error);
      res.status(500).json({ error: 'Error deleting allergy' });
    }
  }
};
