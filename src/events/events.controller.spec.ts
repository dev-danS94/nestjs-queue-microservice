import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventSchedulingService } from './event-scheduling.service';

const mockEventSchedulingService = {
  scheduleEventPublication: jest.fn(),
  scheduleEventUnpublication: jest.fn(),
};

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventSchedulingService, useValue: mockEventSchedulingService },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });

  describe('POST /events/schedule/unpublish', () => {
    const dto = {
      evento_id: 29,
      fecha_despublicacion: '2025-10-31T21:33:00.000Z',
    };

    it('debe retornar success true con el mensaje de confirmación', async () => {
      mockEventSchedulingService.scheduleEventUnpublication.mockResolvedValue(undefined);

      const result = await controller.scheduleEventUnpublication(dto);

      expect(result).toEqual({
        success: true,
        message: `Evento 29 agendado para despublicarse el 2025-10-31T21:33:00.000Z`,
      });
    });

    it('debe llamar al service con el id y la fecha convertida a Date', async () => {
      mockEventSchedulingService.scheduleEventUnpublication.mockResolvedValue(undefined);

      await controller.scheduleEventUnpublication(dto);

      expect(mockEventSchedulingService.scheduleEventUnpublication).toHaveBeenCalledWith(
        29,
        new Date('2025-10-31T21:33:00.000Z'),
      );
      expect(mockEventSchedulingService.scheduleEventUnpublication).toHaveBeenCalledTimes(1);
    });

    it('debe propagar errores del service', async () => {
      mockEventSchedulingService.scheduleEventUnpublication.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(controller.scheduleEventUnpublication(dto)).rejects.toThrow(
        'Redis connection failed',
      );
    });
  });
});
