import { Response } from 'express';
import { AuthRequest } from '../types';
import { appointmentService } from '../services/appointment.service';
import { validateIdParam } from '../utils/validation';

export const appointmentController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const clinicianId = req.query.clinicianId ? parseInt(req.query.clinicianId as string) : undefined;
      const status = req.query.status as string | undefined;

      const { appointments, total } = await appointmentService.findAll({
        ...(patientId && { patientId }),
        ...(clinicianId && { clinicianId }),
        ...(status && { status }),
        skip,
        take: limit
      });

      res.json({
        appointments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ error: 'Error fetching appointments' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const appointment = await appointmentService.findById(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json(appointment);
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ error: 'Error fetching appointment' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { patientId, clinicianId, start, end, location, reason, status } = req.body;

      const data: any = {
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        patient: {
          connect: { id: patientId }
        }
      };

      if (location) data.location = location;
      if (reason) data.reason = reason;
      if (status) data.status = status;
      
      if (clinicianId) {
        data.clinician = {
          connect: { id: clinicianId }
        };
      } else if (req.user) {
        // Auto-assign to current user if no clinician specified
        data.clinician = {
          connect: { id: req.user.id }
        };
      }

      const appointment = await appointmentService.create(data);
      res.status(201).json(appointment);
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ error: 'Error creating appointment' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const validationError = validateIdParam(req.params.id!, 'appointment');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }
      
      const id = parseInt(req.params.id!);

      const { patientId, clinicianId, start, end, ...rest } = req.body;
      const data: any = { ...rest };
      
      // Convert date fields if present
      if (start) data.start = new Date(start).toISOString();
      if (end) data.end = new Date(end).toISOString();
      
      // Handle relational fields
      if (patientId !== undefined) data.patient = { connect: { id: patientId } };
      if (clinicianId !== undefined) data.clinician = { connect: { id: clinicianId } };

      const appointment = await appointmentService.update(id, data);
      res.json(appointment);
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Error updating appointment' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const validationError = validateIdParam(req.params.id!, 'appointment');
      if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
      }
      
      const id = parseInt(req.params.id!);

      await appointmentService.delete(id);
      res.json({ message: 'Appointment deleted' });
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({ error: 'Error deleting appointment' });
    }
  }
};
