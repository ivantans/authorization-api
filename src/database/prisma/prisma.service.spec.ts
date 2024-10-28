import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should connect to the database', async () => {
    await expect(service.$connect()).resolves.not.toThrow();
  });
  it('should perform a basic database operation', async () => {
    // Testing sederhana untuk membuat dan mencari Employee
    try {
      // Buat data Employee
      const createdEmployee = await service.employee.create({
        data: {
          email: 'testemployee@example.com',
          password: 'password123',
        },
      });

      // Pastikan Employee berhasil dibuat
      expect(createdEmployee).toBeDefined();
      expect(createdEmployee.email).toEqual('testemployee@example.com');

      // Cari Employee yang dibuat
      const foundEmployee = await service.employee.findUnique({
        where: { email: 'testemployee@example.com' },
      });

      // Pastikan Employee ditemukan dan datanya benar
      expect(foundEmployee).toBeDefined();
      expect(foundEmployee?.email).toEqual('testemployee@example.com');
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error('Prisma Error:', error.message);
      } else {
        console.error('Unexpected Error:', error);
      }
      throw error;
    } finally {
      // Hapus data setelah pengujian untuk menjaga database tetap bersih
      await service.employee.deleteMany({
        where: { email: 'testemployee@example.com' },
      });
    }
  });
});
