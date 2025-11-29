import { prisma } from '../lib/prisma';
import { Prisma, PatientStatus } from '@prisma/client';

export const patientService = {
  async findAll(filters?: { status?: PatientStatus; search?: string; skip?: number; take?: number }) {
    const where: Prisma.PatientWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { hospitalNumber: { contains: filters.search } },
        { email: { contains: filters.search } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        ...(filters?.skip !== undefined && { skip: filters.skip }),
        ...(filters?.take !== undefined && { take: filters.take }),
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ]);

    return { patients, total };
  },

  async findById(id: number) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        encounters: {
          orderBy: { start: 'desc' },
          take: 5
        },
        diagnoses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        allergies: true,
        insurancePolicies: {
          include: {
            insurer: true
          }
        }
      }
    });
  },

  async findByHospitalNumber(hospitalNumber: string) {
    return prisma.patient.findUnique({
      where: { hospitalNumber }
    });
  },

  async create(data: Prisma.PatientCreateInput) {
    return prisma.patient.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  },

  async update(id: number, data: Prisma.PatientUpdateInput) {
    return prisma.patient.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  },

  async delete(id: number) {
    return prisma.patient.delete({ where: { id } });
  }
};
