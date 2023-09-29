import express from 'express';
import supertest from 'supertest';
import { makeUploadToS3Router } from '../router';
import { SystemEnv } from '../../../../useCases/SystemEnv';
import { makeTestSystemEnv } from '../../../../domain/__tests__/data';

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

describe('Upload to S3', () => {
  const app = express();
  app.use(express.json());
  const router = makeUploadToS3Router(mockEnv);
  app.use('/api', router);

  it('should return a 404 response with some data', async () => {
    const response = await supertest(app).get('/api/uploadS3/1A').query({
      lastEventId: '123',
    });

    expect(response.status).toBe(404);
  });
});

import crypto from 'crypto';

import { computeSha256 } from '../router';

describe('computeSha256', () => {
  it('should compute the SHA-256 hash of a buffer', () => {
    const testData = Buffer.from('Hello, World!', 'utf-8');
    const expectedHash = crypto.createHash('sha256').update(testData).digest('base64');
    const actualHash = computeSha256(testData);
    expect(actualHash).toEqual(expectedHash);
  });

  it('should handle empty input', () => {
    const testData = Buffer.from('');
    const expectedHash = crypto.createHash('sha256').update(testData).digest('base64');
    const actualHash = computeSha256(testData);
    expect(actualHash).toEqual(expectedHash);
  });
});
