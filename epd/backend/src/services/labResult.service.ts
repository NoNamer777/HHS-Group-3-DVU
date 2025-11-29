import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const labResultService = {
  async findAll(options: {
    patientId?: number;
    encounterId?: number;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.LabResultWhereInput = {};
    
    if (options.patientId) where.patientId = options.patientId;
    if (options.encounterId) where.encounterId = options.encounterId;
    if (options.status) where.status = options.status as any;

    const [labResults, total] = await Promise.all([
      prisma.labResult.findMany({
        where,
        ...(options.skip && { skip: options.skip }),
        ...(options.take && { take: options.take }),
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          },
          encounter: {
            select: {
              id: true,
              type: true,
              status: true
            }
          },
          validator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { reportedAt: 'desc' }
      }),
      prisma.labResult.count({ where })
    ]);

    return { labResults, total };
  },

  async findById(id: number) {
    return prisma.labResult.findUnique({
      where: { id },
      include: {
        patient: true,
        encounter: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async create(data: Prisma.LabResultCreateInput) {
    return prisma.labResult.create({
      data,
      include: {
        patient: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async update(id: number, data: Prisma.LabResultUpdateInput) {
    return prisma.labResult.update({
      where: { id },
      data,
      include: {
        patient: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async delete(id: number) {
    return prisma.labResult.delete({ where: { id } });
  }
};
