import express from 'express';
import supertest from 'supertest';
import { makePreLoadRouter } from '../router';
import * as data from '../../../../domain/__tests__/data';

describe('PreLoad router', () => {
  const app = express();
  app.use(express.json());
  const router = makePreLoadRouter(data.makeTestSystemEnv());
  app.use(router);

  it('With empty body response should be 400', async () => {
    const response = await supertest(app)
      .post('/delivery/attachments/preload')
      .set('x-api-key', data.apiKey.valid)
      .send();

    expect(response.statusCode).toStrictEqual(400);
  });
});
