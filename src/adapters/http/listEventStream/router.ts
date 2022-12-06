import express from 'express';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Problem from '../Problem';
import { ListEventStreamUseCase } from '../../../useCases/ListEventStreamUseCase';
import { Handler, toExpressHandler } from '../Handler';

const handler =
  (listEventStreamUseCase: ListEventStreamUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(listEventStreamUseCase),
      E.ap(t.string.decode(req.headers['x-api-key'])),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeListEventStreamRouter = (listEventStreamUseCase: ListEventStreamUseCase): express.Router => {
  const router = express.Router();

  router.get('/delivery-progresses/streams', toExpressHandler(handler(listEventStreamUseCase)));

  return router;
};
