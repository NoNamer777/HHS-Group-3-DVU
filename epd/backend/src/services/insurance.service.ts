import { prisma } from '../lib/prisma';
import { InsuranceStatus } from '@prisma/client';

interface PaginationOptions {
  skip?: number;
  take?: number;
}

interface FindAllOptions extends PaginationOptions {
  patientId?: number;
  insurerId?: number;
  status?: InsuranceStatus;
}

export const insuranceService = {
  async findAll(options: FindAllOptions = {}) {
    const { patientId, insurerId, status, skip, take } = options;
    
    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (insurerId) where.insurerId = insurerId;
    if (status) where.status = status;

    const policies = await prisma.insurancePolicy.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sex: true,
            dateOfBirth: true,
          },
        },
        insurer: {
          select: {
            id: true,
            name: true,
            code: true,
            phone: true,
            email: true,
            website: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
      ...(skip && { skip }),
      ...(take && { take }),
    });

    return policies;
  },

  async findById(id: number) {
    return await prisma.insurancePolicy.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sex: true,
            dateOfBirth: true,
            hospitalNumber: true,
          },
        },
        insurer: {
          select: {
            id: true,
            name: true,
            code: true,
            phone: true,
            email: true,
            website: true,
            address: true,
          },
        },
      },
    });
  },

  async create(data: any) {
    return await prisma.insurancePolicy.create({
      data,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sex: true,
            dateOfBirth: true,
          },
        },
        insurer: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  },

  async update(id: number, data: any) {
    return await prisma.insurancePolicy.update({
      where: { id },
      data,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sex: true,
            dateOfBirth: true,
          },
        },
        insurer: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  },

  async delete(id: number) {
    return await prisma.insurancePolicy.delete({
      where: { id },
    });
  },
};
