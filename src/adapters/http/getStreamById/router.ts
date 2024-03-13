import { flow, pipe } from 'fp-ts/function';
import * as Apply from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import * as t from 'io-ts';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import express from 'express';
import { persistRecord } from '../../../useCases/PersistRecord';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { makeGetEventStreamByIdRecord } from '../../../domain/GetEventStreamByIdRecord';
import * as Problem from '../Problem';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        streamId: t.string.decode(req.params.streamId),
      }),
      E.map(flow(makeGetEventStreamByIdRecord(env), persistRecord(env))),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeGetEventStreamByIdRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery-progresses/2.3/streams/:streamId', toExpressHandler(handler(env)));

  return router;
};
