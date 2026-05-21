import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { EventSchedulingService } from './event-scheduling.service';

const mockRemove = jest.fn();
const mockQueueAdd = jest.fn();
const mockQueueGetDelayed = jest.fn();

const mockQueue = {
  add: mockQueueAdd,
  getDelayed: mockQueueGetDelayed,
};

describe('EventSchedulingService', () => {
  let service: EventSchedulingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventSchedulingService,
        { provide: getQueueToken('event-publishing'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<EventSchedulingService>(EventSchedulingService);
    jest.clearAllMocks();
  });

  describe('scheduleEventUnpublication', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);

    it('debe encolar unpublish-event-job sin jobId personalizado', async () => {
      mockQueueGetDelayed.mockResolvedValue([]);
      mockQueueAdd.mockResolvedValue({});

      await service.scheduleEventUnpublication(29, futureDate);

      expect(mockQueueAdd).toHaveBeenCalledWith(
        'unpublish-event-job',
        { eventId: 29 },
        expect.not.objectContaining({ jobId: expect.anything() }),
      );
    });

    it('debe lanzar BadRequestException si la fecha ya pasó sin tocar la cola', async () => {
      const pastDate = new Date(Date.now() - 1000);

      await expect(service.scheduleEventUnpublication(29, pastDate)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueueGetDelayed).not.toHaveBeenCalled();
      expect(mockQueueAdd).not.toHaveBeenCalled();
    });
  });

  describe('scheduleEventPublication', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);

    it('debe encolar publish-event-job sin jobId personalizado', async () => {
      mockQueueGetDelayed.mockResolvedValue([]);
      mockQueueAdd.mockResolvedValue({});

      await service.scheduleEventPublication(5, futureDate);

      expect(mockQueueAdd).toHaveBeenCalledWith(
        'publish-event-job',
        { eventId: 5 },
        expect.not.objectContaining({ jobId: expect.anything() }),
      );
    });

    it('debe lanzar BadRequestException si la fecha ya pasó', async () => {
      const pastDate = new Date(Date.now() - 1000);

      await expect(service.scheduleEventPublication(5, pastDate)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueueAdd).not.toHaveBeenCalled();
    });
  });
});
