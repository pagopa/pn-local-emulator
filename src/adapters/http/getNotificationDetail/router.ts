import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { Handler, toExpressHandler } from '../Handler';
import { GetNotificationDetailUseCase } from '../../../useCases/GetNotificationDetailUseCase';
import { IUN } from '../../../generated/pnapi/IUN';
import * as Problem from '../Problem';

const handler =
  (getNotificationDetailUseCase: GetNotificationDetailUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(getNotificationDetailUseCase),
      E.ap(t.string.decode(req.headers['x-api-key'])),
      E.ap(IUN.decode(req.params.iun)),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeGetNotificationDetailRouter = (
  getNotificationDetailUseCase: GetNotificationDetailUseCase
): express.Router => {
  const router = express.Router();

  router.get('/delivery/notifications/sent/:iun', toExpressHandler(handler(getNotificationDetailUseCase)));

  return router;
};
