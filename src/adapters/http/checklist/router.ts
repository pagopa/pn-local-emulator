import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { evaluateReport } from '../../../domain/reportengine/reportengine';
import { report } from '../../../domain/checks/report';
import { SystemEnv } from '../../../useCases/SystemEnv';

const appVersion = '0.14.8';

const handler =
  (env: SystemEnv): Handler =>
  (_, res) =>
    pipe(
      E.of(pipe(env.recordRepository.list(), TE.map(evaluateReport(report(env))))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (result) => T.of(res.status(200).send({ version: appVersion, result }))
        )
      )
    );

export const makeChecklistRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/checklistresult', toExpressHandler(handler(env)));

  return router;
};
