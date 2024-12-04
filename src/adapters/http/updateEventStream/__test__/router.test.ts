import express from 'express';
import supertest from 'supertest';
import * as data from '../../../../domain/__tests__/data';
import { makeUpdateEventStreamRouter } from '../router';

describe("sendNotification router", () => {

    const app = express();
    app.use(express.json());
    const router = makeUpdateEventStreamRouter(data.makeTestSystemEnv());
    app.use(router);

    it("With empty body response should be 404", async () => {
        const response = await supertest(app)
            .post('/delivery/v2.4/requests')
            .set('x-api-key', data.apiKey.valid)
            .send();

        expect(response.statusCode).toStrictEqual(404);
    });

});