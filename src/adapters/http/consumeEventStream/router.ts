import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';
import { ConsumeEventStreamUseCase } from '../../../useCases/ConsumeEventStreamUseCase';

export const consumeEventStreamHandler =
  (consumeEventStreamUseCase: ConsumeEventStreamUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(consumeEventStreamUseCase),
      E.ap(t.string.decode(req.headers['x-api-key'])),
      E.ap(t.string.decode(req.params.streamId)),
      E.ap(t.union([t.string, t.undefined]).decode(req.query.lastEventId)),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeConsumeEventStreamRouter = (consumeEventStreamUseCase: ConsumeEventStreamUseCase): express.Router => {
  const router = express.Router();

  router.get(
    '/delivery-progresses/streams/:streamId/events',
    toExpressHandler(consumeEventStreamHandler(consumeEventStreamUseCase))
  );

  return router;
};
