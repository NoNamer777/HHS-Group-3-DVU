import { Response } from 'express';
import { AuthRequest } from '../types';
import { diagnosisService } from '../services/diagnosis.service';

export const diagnosisController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const encounterId = req.query.encounterId ? parseInt(req.query.encounterId as string) : undefined;

      const { diagnoses, total } = await diagnosisService.findAll({
        ...(patientId && { patientId }),
        ...(encounterId && { encounterId }),
        skip,
        take: limit
      });

      res.json({
        diagnoses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get diagnoses error:', error);
      res.status(500).json({ error: 'Error fetching diagnoses' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const diagnosis = await diagnosisService.findById(id);

      if (!diagnosis) {
        return res.status(404).json({ error: 'Diagnosis not found' });
      }

      res.json(diagnosis);
    } catch (error) {
      console.error('Get diagnosis error:', error);
      res.status(500).json({ error: 'Error fetching diagnosis' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, encounterId, code, description, type, onset, resolved } = req.body;

      const data: any = {
        code,
        description,
        type,
        patient: {
          connect: { id: patientId }
        }
      };

      if (onset) data.onset = new Date(onset).toISOString();
      if (resolved) data.resolved = new Date(resolved).toISOString();
      if (encounterId) {
        data.encounter = {
          connect: { id: encounterId }
        };
      }

      // Link to current user if available
      if (req.user) {
        data.author = {
          connect: { id: req.user.id }
        };
      }

      const diagnosis = await diagnosisService.create(data);
      res.status(201).json(diagnosis);
    } catch (error) {
      console.error('Create diagnosis error:', error);
      res.status(500).json({ error: 'Error creating diagnosis' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid diagnosis ID' });
      }

      const { patientId, encounterId, onset, resolved, ...rest } = req.body;
      const data: any = { ...rest };
      
      // Convert date fields if present
      if (onset) data.onset = new Date(onset).toISOString();
      if (resolved) data.resolved = new Date(resolved).toISOString();
      
      // Handle relational fields
      if (patientId !== undefined) data.patient = { connect: { id: patientId } };
      if (encounterId !== undefined) data.encounter = { connect: { id: encounterId } };

      const diagnosis = await diagnosisService.update(id, data);
      res.json(diagnosis);
    } catch (error) {
      console.error('Update diagnosis error:', error);
      res.status(500).json({ error: 'Error updating diagnosis' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid diagnosis ID' });
      }

      await diagnosisService.delete(id);
      res.json({ message: 'Diagnosis deleted' });
    } catch (error) {
      console.error('Delete diagnosis error:', error);
      res.status(500).json({ error: 'Error deleting diagnosis' });
    }
  }
};
