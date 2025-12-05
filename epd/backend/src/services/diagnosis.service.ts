import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const diagnosisService = {
  async findAll(options: {
    patientId?: number;
    encounterId?: number;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.DiagnosisWhereInput = {};
    
    if (options.patientId) where.patientId = options.patientId;
    if (options.encounterId) where.encounterId = options.encounterId;

    const [diagnoses, total] = await Promise.all([
      prisma.diagnosis.findMany({
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
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.diagnosis.count({ where })
    ]);

    return { diagnoses, total };
  },

  async findById(id: number) {
    return prisma.diagnosis.findUnique({
      where: { id },
      include: {
        patient: true,
        encounter: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async create(data: Prisma.DiagnosisCreateInput) {
    return prisma.diagnosis.create({
      data,
      include: {
        patient: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async update(id: number, data: Prisma.DiagnosisUpdateInput) {
    return prisma.diagnosis.update({
      where: { id },
      data,
      include: {
        patient: true,
        author: {
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
    return prisma.diagnosis.delete({ where: { id } });
  }
};
