import { Request, Response } from 'express';
import { insuranceService } from '../services/insurance.service';
import { InsuranceStatus } from '@prisma/client';
import { validateIdParam } from '../utils/validation';

export const insuranceController = {
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    const insurerId = req.query.insurerId ? parseInt(req.query.insurerId as string) : undefined;
    const status = req.query.status as InsuranceStatus | undefined;

    const skip = (page - 1) * limit;

    const options: any = {};
    if (patientId) options.patientId = patientId;
    if (insurerId) options.insurerId = insurerId;
    if (status) options.status = status;
    options.skip = skip;
    options.take = limit;

    const policies = await insuranceService.findAll(options);

    const countOptions: any = {};
    if (patientId) countOptions.patientId = patientId;
    if (insurerId) countOptions.insurerId = insurerId;
    if (status) countOptions.status = status;

    const total = await insuranceService.findAll(countOptions);
    const totalCount = total.length;

    res.json({
      policies,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  },

  async getById(req: Request, res: Response) {
    const validationError = validateIdParam(req.params.id!, 'insurance policy');
    if (validationError) {
      return res.status(validationError.status).json({ error: validationError.error });
    }
    
    const id = parseInt(req.params.id!);

    const policy = await insuranceService.findById(id);

    if (!policy) {
      return res.status(404).json({ error: 'Insurance policy not found' });
    }

    res.json(policy);
  },

  async create(req: Request, res: Response) {
    const { policyNumber, status, startDate, endDate, patientId, insurerId } = req.body;

    const data: any = {
      policyNumber,
      status,
      startDate: new Date(startDate).toISOString(),
      patient: { connect: { id: patientId } },
      insurer: { connect: { id: insurerId } },
    };

    if (endDate) {
      data.endDate = new Date(endDate).toISOString();
    }

    const policy = await insuranceService.create(data);

    res.status(201).json(policy);
  },

  async update(req: Request, res: Response) {
    const validationError = validateIdParam(req.params.id!, 'insurance policy');
    if (validationError) {
      return res.status(validationError.status).json({ error: validationError.error });
    }
    
    const id = parseInt(req.params.id!);

    const { policyNumber, status, startDate, endDate, patientId, insurerId } = req.body;

    const data: any = {};
    if (policyNumber !== undefined) data.policyNumber = policyNumber;
    if (status !== undefined) data.status = status;
    if (startDate !== undefined) data.startDate = new Date(startDate).toISOString();
    if (endDate !== undefined) data.endDate = new Date(endDate).toISOString();
    if (patientId !== undefined) data.patient = { connect: { id: patientId } };
    if (insurerId !== undefined) data.insurer = { connect: { id: insurerId } };

    const policy = await insuranceService.update(id, data);

    res.json(policy);
  },

  async delete(req: Request, res: Response) {
    const validationError = validateIdParam(req.params.id!, 'insurance policy');
    if (validationError) {
      return res.status(validationError.status).json({ error: validationError.error });
    }
    
    const id = parseInt(req.params.id!);

    await insuranceService.delete(id);

    res.json({ message: 'Insurance policy deleted' });
  },
};
