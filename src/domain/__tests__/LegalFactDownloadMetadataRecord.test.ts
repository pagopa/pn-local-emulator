import { IUN } from '../../generated/pnapi/IUN';
import { LegalFactCategoryEnum } from '../../generated/pnapi/LegalFactCategory';
import { makeLogger } from '../../logger';
import { makeLegalFactDownloadMetadataRecord } from '../LegalFactDownloadMetadataRecord';
import * as data from './data';

describe('makeLegalFactDownloadMetadataRecord', () => {
  describe('404 response', () => {
    it('Invalid & different ium', () => {
      const actual = makeLegalFactDownloadMetadataRecord(data.makeTestSystemEnv())({
        apiKey: data.apiKey.valid,
        legalFactId: data.aLegalFactId,
        iun: data.aIun.invalid,
      })([
        data.newNotificationRecordWithIdempotenceToken,
        data.checkNotificationStatusRecord,
        data.checkNotificationStatusRecord,
        data.checkNotificationStatusRecord,
        data.getNotificationDetailRecordAccepted,
      ]);
      expect(actual.output.statusCode).toStrictEqual(404);
    });

    it('Different legalFactId', () => {
      const actual = makeLegalFactDownloadMetadataRecord(data.makeTestSystemEnv())({
        apiKey: data.apiKey.valid,
        legalFactId: 'testLegalFactId',
        iun: data.aIun.valid,
      })([
        data.newNotificationRecordWithIdempotenceToken,
        data.checkNotificationStatusRecord,
        data.checkNotificationStatusRecord,
        data.checkNotificationStatusRecord,
        data.getNotificationDetailRecordAccepted,
      ]);
      expect(actual.output.statusCode).toStrictEqual(404);
    });
  });
});
