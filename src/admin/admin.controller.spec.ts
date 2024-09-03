import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockAdminService = {
      getBestProfession: jest.fn(),
      getBestClients: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBestProfession', () => {
    it('should return the best profession with total earnings', async () => {
      const start = '2023-01-01';
      const end = '2023-12-31';
      const mockResult = {
        profession: 'Software Developer',
        totalEarnings: 1000,
      };

      jest.spyOn(service, 'getBestProfession').mockResolvedValue(mockResult);

      const result = await controller.getBestProfession(start, end);

      expect(result).toEqual(mockResult);
      expect(service.getBestProfession).toHaveBeenCalledWith(start, end);
    });
  });

  describe('getBestClients', () => {
    it('should return the best clients with total paid amounts', async () => {
      const start = '2023-01-01';
      const end = '2023-12-31';
      const limit = 2;
      const mockResult = [
        { clientId: 1, totalPaid: 500 },
        { clientId: 2, totalPaid: 300 },
      ];

      jest.spyOn(service, 'getBestClients').mockResolvedValue(mockResult);

      const result = await controller.getBestClients(start, end, limit);

      expect(result).toEqual(mockResult);
      expect(service.getBestClients).toHaveBeenCalledWith(start, end, limit);
    });

    it('should use default limit value if not provided', async () => {
      const start = '2023-01-01';
      const end = '2023-12-31';
      const mockResult = [
        { clientId: 1, totalPaid: 500 },
        { clientId: 2, totalPaid: 300 },
      ];

      jest.spyOn(service, 'getBestClients').mockResolvedValue(mockResult);

      const result = await controller.getBestClients(start, end);

      expect(result).toEqual(mockResult);
      expect(service.getBestClients).toHaveBeenCalledWith(start, end, 2);
    });
  });
});
