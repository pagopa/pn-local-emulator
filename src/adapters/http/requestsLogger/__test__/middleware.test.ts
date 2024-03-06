/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMockReq, getMockRes } from '@jest-mock/express';
import express from 'express';
import * as data from '../../../../domain/__tests__/data';
import { middleware } from '../middleware';

/* Mocking the value of capturedResponse */
const mockCapturedResponse = jest.fn();
jest.mock('../../application', () => ({
    get capturedResponse() {
        return mockCapturedResponse();
    },
}));

describe("middleware", () => {

    const req = getMockReq({
        method: 'GET',
        protocol: 'http',
        originalUrl: '/uploadS3/api/some-endpoint',
        url: '/uploadS3/api/some-endpoint',
        headers: {
            host: 'localhost:3000',
            'Content-Type': 'application/json',
            "x-api-key": data.apiKey.valid,
        },
        body: { key: 'value' },
    });
    req.get = (headerName: string) => req.headers[headerName] as any;
    const ric = req as express.Request;
    const {res} = getMockRes({
        statusCode: 200
    });
    res.getHeader = (headername: string) => {
        if(headername === "x-amz-version-id"){
            return "headerTest";
        }
    };

    const next = jest.fn();

    it('All values passed are valid', async () => {
        mockCapturedResponse.mockReturnValue("this is a test");
    
        await middleware(data.makeTestSystemEnv())(ric, res, next);

        // Status code should not have changed
        expect(res.statusCode).toEqual(200);
      });


      it('Some values are not valid', async () => {
        mockCapturedResponse.mockReturnValue(1337);     // CapturedResponse should be a string
    
        await middleware(data.makeTestSystemEnv())(ric, res, next);

        // Status code should not have changed
        expect(res.statusCode).toEqual(200);
      });

});