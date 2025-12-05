import { Response } from 'express';
import { AuthRequest } from '../types';
import { patientService } from '../services/patient.service';
import { PatientStatus } from '@prisma/client';

export const patientController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const status = req.query.status as PatientStatus | undefined;
      const search = req.query.search as string | undefined;

      const { patients, total } = await patientService.findAll({
        ...(status && { status }),
        ...(search && { search }),
        skip,
        take: limit
      });

      res.json({
        patients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({ error: 'Error fetching patients' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const patient = await patientService.findById(id);

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json(patient);
    } catch (error) {
      console.error('Get patient error:', error);
      res.status(500).json({ error: 'Error fetching patient' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      
      // Convert dateOfBirth to ISO DateTime if it's just a date
      if (data.dateOfBirth && !data.dateOfBirth.includes('T')) {
        data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
      }
      
      // Check if hospital number already exists
      if (data.hospitalNumber) {
        const existing = await patientService.findByHospitalNumber(data.hospitalNumber);
        if (existing) {
          return res.status(400).json({ error: 'Hospital number already exists' });
        }
      }

      // Link to current user if available
      if (req.user) {
        data.createdBy = {
          connect: { id: req.user.id }
        };
      }

      const patient = await patientService.create(data);
      res.status(201).json(patient);
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({ error: 'Error creating patient' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const data = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      const patient = await patientService.update(id, data);
      res.json(patient);
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({ error: 'Error updating patient' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      await patientService.delete(id);
      res.json({ message: 'Patient deleted' });
    } catch (error) {
      console.error('Delete patient error:', error);
      res.status(500).json({ error: 'Error deleting patient' });
    }
  }
};
