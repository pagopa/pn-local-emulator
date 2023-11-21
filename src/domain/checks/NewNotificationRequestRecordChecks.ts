import { flow, pipe } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { isNewNotificationRecord } from '../NewNotificationRecord';
import { isUploadToS3Record } from '../UploadToS3Record';
import { PhysicalCommunicationTypeEnum } from '../../generated/pnapi/NewNotificationRequestV21';
import { NotificationPayments } from '../../generated/pnapi/NotificationPayments';
import { matchAtLeastOneUploadToS3Record } from './UploadToS3RecordChecks';

// TODO: This check is replicated on almost each record type, we can
// improve it and create just one check
export const atLeastOneRecordC = RA.exists(flow(isNewNotificationRecord, O.isSome));

export const atLeastOneRegisteredLetter890C = RA.exists(
  flow(
    isNewNotificationRecord,
    O.exists(
      (record) => record.input.body.physicalCommunicationType === PhysicalCommunicationTypeEnum.REGISTERED_LETTER_890
    )
  )
);

export const atLeastOneValidTaxIdC = RA.exists(
  flow(
    isNewNotificationRecord,
    O.exists((record) =>
      pipe(
        record.input.body.recipients,
        RA.every((recipient) => pipe(recipient.taxId, O.fromNullable, O.isSome))
      )
    )
  )
);

export const atLeastOneValidDigitalDomicileC = RA.exists(
  flow(
    isNewNotificationRecord,
    O.exists((record) =>
      pipe(
        record.input.body.recipients,
        RA.every((recipient) => pipe(recipient.digitalDomicile, O.fromNullable, O.isSome))
      )
    )
  )
);

export const atLeastOneValidPhysicalAddressC = RA.exists(
  flow(
    isNewNotificationRecord,
    O.exists((record) =>
      pipe(
        record.input.body.recipients,
        RA.every((recipient) => pipe(recipient.physicalAddress, O.fromNullable, O.isSome))
      )
    )
  )
);

export const atLeastOneValidCreditorTaxIdC = RA.exists(
  flow(
    isNewNotificationRecord,
    O.exists((record) =>
      pipe(
        record.input.body.recipients,
        RA.every(({ payments }) => // Update to 'payments'
          pipe(
            payments as NotificationPayments,
            RA.every(payment => pipe(payment?.pagoPa?.creditorTaxId, O.fromNullable, O.isSome))
          )
        )
      )
    )
  )
);


export const atLeastOneValidNoticeCodeC = RA.exists(
  flow(
    isNewNotificationRecord,
    O.exists((record) =>
      pipe(
        record.input.body.recipients,
        RA.every(( recipient ) => 
          pipe(
            recipient.payments,
            O.fromNullable,
            O.exists((payments) => payments.some(singlePayment => singlePayment.pagoPa?.noticeCode)))
        )
      )
    )
  )
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
              recipient.payments as NotificationPayments,
              RA.exists((payment) =>
                pipe(
                  payment?.pagoPa?.attachment || payment.f24?.metadataAttachment,
                  O.fromNullable,
                  O.exists(matchAtLeastOneUploadToS3Record(uploadToS3RecordList))
                )
              ),
            )
          ),
        )
      ),
    ),
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

export const atLeastOneNotificationSameSenderAndCreatorC = RA.exists(
  flow(
    isNewNotificationRecord,
    O.exists((record) =>
      pipe(
        record.input.body.recipients,
        RA.exists((recipient) =>
          pipe(
            recipient.payments,
            O.fromNullable,
            O.exists((payments) => payments.some(singlePayment => singlePayment.pagoPa?.creditorTaxId === record.input.body.senderTaxId))
          )
        )
      )
    )
  )
);