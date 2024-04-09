import express from 'express';
import supertest from 'supertest';
import * as data from '../../../../domain/__tests__/data';
import { makeListEventStreamRouter } from '../router';

describe("ListEventStream router", () => {

    const app = express();
    app.use(express.json());
    const router = makeListEventStreamRouter(data.makeTestSystemEnv());
    app.use(router);

    it("With empty body response should be 404", async () => {
        const response = await supertest(app)
                        .post('/delivery-progresses/v2.3/streams')
                        .set('x-api-key', data.apiKey.valid)
                        .send();

        expect(response.statusCode).toStrictEqual(404);
    });

});