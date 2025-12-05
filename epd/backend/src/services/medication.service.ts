import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const medicationService = {
  async findAll(options: {
    patientId?: number;
    encounterId?: number;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.MedicationOrderWhereInput = {};
    
    if (options.patientId) where.patientId = options.patientId;
    if (options.encounterId) where.encounterId = options.encounterId;
    if (options.status) where.status = options.status as any;

    const [medications, total] = await Promise.all([
      prisma.medicationOrder.findMany({
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
          prescriber: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.medicationOrder.count({ where })
    ]);

    return { medications, total };
  },

  async findById(id: number) {
    return prisma.medicationOrder.findUnique({
      where: { id },
      include: {
        patient: true,
        encounter: true,
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async create(data: Prisma.MedicationOrderCreateInput) {
    return prisma.medicationOrder.create({
      data,
      include: {
        patient: true,
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async update(id: number, data: Prisma.MedicationOrderUpdateInput) {
    return prisma.medicationOrder.update({
      where: { id },
      data,
      include: {
        patient: true,
        prescriber: {
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
    return prisma.medicationOrder.delete({ where: { id } });
  }
};
