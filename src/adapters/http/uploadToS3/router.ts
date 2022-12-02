import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as Problem from '../Problem';
import { AmzDocumentKey } from '../../../generated/internalapi/AmzDocumentKey';
import { AmzSdkChecksumAlg } from '../../../generated/internalapi/AmzSdkChecksumAlg';
import { AmzMetaSecret } from '../../../generated/internalapi/AmzMetaSecret';
import { AmzChecksumSHA256 } from '../../../generated/internalapi/AmzChecksumSHA256';
import { UploadToS3UseCase } from '../../../useCases/UploadToS3UseCase';
import { Handler, toExpressHandler } from '../Handler';

const handler =
  (uploadToS3UseCase: UploadToS3UseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(uploadToS3UseCase),
      E.ap(t.string.decode(req.url)),
      E.ap(AmzDocumentKey.decode(req.params.key)),
      E.ap(t.union([t.undefined, AmzSdkChecksumAlg]).decode(req.headers['x-amz-sdk-checksum-algorithm'])),
      E.ap(AmzMetaSecret.decode(req.headers['x-amz-meta-secret'])),
      E.ap(AmzChecksumSHA256.decode(req.headers['x-amz-checksum-sha256'])),
      E.ap(E.of(req.body)),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(200).header('x-amz-version-id', _.toString()).send())
        )
      )
    );

export const makeUploadToS3Router = (uploadToS3UseCase: UploadToS3UseCase): express.Router => {
  const router = express.Router();

  router.put('/uploadS3/:key', express.raw({ type: 'application/pdf' }), toExpressHandler(handler(uploadToS3UseCase)));

  return router;
};
