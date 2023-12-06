import express from 'express';
import * as Apply from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { flow, pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import { makeUpdateStreamRecord } from '../../../domain/UpdateStreamRecord';
import { StreamCreationRequest } from '../../../generated/pnapi/StreamCreationRequest';
import { updateStreamRecordReturningOnlyTheOneUpdatedStream } from '../../../useCases/PersistRecord';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';

const handler =
  (env: SystemEnv): Handler =>
    (req, res) =>
      pipe(
        Apply.sequenceS(E.Apply)({
          apiKey: t.string.decode(req.headers['x-api-key']),
          body: StreamCreationRequest.decode(req.body),
          streamId: t.string.decode(req.params.streamId),
        }),
        E.map(flow(makeUpdateStreamRecord(env), updateStreamRecordReturningOnlyTheOneUpdatedStream(env))),
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
