import { Response } from 'express';
import { AuthRequest } from '../types';
import { labResultService } from '../services/labResult.service';

export const labResultController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const encounterId = req.query.encounterId ? parseInt(req.query.encounterId as string) : undefined;
      const status = req.query.status as string | undefined;

      const { labResults, total } = await labResultService.findAll({
        ...(patientId && { patientId }),
        ...(encounterId && { encounterId }),
        ...(status && { status }),
        skip,
        take: limit
      });

      res.json({
        labResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get lab results error:', error);
      res.status(500).json({ error: 'Error fetching lab results' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const labResult = await labResultService.findById(id);

      if (!labResult) {
        return res.status(404).json({ error: 'Lab result not found' });
      }

      res.json(labResult);
    } catch (error) {
      console.error('Get lab result error:', error);
      res.status(500).json({ error: 'Error fetching lab result' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, encounterId, testName, value, unit, referenceRange, status, takenAt, reportedAt } = req.body;

      const data: any = {
        testName,
        patient: {
          connect: { id: patientId }
        }
      };

      if (value) data.value = value;
      if (unit) data.unit = unit;
      if (referenceRange) data.referenceRange = referenceRange;
      if (status) data.status = status;
      if (takenAt) data.takenAt = new Date(takenAt).toISOString();
      if (reportedAt) data.reportedAt = new Date(reportedAt).toISOString();
      
      if (encounterId) {
        data.encounter = {
          connect: { id: encounterId }
        };
      }

      // Link to current user as validator if available
      if (req.user) {
        data.validator = {
          connect: { id: req.user.id }
        };
      }

      const labResult = await labResultService.create(data);
      res.status(201).json(labResult);
    } catch (error) {
      console.error('Create lab result error:', error);
      res.status(500).json({ error: 'Error creating lab result' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid lab result ID' });
      }

      const { patientId, encounterId, validatorId, takenAt, reportedAt, ...rest } = req.body;
      const data: any = { ...rest };
      
      // Convert date fields if present
      if (takenAt) data.takenAt = new Date(takenAt).toISOString();
      if (reportedAt) data.reportedAt = new Date(reportedAt).toISOString();
      
      // Handle relational fields
      if (patientId !== undefined) data.patient = { connect: { id: patientId } };
      if (encounterId !== undefined) data.encounter = { connect: { id: encounterId } };
      if (validatorId !== undefined) data.validator = { connect: { id: validatorId } };

      const labResult = await labResultService.update(id, data);
      res.json(labResult);
    } catch (error) {
      console.error('Update lab result error:', error);
      res.status(500).json({ error: 'Error updating lab result' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid lab result ID' });
      }

      await labResultService.delete(id);
      res.json({ message: 'Lab result deleted' });
    } catch (error) {
      console.error('Delete lab result error:', error);
      res.status(500).json({ error: 'Error deleting lab result' });
    }
  }
};
