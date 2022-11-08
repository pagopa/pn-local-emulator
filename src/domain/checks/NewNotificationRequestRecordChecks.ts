import { flow, pipe } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import {
  hasPhysicalAddress,
  hasRecipientDigitalDomicile,
  hasRecipientPaymentCreditorTaxId,
  hasRecipientPaymentNoticeCode,
  hasRecipientTaxId,
  hasRegisteredLetterAsPhysicalDocumentType,
  isNewNotificationRecord,
} from '../NewNotificationRepository';
import { isUploadToS3Record } from '../UploadToS3RecordRepository';
import { matchAtLeastOneUploadToS3Record } from './UploadToS3RecordChecks';

// TODO: This check is replicated on almost each record type, we can
// improve it and create just one check
export const atLeastOneRecordC = RA.exists(flow(isNewNotificationRecord, O.isSome));

export const atLeastOneRegisteredLetter890C = RA.exists(
  flow(isNewNotificationRecord, O.exists(hasRegisteredLetterAsPhysicalDocumentType))
);

export const atLeastOneValidTaxIdC = RA.exists(flow(isNewNotificationRecord, O.exists(hasRecipientTaxId)));

export const atLeastOneValidDigitalDomicileC = RA.exists(
  flow(isNewNotificationRecord, O.exists(hasRecipientDigitalDomicile))
);

export const atLeastOneValidPhysicalAddressC = RA.exists(flow(isNewNotificationRecord, O.exists(hasPhysicalAddress)));

export const atLeastOneValidCreditorTaxIdC = RA.exists(
  flow(isNewNotificationRecord, O.exists(hasRecipientPaymentCreditorTaxId))
);

export const atLeastOneValidNoticeCodeC = RA.exists(
  flow(isNewNotificationRecord, O.exists(hasRecipientPaymentNoticeCode))
);

export const atLeastOneValidPagoPaFormC = pipe(
  R.Do,
  R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
  R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
  R.map(({ uploadToS3RecordList, newNotificationRecordList }) =>
    pipe(
      newNotificationRecordList,
      RA.exists((record) =>
        pipe(
          record.input.body.recipients,
          RA.every((recipient) =>
            pipe(
              O.fromNullable(recipient.payment?.pagoPaForm),
              O.exists(matchAtLeastOneUploadToS3Record(uploadToS3RecordList))
            )
          )
        )
      )
    )
  )
);

export const atLeastOneRequestWithValidDocumentsC = pipe(
  R.Do,
  R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
  R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
  R.map(({ uploadToS3RecordList, newNotificationRecordList }) =>
    pipe(
      newNotificationRecordList,
      RA.exists((record) =>
        pipe(record.input.body.documents, RA.every(matchAtLeastOneUploadToS3Record(uploadToS3RecordList)))
      )
    )
  )
);

export const atLeastOneNotificationSentNoPaymentC = pipe(
  R.Do,
  R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
  R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
  R.map(({ uploadToS3RecordList, newNotificationRecordList }) =>
    pipe(
      newNotificationRecordList,
      RA.exists((record) =>
        pipe(
          [...uploadToS3RecordList, record],
          pipe(
            atLeastOneRegisteredLetter890C,
            P.and(atLeastOneValidTaxIdC),
            P.and(atLeastOneValidDigitalDomicileC),
            P.and(atLeastOneValidPhysicalAddressC),
            P.and(atLeastOneRequestWithValidDocumentsC)
          )
        )
      )
    )
  )
);

export const atLeastOneNotificationSentC = pipe(
  R.Do,
  R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
  R.apS('newNotificationRecordList', RA.filterMap(isNewNotificationRecord)),
  R.map(({ uploadToS3RecordList, newNotificationRecordList }) =>
    pipe(
      newNotificationRecordList,
      RA.exists((record) =>
        pipe(
          [...uploadToS3RecordList, record],
          pipe(
            atLeastOneNotificationSentNoPaymentC,
            P.and(atLeastOneValidCreditorTaxIdC),
            P.and(atLeastOneValidNoticeCodeC),
            P.and(atLeastOneValidPagoPaFormC)
          )
        )
      )
    )
  )
);
