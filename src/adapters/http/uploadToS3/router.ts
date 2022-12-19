import crypto from 'crypto';
import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as Apply from 'fp-ts/Apply';
import { constant, flow } from 'fp-ts/lib/function';
import * as Problem from '../Problem';
import { AmzDocumentKey } from '../../../generated/api/AmzDocumentKey';
import { AmzSdkChecksumAlg } from '../../../generated/api/AmzSdkChecksumAlg';
import { AmzMetaSecret } from '../../../generated/api/AmzMetaSecret';
import { AmzChecksumSHA256 } from '../../../generated/api/AmzChecksumSHA256';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { makeUploadToS3Record } from '../../../domain/UploadToS3Record';
import { persistRecord } from '../../../useCases/PersistRecord';

const computeSha256 = (bytes: Buffer) => crypto.createHash('sha256').update(bytes).digest('base64');

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        url: t.string.decode(req.url),
        key: AmzDocumentKey.decode(req.params.key),
        checksumAlg: t.union([t.undefined, AmzSdkChecksumAlg]).decode(req.headers['x-amz-sdk-checksum-algorithm']),
        secret: AmzMetaSecret.decode(req.headers['x-amz-meta-secret']),
        checksum: AmzChecksumSHA256.decode(req.headers['x-amz-checksum-sha256']),
        computedSha256: E.of(computeSha256(req.body)),
      }),
      E.map(flow(makeUploadToS3Record(env), constant, persistRecord(env))),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(200).header('x-amz-version-id', _.toString()).send())
        )
      )
    );

export const makeUploadToS3Router = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.put(
    '/uploadS3/:key',
    express.raw({ type: 'application/pdf', limit: '100mb' }),
    toExpressHandler(handler(env))
  );

  return router;
};
