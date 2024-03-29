import express from 'express';
import supertest from 'supertest';
import { makeChecklistRouter } from '../router';
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

describe('Checklist Result Router', () => {
  const app = express();
  app.use(express.json());
  const router = makeChecklistRouter(mockEnv);
  app.use('/api', router);

  it('should return a 200 response with some data', async () => {
    const response = await supertest(app).get('/api/checklistresult').query({
      notificationRequestId: '123',
    });

    expect(response.status).toBe(200);
  });
});
