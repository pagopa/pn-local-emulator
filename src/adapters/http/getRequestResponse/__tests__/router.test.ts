import { getMockReq } from '@jest-mock/express';
import { buildCurl } from '../router';
import express from 'express';

describe('buildCurl', () => {
  it('Should build curl correctly with body', () => {
    const expected =
      "curl -X GET 'http://localhost:3000/api/some-endpoint' -H 'host: localhost:3000' -H 'Content-Type: application/json' -d '{\"key\":\"value\"}'";

    const req = getMockReq({
      method: 'GET',
      protocol: 'http',
      originalUrl: '/api/some-endpoint',
      headers: {
        host: 'localhost:3000',
        'Content-Type': 'application/json',
      },
      body: { key: 'value' },
    });
    req.get = (headerName: string) => req.headers[headerName] as any;
    const ric = req as express.Request;

    const actual = buildCurl(ric);

    expect(actual).toStrictEqual(expected);
  });

  it('Should build curl correctly without body', () => {
    const expected =
      "curl -X GET 'http://localhost:3000/api/some-endpoint' -H 'host: localhost:3000' -H 'Content-Type: application/json' ";

    const req = getMockReq({
      method: 'GET',
      protocol: 'http',
      originalUrl: '/api/some-endpoint',
      headers: {
        host: 'localhost:3000',
        'Content-Type': 'application/json',
      },
      body: undefined,
    });
    req.get = (headerName: string) => req.headers[headerName] as any;
    const ric = req as express.Request;

    const actual = buildCurl(ric);

    expect(actual).toStrictEqual(expected);
  });
});
