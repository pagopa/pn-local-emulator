import express from 'express';
import * as t from 'io-ts';
import { flow, pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { persistRecord } from '../../../useCases/PersistRecord';
import { makeRequestResponseRecord } from '../../../domain/RequestResponseRecord';

export const buildCurl = (req: express.Request): string => {
  const method = req.method;
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const headers = Object.entries(req.headers)
    .map(([key, value]) => `-H '${key}: ${value}'`)
    .join(' ');
  const requestBody = Object.keys(req.body).length !== 0 ? `-d '${JSON.stringify(req.body)}'` : '';
  return `curl -X ${method} '${url}' ${headers} ${requestBody}`;
};

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        requestCurl: t.success(buildCurl(req)),
        responseJson: t.success(''),
      }),
      E.map(flow(makeRequestResponseRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeListRequestResponseRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/get-curl', toExpressHandler(handler(env)));

  return router;
};
