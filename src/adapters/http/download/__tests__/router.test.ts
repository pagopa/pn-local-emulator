import express from 'express';
import supertest from 'supertest';
import { makeDownloadDocumentRouter } from '../router';
import { SystemEnv } from '../../../../useCases/SystemEnv';
import { makeTestSystemEnv } from '../../../../domain/__tests__/data';

const mockEnv: SystemEnv = makeTestSystemEnv();

jest.mock('../../../../../src/domain/DownloadRecord', () => ({
  makeDownloadRecord: jest.fn(() => (mockEnv: SystemEnv) => {
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

describe('Download Document Router', () => {
  const app = express();
  app.use(express.json());
  const router = makeDownloadDocumentRouter(mockEnv);
  app.use('/api', router);

  it('should return a 400 response when downloading a document', async () => {
    const response = await supertest(app).get('/api/download/someDocument.pdf');

    expect(response.status).toBe(500);
  });
});
