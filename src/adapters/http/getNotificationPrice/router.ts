import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { GetNotificationPriceUseCase } from '../../../useCases/GetNotificationPriceUseCase';

const handler =
  (getNotificationPriceUseCase: GetNotificationPriceUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(getNotificationPriceUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(t.string.decode(req.params.paTaxId)),
      E.ap(t.string.decode(req.params.noticeCode)),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeGetNotificationPriceRouter = (
  getNotificationPriceUseCase: GetNotificationPriceUseCase
): express.Router => {
  const router = express.Router();

  router.get('/delivery/price/:paTaxId/:noticeCode', toExpressHandler(handler(getNotificationPriceUseCase)));

  return router;
};
