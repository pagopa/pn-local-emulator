import express from 'express';
import supertest from 'supertest';
import { makeConsumeEventStreamRouter } from '../router'; // Update with the actual file path
import { SystemEnv } from '../../../../useCases/SystemEnv';
import { makeTestSystemEnv } from '../../../../domain/__tests__/data';
import { persistRecord } from '../../../../useCases/PersistRecord';

const mockEnv: SystemEnv = makeTestSystemEnv();

jest.mock('../../../../../src/domain/ConsumeEventStreamRecord', () => ({
  makeConsumeEventStreamRecord: jest.fn(() => (mockEnv: SystemEnv) => {
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

describe('Consume Event Stream Router', () => {
  const app = express();
  app.use(express.json());
  const router = makeConsumeEventStreamRouter(mockEnv);
  app.use('/api', router);

  it('should return a 400 response with some data', async () => {
    const response = await supertest(app)
      .get('/api/delivery-progresses/v2.3/streams/someStreamId/events')
      .query({
        lastEventId: '123',
      });

    expect(response.status).toBe(400);
  });
});
