import { pipe } from 'fp-ts/lib/function';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { NotificationPaymentAttachment } from '../../generated/definitions/NotificationPaymentAttachment';
import { isPreLoadRecord } from '../PreLoadRepository';
import { isUploadToS3Record, matchAnyPreLoadRecord, UploadToS3Record } from '../UploadToS3RecordRepository';

export const atLeastTwoUploadMatchingPreLoadRecordC = pipe(
  R.Do,
  R.apS('preloadRecordList', RA.filterMap(isPreLoadRecord)),
  R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
  R.map(({ preloadRecordList, uploadToS3RecordList }) =>
    pipe(uploadToS3RecordList, RA.filter(matchAnyPreLoadRecord(preloadRecordList)), (records) => RA.size(records) >= 2)
  )
);

export const matchAtLeastOneUploadToS3Record =
  (records: ReadonlyArray<UploadToS3Record>) => (document: NotificationPaymentAttachment) =>
    pipe(
      records,
      RA.exists(
        (record) =>
          document.digests.sha256 === record.input.checksum &&
          document.ref.key === record.input.key &&
          document.ref.versionToken === record.output.returned.toString()
      )
    );
