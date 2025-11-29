import { Response } from 'express';
import { AuthRequest } from '../types';
import { encounterService } from '../services/encounter.service';
import { EncounterStatus, EncounterType } from '@prisma/client';

export const encounterController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const status = req.query.status as EncounterStatus | undefined;
      const type = req.query.type as EncounterType | undefined;

      const { encounters, total } = await encounterService.findAll({
        ...(patientId && { patientId }),
        ...(status && { status }),
        ...(type && { type }),
        skip,
        take: limit
      });

      res.json({
        encounters,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get encounters error:', error);
      res.status(500).json({ error: 'Error fetching encounters' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const encounter = await encounterService.findById(id);

      if (!encounter) {
        return res.status(404).json({ error: 'Encounter not found' });
      }

      res.json(encounter);
    } catch (error) {
      console.error('Get encounter error:', error);
      res.status(500).json({ error: 'Error fetching encounter' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, type, status, reason, location, start, end } = req.body;

      const data: any = {
        type,
        status,
        start: start ? new Date(start).toISOString() : new Date().toISOString(),
        patient: {
          connect: { id: patientId }
        }
      };

      if (reason) data.reason = reason;
      if (location) data.location = location;
      if (end) data.end = new Date(end).toISOString();

      // Link to current user if available
      if (req.user) {
        data.createdBy = {
          connect: { id: req.user.id }
        };
      }

      const encounter = await encounterService.create(data);
      res.status(201).json(encounter);
    } catch (error) {
      console.error('Create encounter error:', error);
      res.status(500).json({ error: 'Error creating encounter' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const data = req.body;

      const encounter = await encounterService.update(id, data);
      res.json(encounter);
    } catch (error) {
      console.error('Update encounter error:', error);
      res.status(500).json({ error: 'Error updating encounter' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      await encounterService.delete(id);
      res.json({ message: 'Encounter deleted' });
    } catch (error) {
      console.error('Delete encounter error:', error);
      res.status(500).json({ error: 'Error deleting encounter' });
    }
  }
};
