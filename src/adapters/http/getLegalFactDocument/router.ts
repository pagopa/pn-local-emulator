import express from 'express';
import * as Apply from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { flow } from 'fp-ts/function';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { makeLegalFactDownloadMetadataRecord } from '../../../domain/LegalFactDownloadMetadataRecord';
import { IUN } from '../../../generated/pnapi/IUN';
import { persistRecord } from '../../../useCases/PersistRecord';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        iun: IUN.decode(req.params.iun),
        legalFactId: t.string.decode(req.params.legalFactId),
      }),
      E.map(flow(makeLegalFactDownloadMetadataRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeGetLegalFactDocumentRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery-push/:iun/download/legal-facts/:legalFactId', toExpressHandler(handler(env)));

  return router;
};
