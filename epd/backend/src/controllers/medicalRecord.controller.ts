import { Response } from 'express';
import { AuthRequest } from '../types';
import { medicalRecordService } from '../services/medicalRecord.service';

export const medicalRecordController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const encounterId = req.query.encounterId ? parseInt(req.query.encounterId as string) : undefined;

      const { records, total } = await medicalRecordService.findAll({
        ...(patientId && { patientId }),
        ...(encounterId && { encounterId }),
        skip,
        take: limit
      });

      res.json({
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get medical records error:', error);
      res.status(500).json({ error: 'Error fetching medical records' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const record = await medicalRecordService.findById(id);

      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json(record);
    } catch (error) {
      console.error('Get medical record error:', error);
      res.status(500).json({ error: 'Error fetching record' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, encounterId, type, title, content } = req.body;

      const data: any = {
        type,
        content,
        patient: {
          connect: { id: patientId }
        }
      };

      if (title) data.title = title;
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

      const record = await medicalRecordService.create(data);
      res.status(201).json(record);
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(500).json({ error: 'Error creating record' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }

      const data = req.body;
      const record = await medicalRecordService.update(id, data);
      res.json(record);
    } catch (error) {
      console.error('Update medical record error:', error);
      res.status(500).json({ error: 'Error updating record' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }

      await medicalRecordService.delete(id);
      res.json({ message: 'Record deleted' });
    } catch (error) {
      console.error('Delete medical record error:', error);
      res.status(500).json({ error: 'Error deleting record' });
    }
  }
};
