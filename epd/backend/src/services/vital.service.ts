import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const vitalService = {
  async findAll(options: {
    patientId?: number;
    type?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.VitalSignWhereInput = {};
    
    if (options.patientId) where.patientId = options.patientId;
    if (options.type) where.type = options.type as any;

    const [vitals, total] = await Promise.all([
      prisma.vitalSign.findMany({
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
          }
        },
        orderBy: { measuredAt: 'desc' }
      }),
      prisma.vitalSign.count({ where })
    ]);

    return { vitals, total };
  },

  async findById(id: number) {
    return prisma.vitalSign.findUnique({
      where: { id },
      include: {
        patient: true
      }
    });
  },

  async create(data: Prisma.VitalSignCreateInput) {
    return prisma.vitalSign.create({
      data,
      include: {
        patient: true
      }
    });
  },

  async update(id: number, data: Prisma.VitalSignUpdateInput) {
    return prisma.vitalSign.update({
      where: { id },
      data,
      include: {
        patient: true
      }
    });
  },

  async delete(id: number) {
    return prisma.vitalSign.delete({ where: { id } });
  }
};
