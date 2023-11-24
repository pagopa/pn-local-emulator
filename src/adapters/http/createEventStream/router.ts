import express from 'express';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import { constant, flow } from 'fp-ts/lib/function';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { StreamCreationRequest } from '../../../generated/pnapi/StreamCreationRequest';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { makeCreateEventStreamRecord } from '../../../domain/CreateEventStreamRecord';
import { persistRecord } from '../../../useCases/PersistRecord';

// TODO: Try to use generated responseType
const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        body: StreamCreationRequest.decode(req.body),
      }),
      E.map(flow(makeCreateEventStreamRecord(env), constant, persistRecord(env))),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeCreateEventStreamRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.post('/delivery-progresses/streams', toExpressHandler(handler(env)));

  return router;
};
