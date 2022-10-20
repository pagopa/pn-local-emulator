import * as RA from 'fp-ts/ReadonlyArray';
import { NewNotificationRecord } from '../NewNotificationRepository';
import { PreLoadRecord } from '../PreLoadRepository';
import { UploadToS3Record } from '../UploadToS3RecordRepository';
import { Checklist } from './types';

const group = {
  name: 'TC-INVIO-01 - Send a notification with a payment document',
};

// Request an “upload slot” endpoint
//  expect at least two requests with a payload that produces a 2xx as a response
//      the x-api-key header should be filled
//      for each preloadIdx property expects to be unique within this request
//      the contentType payload’s property match application/pdf
export const preLoadCheck = {
  group,
  name: `Exist at least two requests 'Request an "upload slot"' that matches the criteria`,
  eval: RA.some(() => true),
};

// Upload to S3 endpoint
//  expect a request with a payload that produces a 2xx as a response
//  expect a request that matches the method, secret, key, and url returned in any previous request of step 'Request an “upload slot”’
export const uploadToS3Check = {
  group,
  name: `Exist at least two requests 'Upload to S3' that matches the criteria`,
  eval: RA.some(() => true),
};

// Send notification endpoint
//  expect a request that produces a 2xx as a response
//      the x-api-key header should be filled
export const createNotificationRequestCheck = {
  group,
  name: 'Expect a send notification request that matches all the criteria',
  eval: RA.some(() => true),
};

export const sendPaymentNotificationChecklist: Checklist<
  ReadonlyArray<PreLoadRecord | UploadToS3Record | NewNotificationRecord>
> = [preLoadCheck, uploadToS3Check, createNotificationRequestCheck];
