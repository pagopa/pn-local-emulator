import express from 'express';
import supertest from 'supertest';
import { makeDeleteEventStreamRouter } from '../router';
import { SystemEnv } from '../../../../useCases/SystemEnv';
import { makeTestSystemEnv } from '../../../../domain/__tests__/data';

const mockEnv: SystemEnv = makeTestSystemEnv();

jest.mock('../../../../../src/domain/CheckNotificationStatusRecord', () => ({
  makeDeleteStreamRecord: jest.fn(() => (mockEnv: SystemEnv) => {
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

describe('Delete Event Stream Router', () => {
  const app = express();
  app.use(express.json());
  const router = makeDeleteEventStreamRouter(mockEnv);
  app.use('/api', router);

  it('should return a 500 response with some data', async () => {
    const response = await supertest(app)
      .delete('/api/delivery-progresses/v2.3/streams/123')

    expect(response.status).toBe(500);
  });
});
