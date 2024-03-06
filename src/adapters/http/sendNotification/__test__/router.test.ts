import express from 'express';
import supertest from 'supertest';
import * as data from '../../../../domain/__tests__/data';
import { makeSendNotificationRouter } from '../router';

describe('sendNotification router', () => {
  const app = express();
  app.use(express.json());
  const router = makeSendNotificationRouter(data.makeTestSystemEnv());
  app.use(router);

  it('With empty body response should be 400', async () => {
    const response = await supertest(app).post('/delivery/v2.3/requests').set('x-api-key', data.apiKey.valid).send();

    expect(response.statusCode).toStrictEqual(400);
  });
});
