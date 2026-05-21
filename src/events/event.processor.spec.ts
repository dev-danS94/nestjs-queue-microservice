import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventProcessor } from './event.processor';

const BACKEND_URL = 'http://localhost:4000';

const mockConfigService = {
  get: jest.fn().mockReturnValue(BACKEND_URL),
};

const mockFetchOk = () =>
  Promise.resolve({ ok: true, status: 200 } as Response);

const mockFetchFail = (status: number) =>
  Promise.resolve({ ok: false, status } as Response);

const makeJob = (name: string, data: object) =>
  ({ id: '1', name, data, attemptsMade: 0 }) as any;

describe('EventProcessor', () => {
  let processor: EventProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventProcessor,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    processor = module.get<EventProcessor>(EventProcessor);
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation(mockFetchOk);
  });

  describe('publish-event-job', () => {
    it('llama al webhook correcto con el eventId', async () => {
      await processor.process(makeJob('publish-event-job', { eventId: 5 }));

      expect(global.fetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/api/queue-service/events/publish`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: 5 }),
        }),
      );
    });

    it('devuelve { status: completado, eventId }', async () => {
      const result = await processor.process(makeJob('publish-event-job', { eventId: 5 }));
      expect(result).toEqual({ status: 'completado', eventId: 5 });
    });

    it('lanza error si el webhook responde con status no-ok', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => mockFetchFail(503));

      await expect(
        processor.process(makeJob('publish-event-job', { eventId: 5 })),
      ).rejects.toThrow('Webhook failed [503]');
    });
  });

  describe('unpublish-event-job', () => {
    it('llama al webhook correcto con el eventId', async () => {
      await processor.process(makeJob('unpublish-event-job', { eventId: 29 }));

      expect(global.fetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/api/queue-service/events/unpublish`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ eventId: 29 }),
        }),
      );
    });

    it('lanza error si el webhook responde 404', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => mockFetchFail(404));

      await expect(
        processor.process(makeJob('unpublish-event-job', { eventId: 29 })),
      ).rejects.toThrow('Webhook failed [404]');
    });
  });

  describe('job desconocido', () => {
    it('lanza error para job name no reconocido', async () => {
      await expect(
        processor.process(makeJob('otro-job', { eventId: 1 })),
      ).rejects.toThrow('Tipo de job desconocido: otro-job');
    });
  });

  describe('BACKEND_URL no configurado', () => {
    it('construye una URL con undefined si BACKEND_URL no está en .env', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined);
      (global.fetch as jest.Mock).mockImplementation(mockFetchOk);

      await processor.process(makeJob('publish-event-job', { eventId: 1 }));

      expect(global.fetch).toHaveBeenCalledWith(
        'undefined/api/queue-service/events/publish',
        expect.anything(),
      );
    });
  });
});
