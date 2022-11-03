import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { Predicate } from 'fp-ts/lib/Predicate';
import * as P from 'fp-ts/Predicate';
import { AmzChecksumSHA256 } from '../generated/definitions/AmzChecksumSHA256';
import { AmzMetaSecret } from '../generated/definitions/AmzMetaSecret';
import { AmzSdkChecksumAlg } from '../generated/definitions/AmzSdkChecksumAlg';
import { AmzDocumentKey } from '../generated/definitions/AmzDocumentKey';
import { AmzVersionId } from '../generated/definitions/AmzVersionId';
import { Response } from './types';
import { AllRecord, Repository } from './Repository';
import { matchProperties, PreLoadRecord } from './PreLoadRepository';
import { NewNotificationRecord } from './NewNotificationRepository';

export type UploadToS3Record = {
  type: 'UploadToS3Record';
  input: {
    key: AmzDocumentKey;
    checksumAlg?: AmzSdkChecksumAlg;
    secret: AmzMetaSecret;
    checksum: AmzChecksumSHA256;
    computedSha256: string;
  };
  output: Response<200, AmzVersionId>;
};

export const isUploadToS3Record = (record: AllRecord): O.Option<UploadToS3Record> =>
  record.type === 'UploadToS3Record' ? O.some(record) : O.none;

export type UploadToS3RecordRepository = Repository<UploadToS3Record>;

// checks ///////////////////////////////////////////////////////////////////

export const matchAnyPreLoadRecord =
  (preLoadRecordList: ReadonlyArray<PreLoadRecord>) =>
  (uploadToS3Record: UploadToS3Record): boolean =>
    uploadToS3Record.output.statusCode === 200 &&
    pipe(
      preLoadRecordList,
      RA.exists(
        // TODO: Add insert date and check that uploadToS3Record.createdAt is bigger than the one of preLoadRecord
        matchProperties(
          uploadToS3Record.input.checksum,
          uploadToS3Record.input.secret,
          uploadToS3Record.input.key,
          uploadToS3Record.input.computedSha256
        )
      )
    );

export const existsUploadToS3RecordWithSameVersionToken =
  (versionToken: string | undefined): Predicate<UploadToS3Record> =>
  (record: UploadToS3Record) =>
    record.output.returned.toString() === versionToken;

export const existsUploadToS3RecordWithSameDocumentKey =
  (documentKey: string | undefined): Predicate<UploadToS3Record> =>
  (uploadToS3Record: UploadToS3Record) =>
    uploadToS3Record.input.key === documentKey;

export const hasSameDocumentReferenceOfUploadToS3Record =
  (newNotificationRecord: NewNotificationRecord) =>
  (uploadToS3Record: UploadToS3Record): boolean =>
    pipe(
      newNotificationRecord.input.body.documents,
      RA.every(({ ref }) =>
        pipe(
          uploadToS3Record,
          pipe(
            existsUploadToS3RecordWithSameVersionToken(ref.versionToken),
            P.and(existsUploadToS3RecordWithSameDocumentKey(ref.key))
          )
        )
      )
    );

export const hasSamePaymentDocumentReferenceOfUploadToS3Record =
  (newNotificationRecord: NewNotificationRecord) =>
  (uploadToS3Record: UploadToS3Record): boolean =>
    pipe(
      newNotificationRecord.input.body.recipients,
      RA.every(({ payment }) =>
        pipe(
          uploadToS3Record,
          pipe(
            existsUploadToS3RecordWithSameVersionToken(payment?.pagoPaForm?.ref.versionToken),
            P.and(existsUploadToS3RecordWithSameDocumentKey(payment?.pagoPaForm?.ref.key))
          )
        )
      )
    );

export const documentsHaveSameReferenceToUploadToS3Records =
  (uploadToS3Record: ReadonlyArray<UploadToS3Record>) => (record: NewNotificationRecord) =>
    pipe(
      uploadToS3Record,
      RA.some(
        pipe(
          hasSameDocumentReferenceOfUploadToS3Record(record),
          P.and(hasSamePaymentDocumentReferenceOfUploadToS3Record(record))
        )
      )
    );
