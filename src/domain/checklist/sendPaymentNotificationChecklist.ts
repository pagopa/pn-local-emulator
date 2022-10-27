import { flow, pipe } from 'fp-ts/lib/function';
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
} from '../PreLoadRepository';
import { isUploadToS3Record, UploadToS3Record, matchAnyPreLoadRecord } from '../UploadToS3RecordRepository';
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
        uploadToS3RecordList,
        RA.filter(matchAnyPreLoadRecord(preloadRecordList)),
        (records) => RA.size(records) >= 2
      )
    )
  ),
};

// Send notification endpoint
//  expect a request that produces a 2xx as a response
//      the x-api-key header should be filled
export const createNotificationRequestCheck = {
  group,
  name: 'Expect a send notification request that matches all the criteria',
  eval: flow(
    RA.filterMap(isNewNotificationRecord),
    RA.some(
      pipe(
        existsApiKey,
        P.and(hasRecipientTaxId),
        P.and(hasRecipientDigitalDomicile),
        P.and(hasPhysicalAddress),
        P.and(hasRegisteredLetterAsPhysicalDocumentType),
        P.and(hasRecipientPaymentCreditorTaxId),
        P.and(hasRecipientPaymentNoticeCode),
        P.and(hasSuccessfulResponse)
      )
    )
  ),
};

export const sendPaymentNotificationChecklist: Checklist<
  ReadonlyArray<PreLoadRecord | UploadToS3Record | NewNotificationRecord>
> = [preLoadCheck, uploadToS3Check, createNotificationRequestCheck];
