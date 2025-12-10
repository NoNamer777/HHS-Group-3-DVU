import { Response } from 'express';
import { AuthRequest } from '../types';
import { vitalService } from '../services/vital.service';
import { validateIdParam } from '../utils/validation';

export const vitalController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const type = req.query.type as string | undefined;

      const { vitals, total } = await vitalService.findAll({
        ...(patientId && { patientId }),
        ...(type && { type }),
        skip,
        take: limit
      });

      res.json({
        vitals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get vitals error:', error);
      res.status(500).json({ error: 'Error fetching vitals' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const vital = await vitalService.findById(id);

      if (!vital) {
        return res.status(404).json({ error: 'Vital sign not found' });
      }

      res.json(vital);
    } catch (error) {
      console.error('Get vital error:', error);
      res.status(500).json({ error: 'Error fetching vital sign' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, type, value, unit, measuredAt } = req.body;

      const data: any = {
        type,
        value,
        patient: {
          connect: { id: patientId }
        }
      };

      if (unit) data.unit = unit;
      if (measuredAt) data.measuredAt = new Date(measuredAt).toISOString();

      const vital = await vitalService.create(data);
      res.status(201).json(vital);
    } catch (error) {
      console.error('Create vital error:', error);
      res.status(500).json({ error: 'Error creating vital sign' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const validationError = validateIdParam(req.params.id!, 'vital sign');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }
      
      const id = parseInt(req.params.id!);

      const { patientId, measuredAt, ...rest } = req.body;
      const data: any = { ...rest };
      
      if (measuredAt) data.measuredAt = new Date(measuredAt).toISOString();
      if (patientId !== undefined) data.patient = { connect: { id: patientId } };

      const vital = await vitalService.update(id, data);
      res.json(vital);
    } catch (error) {
      console.error('Update vital error:', error);
      res.status(500).json({ error: 'Error updating vital sign' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const validationError = validateIdParam(req.params.id!, 'vital sign');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }
      
      const id = parseInt(req.params.id!);

      await vitalService.delete(id);
      res.json({ message: 'Vital sign deleted' });
    } catch (error) {
      console.error('Delete vital error:', error);
      res.status(500).json({ error: 'Error deleting vital sign' });
    }
  }
};
