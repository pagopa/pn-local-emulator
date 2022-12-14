import express from 'express';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Problem from '../Problem';
import { CreateEventStreamUseCase } from '../../../useCases/CreateEventStreamUseCase';
import { Handler, toExpressHandler } from '../Handler';
import { StreamCreationRequest } from '../../../generated/streams/StreamCreationRequest';

// TODO: Try to use generated responseType
const handler =
  (createEventStreamUseCase: CreateEventStreamUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(createEventStreamUseCase),
      E.ap(t.string.decode(req.headers['x-api-key'])),
      E.ap(StreamCreationRequest.decode(req.body)),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeCreateEventStreamRouter = (createEventStreamUseCase: CreateEventStreamUseCase): express.Router => {
  const router = express.Router();

  router.post('/delivery-progresses/streams', toExpressHandler(handler(createEventStreamUseCase)));

  return router;
};
