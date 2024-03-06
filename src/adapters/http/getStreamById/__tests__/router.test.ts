import express from 'express';
import supertest from 'supertest';
import { makeGetEventStreamByIdRouter } from '../router';
import { SystemEnv } from '../../../../useCases/SystemEnv';
import { makeTestSystemEnv } from '../../../../domain/__tests__/data';

const mockEnv: SystemEnv = makeTestSystemEnv();

jest.mock('../../../../../src/domain/CheckNotificationStatusRecord', () => ({
    makeCheckNotificationStatusRecord: jest.fn(() => (mockEnv: SystemEnv) => {
      return {
        output: {
          statusCode: 200,
          returned: 'Some response',
        },
      };
    }),
  }));
  

jest.mock('../../../../../src/useCases/PersistRecord', () => ({
  persistRecord: jest.fn(),
}));

describe('Get Stream By Id Router', () => {
  const app = express();
  app.use(express.json());
  const router = makeGetEventStreamByIdRouter(mockEnv);
  app.use('/api', router);

  it('should return a 400 response with some data', async () => {
    const response = await supertest(app)
      .get('/api/delivery-progresses/streams/1A')
      .query({
        notificationRequestId: '123',
      });

    expect(response.status).toBe(400);
  });
});
