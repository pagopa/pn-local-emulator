import express from 'express';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { NotificationRequestId } from '../../../generated/definitions/NotificationRequestId';
import { PaProtocolNumber } from '../../../generated/definitions/PaProtocolNumber';
import { IdempotenceToken } from '../../../generated/definitions/IdempotenceToken';
import { CheckNotificationStatusUseCase } from '../../../useCases/CheckNotificationStatusUseCase';

const checkNotificationStatusInputType = t.union([
  t.strict({
    notificationRequestId: NotificationRequestId,
  }),
  t.strict({
    paProtocolNumber: PaProtocolNumber,
    idempotenceToken: t.union([t.undefined, IdempotenceToken]),
  }),
]);

const checkNotificationStatusHandler =
  (checkNotificationStatusUseCase: CheckNotificationStatusUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(checkNotificationStatusUseCase),
      E.ap(t.string.decode(req.headers['x-api-key'])),
      E.ap(
        checkNotificationStatusInputType.decode({
          notificationRequestId: req.query.notificationRequestId,
          paProtocolNumber: req.query.paProtocolNumber,
          idempotenceToken: req.query.idempotenceToken,
        })
      ),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeNotificationStatusRouter = (
  checkNotificationStatusUseCase: CheckNotificationStatusUseCase
): express.Router => {
  const router = express.Router();

  router.get('/delivery/requests', toExpressHandler(checkNotificationStatusHandler(checkNotificationStatusUseCase)));

  return router;
};
