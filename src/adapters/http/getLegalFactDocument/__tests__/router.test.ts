import express from 'express';
import supertest from 'supertest';
import { makeTestSystemEnv } from '../../../../domain/__tests__/data';
import { SystemEnv } from '../../../../useCases/SystemEnv';
import { makeGetLegalFactDocumentRouter } from '../router';

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

describe('Get Legal Fact Document Router', () => {
  const app = express();
  app.use(express.json());
  const router = makeGetLegalFactDocumentRouter(mockEnv);
  app.use('/api', router);

  it('should return a 400 response with some data', async () => {
    const response = await supertest(app)
      .get('/api/delivery-push/:iun/legal-facts/1A')
      .query({
        notificationRequestId: '123',
      });

    expect(response.status).toBe(400);
  });
});
