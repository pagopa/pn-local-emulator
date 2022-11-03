import { flow, pipe } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Reader';
import * as Re from 'fp-ts/Refinement';
import * as RA from 'fp-ts/ReadonlyArray';
import {
  hasPhysicalAddress,
  hasRecipientDigitalDomicile,
  hasRecipientPaymentCreditorTaxId,
  hasRecipientPaymentNoticeCode,
  hasRecipientTaxId,
  hasRegisteredLetterAsPhysicalDocumentType,
  hasSuccessfulResponse,
  isNewNotificationRecord,
} from '../NewNotificationRepository';
import { Group } from '../reportengine/reportengine';
import { documentsHaveSameShaOfPreLoadRecords, isPreLoadRecord } from '../PreLoadRepository';
import { documentsHaveSameReferenceToUploadToS3Records, isUploadToS3Record } from '../UploadToS3RecordRepository';
import { existsApiKey } from '../Repository';

// TODO: This check is replicated on almost each record type, we can
// improve it and create just one check
export const atLeastOneRequest = {
  'Have you done at least one request?': RA.exists(Re.fromOptionK(isNewNotificationRecord)),
};

export const atLeastOneRequestWithValidRecipient = {
  'Have you filled the following properties for every recipients?': Group({
    'Have you filled the property taxId?': RA.exists(flow(isNewNotificationRecord, O.exists(hasRecipientTaxId))),
    'Have you filled the property digitalDomicile?': RA.exists(
      flow(isNewNotificationRecord, O.exists(hasRecipientDigitalDomicile))
    ),
    'Have you filled the property physicalAddress?': RA.exists(
      flow(isNewNotificationRecord, O.exists(hasPhysicalAddress))
    ),
    'Have you filled the following properties for every payment?': Group({
      'Have you filled the property creditorTaxId': RA.exists(
        flow(isNewNotificationRecord, O.exists(hasRecipientPaymentCreditorTaxId))
      ),
      'Have you filled the property noticeCode': RA.exists(
        flow(isNewNotificationRecord, O.exists(hasRecipientPaymentNoticeCode))
      ),
      // FIXME: This check is wrong, it doens't check the correct files
      'Have you filled the property pagoPaForm with the references of a file previously uploaded?': pipe(
        R.Do,
        R.apS('preloadRecordList', RA.filterMap(isPreLoadRecord)),
        R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
        R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
        R.map(({ preloadRecordList, uploadToS3RecordList, newNotificationRecordList }) =>
          pipe(
            newNotificationRecordList,
            RA.exists(
              pipe(
                documentsHaveSameShaOfPreLoadRecords(preloadRecordList),
                P.and(documentsHaveSameReferenceToUploadToS3Records(uploadToS3RecordList))
              )
            )
          )
        )
      ),
    }),
  }),
};

export const atLeastOneRegisteredLetter890 = {
  'Have you provided the value REGISTERED_LETTER_890 for the property physicalCommunicationType?': RA.exists(
    flow(isNewNotificationRecord, O.exists(hasRegisteredLetterAsPhysicalDocumentType))
  ),
};

// FIXME: This check is wrong, it doens't check the correct files
export const atLeastOneRequestWithValidDocuments = {
  'Have you filled the property documents with the references of files previously uploaded?': pipe(
    R.Do,
    R.apS('preloadRecordList', RA.filterMap(isPreLoadRecord)),
    R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
    R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
    R.map(({ preloadRecordList, uploadToS3RecordList, newNotificationRecordList }) =>
      pipe(
        newNotificationRecordList,
        RA.some(
          pipe(
            documentsHaveSameShaOfPreLoadRecords(preloadRecordList),
            P.and(documentsHaveSameReferenceToUploadToS3Records(uploadToS3RecordList))
          )
        )
      )
    )
  ),
};

export const atLeastOneNotificationSent = {
  'Have you created at least one valid notification': pipe(
    R.Do,
    R.apS('preloadRecordList', RA.filterMap(isPreLoadRecord)),
    R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
    R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
    R.map(({ preloadRecordList, uploadToS3RecordList, newNotificationRecordList }) =>
      pipe(
        newNotificationRecordList,
        RA.some(
          pipe(
            existsApiKey,
            P.and(hasRecipientTaxId),
            P.and(hasRecipientDigitalDomicile),
            P.and(hasPhysicalAddress),
            P.and(hasRegisteredLetterAsPhysicalDocumentType),
            P.and(hasRecipientPaymentCreditorTaxId),
            P.and(hasRecipientPaymentNoticeCode),
            P.and(hasSuccessfulResponse),
            P.and(documentsHaveSameShaOfPreLoadRecords(preloadRecordList)),
            P.and(documentsHaveSameReferenceToUploadToS3Records(uploadToS3RecordList))
          )
        )
      )
    )
  ),
};
