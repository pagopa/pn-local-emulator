import { flow, pipe, tuple } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import * as R from 'fp-ts/Reader';
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
  NewNotificationRecord,
} from '../NewNotificationRepository';
import {
  hasApplicationPdfAsContentType,
  isPreLoadRecord,
  PreLoadRecord,
  hasUniquePreloadIdx,
  hasSameSha256UsedInPreLoadRecordRequest,
  hasSamePaymentDocumentSha256UsedInPreLoadRecordRequest,
} from '../PreLoadRepository';
import {
  oneRefersToOther,
  isUploadToS3Record,
  UploadToS3Record,
  hasSameDocumentReferenceOfUploadToS3Record,
  hasSamePaymentDocumentReferenceOfUploadToS3Record,
} from '../UploadToS3RecordRepository';
import { existsApiKey } from '../Repository';
import { Checklist } from './types';

const group = {
  name: 'TC-SEND-01 - Send a notification with a payment document',
};

// Request an “upload slot” endpoint
//  expect at least two requests with a payload that produces a 2xx as a response
//      the x-api-key header should be filled
//      for each preloadIdx property expects to be unique within this request
//      the contentType payload’s property match application/pdf
export const preLoadCheck = {
  group,
  name: `Exist at least two upload slot that matches the criteria`,
  eval: flow(
    RA.filterMap(isPreLoadRecord),
    RA.filter(pipe(existsApiKey, P.and(hasUniquePreloadIdx), P.and(hasApplicationPdfAsContentType))),
    RA.chain(({ input }) => input.body),
    (records) => RA.size(records) >= 2
  ),
};

// Upload to S3 endpoint
//  expect a request with a payload that produces a 2xx as a response
//  expect a request that matches the method, secret, key, and url returned in any previous request of step 'Request an “upload slot”’
export const uploadToS3Check = {
  group,
  name: `Exist at least two requests 'Upload to S3' that matches the criteria`,
  eval: pipe(
    R.Do,
    R.apS('preloadRecordList', RA.filterMap(isPreLoadRecord)),
    R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
    R.map(({ preloadRecordList, uploadToS3RecordList }) =>
      pipe(
        RA.comprehension([preloadRecordList, uploadToS3RecordList], tuple, oneRefersToOther),
        (records) => RA.size(records) >= 2
      )
    )
  ),
};

const matchNewNotificationCriteriaAgainstPreviousRecords =
  <T>(getPredicate: (record: NewNotificationRecord) => P.Predicate<T>) =>
  (records: ReadonlyArray<T>): P.Predicate<NewNotificationRecord> =>
  (_: NewNotificationRecord) =>
    pipe(records, RA.some(getPredicate(_)));

export const createNotificationRequestCheck = {
  group,
  name: 'Expect a send notification request that matches all the criteria',
  eval: pipe(
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
            // Verify conditions between PreLoadRecord and NewNotificationRecord
            P.and(
              matchNewNotificationCriteriaAgainstPreviousRecords((record) =>
                pipe(
                  hasSameSha256UsedInPreLoadRecordRequest(record),
                  P.and(hasSamePaymentDocumentSha256UsedInPreLoadRecordRequest(record))
                )
              )(preloadRecordList)
            ),
            // Verify conditions between UploadToS3Record and NewNotificationRecord
            P.and(
              matchNewNotificationCriteriaAgainstPreviousRecords((record) =>
                pipe(
                  hasSameDocumentReferenceOfUploadToS3Record(record),
                  P.and(hasSamePaymentDocumentReferenceOfUploadToS3Record(record))
                )
              )(uploadToS3RecordList)
            )
          )
        )
      )
    )
  ),
};

export const sendPaymentNotificationChecklist: Checklist<
  ReadonlyArray<PreLoadRecord | UploadToS3Record | NewNotificationRecord>
> = [preLoadCheck, uploadToS3Check, createNotificationRequestCheck];
