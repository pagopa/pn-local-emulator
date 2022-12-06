import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { GetLegalFactDownloadMetadataUseCase } from '../../../useCases/GetLegalFactDownloadMetadataUseCase';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';
import { IUN } from '../../../generated/pnapi/IUN';
import { LegalFactCategory } from '../../../generated/pnapi/LegalFactCategory';

const handler =
  (getLegalFactDownloadMetadataUseCase: GetLegalFactDownloadMetadataUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(getLegalFactDownloadMetadataUseCase),
      E.ap(t.string.decode(req.headers['x-api-key'])),
      E.ap(IUN.decode(req.params.iun)),
      E.ap(LegalFactCategory.decode(req.params.legalFactType)),
      E.ap(t.string.decode(req.params.legalFactId)),
      E.map(
        TE.fold(
          () => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeGetLegalFactDocumentRouter = (
  getLegalFactDownloadMetadataUseCase: GetLegalFactDownloadMetadataUseCase
): express.Router => {
  const router = express.Router();

  router.get(
    '/delivery-push/:iun/legal-facts/:legalFactType/:legalFactId',
    toExpressHandler(handler(getLegalFactDownloadMetadataUseCase))
  );

  return router;
};
