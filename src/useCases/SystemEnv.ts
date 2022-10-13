import { CheckNotificationStatusRecordRepository } from '../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecordRepository } from '../domain/ConsumeEventStreamRecordRepository';
import { GetNotificationDetailRecordRepository } from '../domain/GetNotificationDetailRepository';
import { GetNotificationDocumentMetadataRecordRepository } from '../domain/GetNotificationDocumentMetadataRepository';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { DomainEnv } from '../domain/DomainEnv';

export type SystemEnv = DomainEnv & {
  // repositories
  createNotificationRequestRecordRepository: NewNotificationRepository;
  findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository;
  consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository;
  getNotificationDetailRecordRepository: GetNotificationDetailRecordRepository;
  getNotificationDocumentMetadataRecordRepository: GetNotificationDocumentMetadataRecordRepository;
};
