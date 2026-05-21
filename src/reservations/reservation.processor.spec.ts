import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ReservationProcessor } from './reservation.processor';

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

describe('ReservationProcessor', () => {
  let processor: ReservationProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationProcessor,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    processor = module.get<ReservationProcessor>(ReservationProcessor);
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation(mockFetchOk);
  });

  describe('cancel-reservation-job', () => {
    it('llama al webhook correcto con el reservationId', async () => {
      await processor.process(makeJob('cancel-reservation-job', { reservationId: 42 }));

      expect(global.fetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/api/queue-service/reservations/cancel`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: 42 }),
        }),
      );
    });

    it('devuelve { status: completado, reservationId }', async () => {
      const result = await processor.process(makeJob('cancel-reservation-job', { reservationId: 42 }));
      expect(result).toEqual({ status: 'completado', reservationId: 42 });
    });

    it('lanza error si el webhook responde con status no-ok', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => mockFetchFail(503));

      await expect(
        processor.process(makeJob('cancel-reservation-job', { reservationId: 42 })),
      ).rejects.toThrow('Webhook failed [503]');
    });

    it('lanza error si el webhook responde 404', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => mockFetchFail(404));

      await expect(
        processor.process(makeJob('cancel-reservation-job', { reservationId: 42 })),
      ).rejects.toThrow('Webhook failed [404]');
    });
  });

  describe('job desconocido', () => {
    it('lanza error para job name no reconocido', async () => {
      await expect(
        processor.process(makeJob('otro-job', { reservationId: 1 })),
      ).rejects.toThrow('Tipo de job desconocido: otro-job');
    });
  });
});
