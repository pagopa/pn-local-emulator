import express from 'express';
import supertest from 'supertest';
import { makeCreateEventStreamRouter } from '../router';
import { SystemEnv } from '../../../../useCases/SystemEnv';
import { makeTestSystemEnv } from '../../../../domain/__tests__/data';

const mockEnv: SystemEnv = makeTestSystemEnv();

jest.mock('../../../../../src/domain/CreateEventStreamRecord', () => ({
  makeCreateEventStreamRecord: jest.fn(() => (mockEnv: SystemEnv) => {
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

describe('Create Event Stream Router', () => {
  const app = express();
  app.use(express.json());
  const router = makeCreateEventStreamRouter(mockEnv);
  app.use('/api', router);

  it('should return a 400 response with some data', async () => {
    const response = await supertest(app)
      .post('/api/delivery-progresses/v2.3/streams')
      .send({});

    expect(response.status).toBe(400);
  });
});
