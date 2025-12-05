import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const allergyService = {
  async findAll(options: {
    patientId?: number;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.AllergyWhereInput = {};
    
    if (options.patientId) where.patientId = options.patientId;

    const [allergies, total] = await Promise.all([
      prisma.allergy.findMany({
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
        orderBy: { notedAt: 'desc' }
      }),
      prisma.allergy.count({ where })
    ]);

    return { allergies, total };
  },

  async findById(id: number) {
    return prisma.allergy.findUnique({
      where: { id },
      include: {
        patient: true
      }
    });
  },

  async create(data: Prisma.AllergyCreateInput) {
    return prisma.allergy.create({
      data,
      include: {
        patient: true
      }
    });
  },

  async update(id: number, data: Prisma.AllergyUpdateInput) {
    return prisma.allergy.update({
      where: { id },
      data,
      include: {
        patient: true
      }
    });
  },

  async delete(id: number) {
    return prisma.allergy.delete({ where: { id } });
  }
};
