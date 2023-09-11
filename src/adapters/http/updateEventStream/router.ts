import { flow, pipe } from 'fp-ts/function';
import * as Apply from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import * as t from 'io-ts';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import express from 'express';
import { traceWithValue } from 'fp-ts-std/Debug';
import { updateStreamRecordReturningOnlyTheOneUpdatedStream } from '../../../useCases/PersistRecord';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import * as Problem from '../Problem';
import { makeUpdateStreamRecord } from '../../../domain/UpdateStreamRecord';
import { StreamCreationRequest } from '../../../generated/streams/StreamCreationRequest';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        body: StreamCreationRequest.decode(req.body),
        streamId: t.string.decode(req.params.streamId),
      }),
      E.map(flow(makeUpdateStreamRecord(env), traceWithValue("aaa: "), updateStreamRecordReturningOnlyTheOneUpdatedStream(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(404).send(Problem.fromNumber(404))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeUpdateEventStreamRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.put('/delivery-progresses/streams/:streamId', toExpressHandler(handler(env)));

  return router;
};
