import express from 'express';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { Handler, toExpressHandler } from '../Handler';
import { GetNotificationDetailUseCase } from '../../../useCases/GetNotificationDetailUseCase';
import { Iun } from '../../../generated/definitions/Iun';
import * as Problem from '../Problem';

const handler =
  (getNotificationDetailUseCase: GetNotificationDetailUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(getNotificationDetailUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(Iun.decode(req.params.iun)),
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
