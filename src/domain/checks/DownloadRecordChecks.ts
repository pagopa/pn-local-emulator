import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as O from 'fp-ts/Option';
import { GetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { GetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import { DownloadRecord } from '../DownloadRecord';
import { LegalFactDownloadMetadataRecord } from '../LegalFactDownloadMetadataRecord';

export const metadataRecordMatchesDownloadRecordC =
  (downloadRecords: ReadonlyArray<DownloadRecord>) =>
  (
    metadataRecord:
      | GetNotificationDocumentMetadataRecord
      | GetPaymentNotificationMetadataRecord
      | LegalFactDownloadMetadataRecord
  ): boolean =>
    pipe(
      downloadRecords,
      RA.exists(({ input }) =>
        pipe(
          metadataRecord.output.statusCode === 200 ? O.fromNullable(metadataRecord.output.returned.url) : O.none,
          O.exists((metadataRecordUrl) => metadataRecordUrl.endsWith(input.url))
        )
      )
    );
