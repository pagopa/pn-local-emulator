import { CheckNotificationStatusRecordRepository } from '../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecordRepository } from '../domain/ConsumeEventStreamRecordRepository';
import { GetNotificationDetailRecordRepository } from '../domain/GetNotificationDetailRepository';
import { GetNotificationDocumentMetadataRecordRepository } from '../domain/GetNotificationDocumentMetadataRepository';
import { GetPaymentNotificationMetadataRecordRepository } from '../domain/GetPaymentNotificationMetadataRecordRepository';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { DomainEnv } from '../domain/DomainEnv';
import { PreLoadRecordRepository } from '../domain/PreLoadRepository';
import { UploadToS3RecordRepository } from '../domain/UploadToS3RecordRepository';

export type SystemEnv = DomainEnv & {
  // repositories
  preLoadRecordRepository: PreLoadRecordRepository;
  uploadToS3RecordRepository: UploadToS3RecordRepository;
  createNotificationRequestRecordRepository: NewNotificationRepository;
  findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository;
  consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository;
  getNotificationDetailRecordRepository: GetNotificationDetailRecordRepository;
  getNotificationDocumentMetadataRecordRepository: GetNotificationDocumentMetadataRecordRepository;
  getPaymentNotificationMetadataRecordRepository: GetPaymentNotificationMetadataRecordRepository;
};
